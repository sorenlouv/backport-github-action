---
name: release-backport-action
description: Release workflow for backport-github-action. Use when bumping the backport dependency, creating a release, or validating the action in the demo repo.
---

# Releasing backport-github-action

## Version mapping

`package.json` has three values that must stay in sync when bumping:
- `"version"` (top-level) — matches the backport npm version
- `"backport"` (under `dependencies`) — the actual dependency
- `README.md` line 21 — `uses: sorenlouv/backport-github-action@v<VERSION>`

Latest backport version: `npm view backport version`

## Build

Pre-commit hooks (husky) auto-run `yarn ncc build src/index.ts -o dist` and `jest`, then amend the commit with rebuilt `dist/`. No manual build step needed after `git commit`.

## Demo repo for validation

- **Repo:** `backport-org/backport-demo` (default branch: `master`)
- **Branches:** `master`, `production`, `staging`
- **Backport label prefix:** `auto-backport-to-` (e.g. label `auto-backport-to-production` backports to `production`)
- **Config (`.backportrc.json`):** `autoMerge: true`, `autoMergeMethod: squash`
- **Workflow:** `.github/workflows/backport.yml` — update the `uses:` version tag here

### Validation flow

1. Update the demo workflow `uses:` to the new version tag
2. Create a PR in the demo repo with label `auto-backport-to-production`
3. Merge the PR (squash)
4. Verify a backport PR targeting `production` is created automatically
5. Check the Actions run log for success

### Testing new backport features

When bumping to a new backport version, check the [backport changelog](https://github.com/sorenlouv/backport/releases) for new features or behavior changes. Design targeted tests in the demo repo for significant additions.

To create a **conflict scenario** (e.g. testing `autoResolveConflictsWithTheirs`):
1. Add `"autoResolveConflictsWithTheirs": true` to `.backportrc.json` on `master`
2. Create the same file with different content on `production` and `master`
3. Create a PR on `master` that modifies the file, labeled `auto-backport-to-production`
4. Merge — the backport PR should succeed (not abort), its body should mention conflicts were auto-resolved, and auto-merge should be disabled on it
