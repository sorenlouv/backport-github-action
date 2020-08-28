[![npm version](https://img.shields.io/npm/v/github-backport.svg)](https://npmjs.org/package/github-backport) [![build status](https://img.shields.io/circleci/project/github/tibdex/github-backport.svg)](https://circleci.com/gh/tibdex/github-backport)

# Goal

`github-backport` backports a pull request using the GitHub REST API.

See [Backport](https://github.com/tibdex/backport) to backport a pull request by simply commenting it.

# Usage

```javascript
import { backportPullRequest } from "github-backport";

const example = async () => {
  const backportedPullRequestNumber = await backportPullRequest({
    // The branch upon which the backported pull request should be based.
    base: "master",
    // The description to give to the backported pull request.
    // Defaults to: "Backport #{pullRequestNumber}."
    body: givenBody,
    // The name to give to the head branch of the backported pull request.
    // Defaults to: "backport-{pullRequestNumber}-to-{base}"
    head: givenHead,
    // An already authenticated instance of https://www.npmjs.com/package/@octokit/rest.
    octokit,
    // The username of the repository owner.
    owner,
    // The number of the pull request to backport.
    pullRequestNumber: 1337,
    // The name of the repository.
    repo,
    // The title to give to the backported pull request.
    // Defaults to: "[Backport to {base}] {original pull request title}"
    title: givenTitle,
  });
};
```

`github-backport` can run on Node.js and in recent browsers.

## Troubleshooting

`github-backport` uses [`debug`](https://www.npmjs.com/package/debug) to log helpful information at different steps of the backport process. To enable these logs, set the `DEBUG` environment variable to `github-backport`.

# How it Works

Backporting a pull request consists in cherry-picking all its commits to another branch.
The GitHub REST API doesn't provide direct endpoints to backport a pull request or even to cherry-pick commits.
`github-backport` thus relies on [`github-cherry-pick`](https://www.npmjs.com/package/github-cherry-pick) to perform all the relevant cherry-pick operations needed to perform a backport.

## Step by Step

Let's say we have this Git state:

<!--
touch A.txt B.txt C.txt D.txt
git init
git add A.txt
git commit --message A
git checkout -b dev
git add B.txt
git commit --message B
git checkout -b feature
git add C.txt
git commit --message C
git add D.txt
git commit --message D
git checkout master
-->

```
* 0d40af8 (feature) D
* 8a846f6 C
* b3c3b70 (dev) B
* 55356b7 (HEAD -> master) A
```

and a pull request numbered `#1337` where `dev` is the base branch and `feature` the head branch. GitHub would say: "The user wants to merge 2 commits into `dev` from `feature`".

To backport `#1337` to `master`, `github-backport` would then take the following steps:

1.  Find out that `#1337` is composed of `8a846f6` and `0d40af8` with [GET /repos/:owner/:repo/pulls/:number/commits](https://developer.github.com/v3/pulls/#list-commits-on-a-pull-request).
2.  Create a `backport-1337-to-master` branch from `master` with [POST /repos/:owner/:repo/git/refs](https://developer.github.com/v3/git/refs/#create-a-reference).
    <!--
    git checkout -b backport-1337-to-master
    -->
    ```
    * 0d40af8 (feature) D
    * 8a846f6 C
    * b3c3b70 (dev) B
    * 55356b7 (HEAD -> backport-1337-to-master, master) A
    ```
3.  Cherry-pick `8a846f6` and `0d40af8` on `backport-1337-to-master` with [`github-cherry-pick`](https://www.npmjs.com/package/github-cherry-pick).
    <!--
    git cherry-pick 8a846f6 0d40af8
    -->
    ```
    * 1ec51e5 (HEAD -> backport-1337-to-master) D
    * e99200a C
    | * 0d40af8 (feature) D
    | * 8a846f6 C
    | * b3c3b70 (dev) B
    |/
    * 55356b7 (master) A
    ```
4.  Create a pull request where `master` is the base branch and `backport-1337-to-master` the head branch with [POST /repos/:owner/:repo/pulls](https://developer.github.com/v3/pulls/#create-a-pull-request).

## Atomicity

`github-backport` is atomic.
It will either successfully cherry-pick all the commits and create the backported pull request or delete the head branch created at the beginning of the backport process.
There are [tests](tests/index.test.js) for it.
