---

## name: release-backport-action
description: Release workflow for backport-github-action. Use when bumping the backport dependency, creating a release, or validating the action in the demo repo.

# Releasing backport-github-action

## Version mapping

Three values in `package.json` must stay in sync: `"version"`, `"backport"` (dependency), and the `uses:` tag in `README.md`.

## Smoke test

`npm run test:e2e` runs the automated smoke test against `backport-org/backport-demo`. It updates the demo workflow, creates and merges test PRs (happy path + no-labels), and verifies results. Pass a branch/tag explicitly: `npm run test:e2e -- v11-beta`.

## Beta release workflow (breaking changes)

Use when a breaking change spans both `backport` and `backport-github-action`. Existing users are never affected: `npm install backport` stays on `latest`, and action users on `@v10` are unaffected.

### Step 1: Publish backport beta

In the `backport` repo: bump version (`npm version premajor --preid beta`), build (`npx tsc -p tsconfig.build.json`), publish (`npm publish --tag beta`).

### Step 2: Wire the action to the beta

Create a feature branch (e.g. `v11-beta`), update `package.json` version and backport dependency to the beta, `npm install`, commit (pre-commit hook builds `dist/`), push. Do NOT merge to `main`.

### Step 3: Test

Run `npm run test:e2e -- v11-beta`.

### Step 4: Promote to stable

1. **backport**: `npm version <major>`, build, `npm publish`
2. **backport-github-action**: update `package.json` + README to stable version, merge beta branch into `main`, tag (`v11` and `v11.0.0`), push tags
3. **demo repo**: update workflow back to stable tag

