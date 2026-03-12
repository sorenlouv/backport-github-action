# Release process for backport-github-action

This document describes how to release a new version of `backport-github-action` and validate it end-to-end. It is intended for both humans and coding agents.

## Prerequisites

- Write access to [sorenlouv/backport-github-action](https://github.com/sorenlouv/backport-github-action)
- Write access to [backport-org/backport-demo](https://github.com/backport-org/backport-demo) (used for validation)
- `gh` CLI authenticated with appropriate permissions
- Node.js >= 20 and `yarn` installed locally

## Step 1: Update the backport dependency

Check the latest version of `backport` on npm:

```bash
npm view backport version
```

In `package.json`, update both:
- `"version"` (top-level) to match the new backport version
- `"backport"` (under `dependencies`) to the new version

In `README.md`, update the action version reference in the usage example:

```yaml
uses: sorenlouv/backport-github-action@v<NEW_VERSION>
```

## Step 2: Install and build

```bash
yarn install
yarn build
```

This runs `ncc build src/index.ts -o dist`, which bundles the action into `dist/index.js`.

## Step 3: Commit, tag, and push

```bash
git add package.json yarn.lock dist/ README.md
git commit -m "Update backport to <NEW_VERSION>"
git tag v<NEW_VERSION>
git push origin main --tags
```

Note: The repo has pre-commit hooks that run linting and tests, then rebuild `dist/` and auto-amend the commit. Expect two commits to appear (the hooks handle this).

## Step 4: Create a GitHub release

```bash
gh release create v<NEW_VERSION> \
  --title "v<NEW_VERSION>" \
  --notes "Update backport to <NEW_VERSION>"
```

## Step 5: Validate using the demo repo

The demo repo [backport-org/backport-demo](https://github.com/backport-org/backport-demo) is used to validate that the action works in a real GitHub Actions workflow.

### 5a. Update the demo repo workflow

Update `.github/workflows/backport.yml` in `backport-org/backport-demo` to reference the new version:

```bash
# Get the current file SHA
SHA=$(gh api repos/backport-org/backport-demo/contents/.github/workflows/backport.yml --jq '.sha')

# Prepare the updated workflow content (update the version in the `uses:` line)
# Then push it via the GitHub Contents API:
gh api repos/backport-org/backport-demo/contents/.github/workflows/backport.yml \
  -X PUT \
  -f message="Update backport-github-action to v<NEW_VERSION>" \
  -f content="<BASE64_ENCODED_CONTENT>" \
  -f sha="$SHA" \
  -f branch="master"
```

The workflow file should contain:

```yaml
on:
  pull_request_target:
    types: ["labeled", "closed"]

jobs:
  backport:
    name: Backport PR
    runs-on: ubuntu-latest
    steps:
      - name: Backport Action
        uses: sorenlouv/backport-github-action@v<NEW_VERSION>
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          auto_backport_label_prefix: auto-backport-to-

      - name: Info log
        if: ${{ success() }}
        run: cat /home/runner/.backport/backport.info.log

      - name: Debug log
        if: ${{ failure() }}
        run: cat /home/runner/.backport/backport.debug.log
```

### 5b. Create a test PR

Create a branch, add a test file, and open a PR with the `auto-backport-to-production` label:

```bash
# Get the latest master SHA
MASTER_SHA=$(gh api repos/backport-org/backport-demo/git/ref/heads/master --jq '.object.sha')

# Create a test branch
gh api repos/backport-org/backport-demo/git/refs \
  -X POST \
  -f ref="refs/heads/test-v<NEW_VERSION>" \
  -f sha="$MASTER_SHA"

# Add a test file
echo "Test v<NEW_VERSION> - $(date -u +%Y-%m-%d)" | base64 | xargs -I{} \
gh api repos/backport-org/backport-demo/contents/test-v<NEW_VERSION>.md \
  -X PUT \
  -f message="Add test file for v<NEW_VERSION> validation" \
  -f content="{}" \
  -f branch="test-v<NEW_VERSION>"

# Open PR with backport label
gh pr create \
  --repo backport-org/backport-demo \
  --head "test-v<NEW_VERSION>" \
  --base master \
  --title "Test backport-github-action v<NEW_VERSION>" \
  --body "Validation PR for backport-github-action v<NEW_VERSION> release." \
  --label "auto-backport-to-production"
```

### 5c. Merge and verify

```bash
gh pr merge <PR_NUMBER> --repo backport-org/backport-demo --squash --admin
```

After merging, the `pull_request_target` workflow triggers on the `closed` event. Wait 30-60 seconds, then verify:

```bash
# Check the workflow run succeeded
gh run list --repo backport-org/backport-demo --limit 3 \
  --json databaseId,status,conclusion,headBranch

# Check that a backport PR was created targeting `production`
gh pr list --repo backport-org/backport-demo --state open \
  --json number,title,baseRefName,headRefName
```

**Expected result:** A new PR titled `[production] <original PR title>` targeting the `production` branch, with the `backport` label.

### Troubleshooting

If the workflow fails with "no branches to backport to":
1. Verify the PR has the `auto-backport-to-production` label
2. This can happen due to a race condition on the `labeled` event (triggered before merge). The `closed` event run should succeed. If not, re-run it:
   ```bash
   gh run rerun <RUN_ID> --repo backport-org/backport-demo
   ```
3. Check the debug log in the workflow run output for details

## Demo repo details

- **Repo:** [backport-org/backport-demo](https://github.com/backport-org/backport-demo)
- **Default branch:** `master`
- **Target branches:** `master`, `production`, `staging`
- **Backport label prefix:** `auto-backport-to-` (e.g., `auto-backport-to-production` backports to the `production` branch)
- **Config:** `.backportrc.json` with `autoMerge: true` and `autoMergeMethod: squash`
