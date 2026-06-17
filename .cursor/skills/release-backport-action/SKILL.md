---
name: release-backport-action
description: How backport-github-action is released. Use when upgrading the backport dependency, cutting a release, or validating the action in the demo repo.
---

# Releasing backport-github-action

Releases are **fully automated**. Every push to `main` runs
[`.github/workflows/release.yml`](../../../.github/workflows/release.yml), which
publishes a new release. There is no manual release script — do not look for
`npm run release`.

## Version mapping

The action mirrors the version of its bundled `backport` dependency:

- A merge that bumps `backport` to `12.1.0` releases the action as **`v12.1.0`**.
- A merge that does **not** change `backport` (an action-only change) reuses the
  current backport version with a revision suffix: **`v12.1.0-1`**, then
  `-2`, and so on. The revision is computed from existing git tags.

So `package.json` `"version"` is the action's own release version, while
`"dependencies.backport"` is the version it ships. For a revision release they
differ on purpose (`version: 12.1.0-1`, `backport: 12.1.0`).

## What the release workflow does

On each push to `main` (skipping its own `chore: release` commit) it:

1. Reads the installed `backport` version and computes the next action version.
2. Sets `package.json` version and rebuilds the committed bundle (`dist/`).
3. Rewrites the `uses: …@vN` snippet in `README.md` to the current major.
4. Commits, tags `vX.Y.Z`, force-moves the floating major tag `vN`, and creates
   the GitHub Release (marked `--latest`).

## Upgrading backport

[Dependabot](../../../.github/dependabot.yml) opens a PR whenever a new
`backport` is published (including minor/patch). Merge it — the workflow releases
the matching action version automatically.

## Smoke test

`npm run test:e2e` runs the smoke test against `backport-org/backport-demo`: it
updates the demo workflow, opens and merges test PRs (happy path + no-labels),
and verifies results. The restore target is derived from `package.json`, so no
manual version edits are needed. Pass a branch/tag explicitly to test a
pre-release: `npm run test:e2e -- v13-beta`.

## Pre-releases / betas

The automated flow only releases stable versions from `main`. A breaking change
that spans both repos is still done manually: publish a `backport` beta (its own
repo handles npm), point a feature branch's `package.json` at the beta, push the
branch (do **not** merge to `main`), and smoke-test it with
`npm run test:e2e -- <branch>`. Promote by merging to `main` once stable.
