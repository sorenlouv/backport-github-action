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

Pre-commit hooks (husky) auto-run `npx ncc build src/index.ts -o dist` and `vitest`, then amend the commit with rebuilt `dist/`. No manual build step needed after `git commit`.

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

## Beta release workflow (breaking changes)

When a change spans both `backport` and `backport-github-action` and introduces a breaking change (e.g. new response types, removed fields), use this workflow to validate end-to-end before promoting to stable. This keeps existing users safe: `npm install backport` still returns the stable version, and action users on `@v10` are unaffected.

### Step 1: Publish backport as a beta to npm

In the `backport` repo:

```bash
npm version 11.0.0-beta.0    # (or: npm version premajor --preid beta)
npx tsc --build
npm publish --tag beta
```

Verify the tag:

```bash
npm dist-tag ls backport
# latest: 10.4.0
# beta:   11.0.0-beta.0
```

`npm install backport` still gives users the `latest` tag (stable). Only `npm install backport@beta` or `npm install backport@11.0.0-beta.0` pulls the beta.

### Step 2: Wire the github-action to the beta

In `backport-github-action`:

```bash
git checkout -b v11-beta
```

Update `package.json`:
- `"version"` -> `"11.0.0-beta.0"`
- `"backport"` (under dependencies) -> `"11.0.0-beta.0"`

```bash
npm install          # updates package-lock.json
git add -A && git commit   # pre-commit hook builds dist/ and runs tests
git push -u origin v11-beta
```

The pre-commit hook runs `npx ncc build` which now compiles against the beta types. If it fails, fix the issues before pushing.

### Step 3: Test against the demo repo

In `backport-org/backport-demo`, update `.github/workflows/backport.yml`:

```yaml
uses: sorenlouv/backport-github-action@v11-beta
```

Then run the standard validation flow:

1. Create a PR with label `auto-backport-to-production`
2. Merge the PR
3. Verify a backport PR targeting `production` is created
4. Check the Actions run log for the new response shape and correct behavior

Also test error scenarios:
- **No backport labels**: merge a PR without backport labels. The action should succeed (not fail CI) because `no-branches-exception` is in the default `ignore_error_codes`.
- **Merge conflict**: create a conflict between `master` and `production`, merge a PR that triggers a conflict. The action should succeed because `merge-conflict-exception` is in the default `ignore_error_codes`. The status comment on the source PR should show the conflict details.

### Step 4: Promote to stable

Once the beta is validated:

**backport (npm):**

```bash
cd backport
npm version 11.0.0
npx tsc --build
npm publish              # publishes as "latest"
```

**backport-github-action:**

```bash
cd backport-github-action
# Update package.json: version -> "11.0.0", backport dep -> "11.0.0"
# Update README.md: uses: sorenlouv/backport-github-action@v11
npm install
git checkout main
git merge v11-beta
git add -A && git commit
git push origin main
git tag v11 && git tag v11.0.0
git push origin v11 v11.0.0
```

Update the demo repo workflow back to the stable tag:

```yaml
uses: sorenlouv/backport-github-action@v11
```

### Safety properties

- **npm**: `npm install backport` never resolves to a beta (only `@beta` or explicit version does)
- **Action users**: `@v9` and `@v10` tags are never moved; users are unaffected
- **Rollback**: if beta is broken, don't promote it; `latest` and existing tags remain unchanged
- **Iteration**: publish additional betas (`11.0.0-beta.1`, `beta.2`, ...) with `npm publish --tag beta` as needed
