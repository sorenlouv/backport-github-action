#!/usr/bin/env bash
set -euo pipefail

REPO="backport-org/backport-demo"
WORKFLOW_PATH=".github/workflows/backport.yml"
TIMESTAMP=$(date +%s)
ACTION_REF="${1:-$(git rev-parse --abbrev-ref HEAD)}"

ORIGINAL_WORKFLOW_SHA=""
declare -a BRANCHES_TO_DELETE
declare -a PRS_TO_CLOSE
TEST_FAILURES=0

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${CYAN}[e2e]${NC} $*"; }
pass() { echo -e "${GREEN}[PASS]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; TEST_FAILURES=$((TEST_FAILURES + 1)); }
wait_msg() { echo -e "${YELLOW}[WAIT]${NC} $*"; }

# ---------------------------------------------------------------------------
# Cleanup — always runs on EXIT
# ---------------------------------------------------------------------------
cleanup() {
  log "Running cleanup..."

  for pr in "${PRS_TO_CLOSE[@]+"${PRS_TO_CLOSE[@]}"}"; do
    [[ -z "$pr" ]] && continue
    log "  Closing PR #${pr}"
    gh pr close --repo "$REPO" "$pr" --delete-branch 2>/dev/null || true
  done

  for branch in "${BRANCHES_TO_DELETE[@]+"${BRANCHES_TO_DELETE[@]}"}"; do
    [[ -z "$branch" ]] && continue
    log "  Deleting branch ${branch}"
    gh api "repos/${REPO}/git/refs/heads/${branch}" -X DELETE 2>/dev/null || true
  done

  if [[ -n "$ORIGINAL_WORKFLOW_SHA" ]]; then
    restore_workflow
  fi

  if [[ $TEST_FAILURES -gt 0 ]]; then
    echo ""
    fail "${BOLD}${TEST_FAILURES} test(s) failed${NC}"
    exit 1
  else
    echo ""
    pass "${BOLD}All tests passed${NC}"
    exit 0
  fi
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
get_master_sha() {
  gh api "repos/${REPO}/git/ref/heads/master" --jq '.object.sha'
}

create_branch() {
  local branch="$1" base_sha="$2"
  gh api "repos/${REPO}/git/refs" \
    -f ref="refs/heads/${branch}" \
    -f sha="$base_sha" \
    --silent
  BRANCHES_TO_DELETE+=("$branch")
}

create_file() {
  local branch="$1" file_path="$2" content="$3" message="$4"
  local encoded
  encoded=$(echo -n "$content" | base64)
  gh api "repos/${REPO}/contents/${file_path}" \
    -X PUT \
    -f message="$message" \
    -f content="$encoded" \
    -f branch="$branch" \
    --silent
}

create_pr() {
  local branch="$1" title="$2"
  shift 2
  local label_args=()
  for label in "$@"; do
    label_args+=(--label "$label")
  done

  local url
  url=$(gh pr create --repo "$REPO" \
    --head "$branch" --base master \
    --title "$title" \
    --body "Automated e2e test — safe to ignore" \
    "${label_args[@]}")

  # gh pr create prints the PR URL; extract the number from it
  echo "$url" | grep -o '[0-9]*$'
}

merge_pr() {
  local pr_number="$1"
  gh pr merge --repo "$REPO" "$pr_number" --squash --admin
}

# Wait for the workflow run triggered by a specific merge commit / PR and
# return its run ID. Polls for up to ~180 seconds.
wait_for_run() {
  local pr_number="$1"
  local run_id=""
  local max_attempts=36
  local attempt=0

  # Get the merge commit SHA to identify the correct run
  local merge_sha
  merge_sha=$(gh pr view --repo "$REPO" "$pr_number" --json mergeCommit --jq '.mergeCommit.oid')

  wait_msg "Waiting for workflow run (PR #${pr_number}, merge ${merge_sha:0:7})..."

  while [[ $attempt -lt $max_attempts ]]; do
    run_id=$(gh run list --repo "$REPO" \
      --workflow backport.yml \
      --limit 10 \
      --json databaseId,headSha,status \
      --jq ".[] | select(.headSha == \"${merge_sha}\") | .databaseId" 2>/dev/null | head -1 || true)

    if [[ -n "$run_id" ]]; then
      break
    fi
    sleep 5
    attempt=$((attempt + 1))
  done

  if [[ -z "$run_id" ]]; then
    fail "No workflow run found for merge commit ${merge_sha:0:7} after ${max_attempts} attempts"
    return 1
  fi

  log "Found run ${run_id}, waiting for completion..."
  gh run watch --repo "$REPO" "$run_id" --exit-status 2>/dev/null && true
  local exit_code=$?

  local conclusion
  conclusion=$(gh run view --repo "$REPO" "$run_id" --json conclusion --jq '.conclusion')
  echo "${conclusion}:${run_id}"
}

# ---------------------------------------------------------------------------
# Workflow file management
# ---------------------------------------------------------------------------
update_workflow() {
  local action_ref="$1"
  log "Updating workflow to use ${BOLD}sorenlouv/backport-github-action@${action_ref}${NC}"

  local file_info
  file_info=$(gh api "repos/${REPO}/contents/${WORKFLOW_PATH}" --jq '{sha: .sha, content: .content}')
  ORIGINAL_WORKFLOW_SHA=$(echo "$file_info" | jq -r '.sha')

  local new_content
  new_content=$(cat <<'WORKFLOW'
on:
  pull_request_target:
    types: ["labeled", "closed"]

jobs:
  backport:
    name: Backport PR
    if: github.event.pull_request.merged == true && !(contains(github.event.pull_request.labels.*.name, 'backport'))
    runs-on: ubuntu-latest
    steps:
      - name: Backport Action
        uses: sorenlouv/backport-github-action@ACTION_REF_PLACEHOLDER
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          auto_backport_label_prefix: auto-backport-to-

      - name: Info log
        if: ${{ success() }}
        run: cat /home/runner/.backport/backport.info.log

      - name: Debug log
        if: ${{ failure() }}
        run: cat /home/runner/.backport/backport.debug.log
WORKFLOW
)
  new_content="${new_content//ACTION_REF_PLACEHOLDER/$action_ref}"

  local encoded
  encoded=$(echo -n "$new_content" | base64)
  gh api "repos/${REPO}/contents/${WORKFLOW_PATH}" \
    -X PUT \
    -f message="e2e: update action to @${action_ref}" \
    -f content="$encoded" \
    -f sha="$ORIGINAL_WORKFLOW_SHA" \
    -f branch=master \
    --silent

  # Update the SHA so restore uses the new one
  ORIGINAL_WORKFLOW_SHA=$(gh api "repos/${REPO}/contents/${WORKFLOW_PATH}" --jq '.sha')
}

restore_workflow() {
  log "Restoring workflow to original version (@v10.4.0)"

  local current_sha
  current_sha=$(gh api "repos/${REPO}/contents/${WORKFLOW_PATH}" --jq '.sha')

  local original_content
  original_content=$(cat <<'WORKFLOW'
on:
  pull_request_target:
    types: ["labeled", "closed"]

jobs:
  backport:
    name: Backport PR
    if: github.event.pull_request.merged == true && !(contains(github.event.pull_request.labels.*.name, 'backport'))
    runs-on: ubuntu-latest
    steps:
      - name: Backport Action
        uses: sorenlouv/backport-github-action@v10.4.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          auto_backport_label_prefix: auto-backport-to-

      - name: Info log
        if: ${{ success() }}
        run: cat /home/runner/.backport/backport.info.log
        
      - name: Debug log
        if: ${{ failure() }}
        run: cat /home/runner/.backport/backport.debug.log        
          
WORKFLOW
)

  local encoded
  encoded=$(echo -n "$original_content" | base64)
  gh api "repos/${REPO}/contents/${WORKFLOW_PATH}" \
    -X PUT \
    -f message="e2e: restore action to @v10.4.0" \
    -f content="$encoded" \
    -f sha="$current_sha" \
    -f branch=master \
    --silent

  ORIGINAL_WORKFLOW_SHA=""
}

# ---------------------------------------------------------------------------
# Test 1: Happy path — auto-backport to production
# ---------------------------------------------------------------------------
test_happy_path() {
  echo ""
  log "${BOLD}Test 1: Happy path — auto-backport to production${NC}"
  log "================================================================"

  local branch="e2e-${TIMESTAMP}"
  local base_sha
  base_sha=$(get_master_sha)

  log "Creating branch ${branch} from ${base_sha:0:7}"
  create_branch "$branch" "$base_sha"

  log "Committing test file"
  create_file "$branch" "e2e-${TIMESTAMP}.md" \
    "# E2E test ${TIMESTAMP}\nThis file validates backport-github-action@${ACTION_REF}" \
    "e2e: add test file for ${ACTION_REF}"

  log "Creating PR with label auto-backport-to-production"
  local pr_number
  pr_number=$(create_pr "$branch" "e2e: test backport to production (${TIMESTAMP})" "auto-backport-to-production")
  log "Created PR #${pr_number}"

  log "Merging PR #${pr_number}"
  merge_pr "$pr_number"

  local run_result
  run_result=$(wait_for_run "$pr_number")
  local conclusion="${run_result%%:*}"
  local run_id="${run_result##*:}"

  if [[ "$conclusion" == "success" ]]; then
    pass "Workflow run #${run_id} succeeded"
  else
    fail "Workflow run #${run_id} concluded with: ${conclusion}"
    log "View logs: gh run view --repo ${REPO} ${run_id} --log"
  fi

  # Check for the backport PR targeting production
  sleep 5
  local backport_prs
  backport_prs=$(gh pr list --repo "$REPO" --state all --base production \
    --search "in:title e2e: test backport to production (${TIMESTAMP})" \
    --json number,title,headRefName,state --jq '.')

  local backport_count
  backport_count=$(echo "$backport_prs" | jq 'length')

  if [[ "$backport_count" -gt 0 ]]; then
    pass "Backport PR to production was created"
    local bp_number
    bp_number=$(echo "$backport_prs" | jq -r '.[0].number')
    local bp_branch
    bp_branch=$(echo "$backport_prs" | jq -r '.[0].headRefName')
    log "  PR #${bp_number} (branch: ${bp_branch})"

    PRS_TO_CLOSE+=("$bp_number")
    BRANCHES_TO_DELETE+=("$bp_branch")
  else
    fail "No backport PR targeting production was found"
  fi
}

# ---------------------------------------------------------------------------
# Test 2: No backport labels — should not fail
# ---------------------------------------------------------------------------
test_no_labels() {
  echo ""
  log "${BOLD}Test 2: No backport labels — action should succeed (not fail CI)${NC}"
  log "================================================================"

  local branch="e2e-nolabel-${TIMESTAMP}"
  local base_sha
  base_sha=$(get_master_sha)

  log "Creating branch ${branch} from ${base_sha:0:7}"
  create_branch "$branch" "$base_sha"

  log "Committing test file"
  create_file "$branch" "e2e-nolabel-${TIMESTAMP}.md" \
    "# E2E no-label test ${TIMESTAMP}\nThis PR has no backport labels." \
    "e2e: add no-label test file"

  log "Creating PR without backport labels"
  local pr_number
  pr_number=$(create_pr "$branch" "e2e: no-label test (${TIMESTAMP})")
  log "Created PR #${pr_number}"

  log "Merging PR #${pr_number}"
  merge_pr "$pr_number"

  local run_result
  run_result=$(wait_for_run "$pr_number")
  local conclusion="${run_result%%:*}"
  local run_id="${run_result##*:}"

  if [[ "$conclusion" == "success" ]]; then
    pass "Workflow run #${run_id} succeeded (no-branches-exception was ignored as expected)"
  else
    fail "Workflow run #${run_id} concluded with: ${conclusion} (expected success)"
    log "View logs: gh run view --repo ${REPO} ${run_id} --log"
  fi

  # Verify no backport PR was created
  sleep 3
  local backport_prs
  backport_prs=$(gh pr list --repo "$REPO" --state all --base production \
    --search "in:title e2e: no-label test (${TIMESTAMP})" \
    --json number --jq 'length')

  if [[ "$backport_prs" -eq 0 ]]; then
    pass "No backport PR was created (as expected)"
  else
    fail "A backport PR was unexpectedly created"
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
echo ""
log "${BOLD}E2E Smoke Test for backport-github-action${NC}"
log "Action ref: ${BOLD}${ACTION_REF}${NC}"
log "Demo repo:  ${REPO}"
log "Timestamp:  ${TIMESTAMP}"
echo ""

update_workflow "$ACTION_REF"
test_happy_path
test_no_labels
