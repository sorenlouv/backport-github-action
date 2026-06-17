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

The action's version mirrors its bundled `backport` dependency: when `backport`
is `12.1.0`, the action is released as **`v12.1.0`** and the floating `v12` tag is
moved to it. A release happens only when the bundled backport version isn't tagged
yet, so an action-only change (no backport bump) ships with the next backport
release rather than getting its own version.

## What the release workflow does

On each push to `main` it:

1. Reads the bundled `backport` version. If `vX.Y.Z` is already tagged, it stops.
2. Sets `package.json` to that version and rebuilds the committed bundle (`dist/`).
3. Commits, tags `vX.Y.Z`, force-moves the major tag `vN`, and creates the GitHub
   Release (`--generate-notes --latest`). Only tags are pushed (never `main`), so
   the built-in `GITHUB_TOKEN` is sufficient.

## Upgrading backport

[Dependabot](../../../.github/dependabot.yml) opens a PR whenever a new
`backport` is published (including minor/patch). Merge it — the workflow releases
the matching action version automatically.

## Manual action-only release

The workflow only releases when the bundled `backport` version isn't tagged yet, so
a fix that touches **only** the action (no `backport` bump) won't release on its own.
To ship one without waiting for the next `backport` release, tag a **revision** of the
current backport version by hand — append `-1`, `-2`, … Do **not** bump the patch
(e.g. `12.0.2`): that would collide with backport's own future `12.0.2`, and the
workflow would then skip releasing it.

```bash
git checkout main && git pull

# Current backport version + the next unused revision suffix.
# 12.0.1 is the released backport version; use -2, -3, … if -1 already exists.
VERSION=12.0.1-1
MAJOR=${VERSION%%.*}

npm version "$VERSION" --no-git-tag-version --allow-same-version
npm run build

git commit -am "chore: release v$VERSION" --no-verify   # local only — main is protected
git tag "v$VERSION"
git tag -f "v$MAJOR"
git push origin "v$VERSION"
git push --force origin "v$MAJOR"
gh release create "v$VERSION" --generate-notes --latest

git reset --hard origin/main   # drop the local release commit; the tag keeps it
```

This is the same shape as the automated release (mirror version → build → tag-only push),
just with a hand-picked `-N` version. The `v12.0.1-1` tag never clashes with the
workflow, which checks for the bare `v12.0.1`.

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
