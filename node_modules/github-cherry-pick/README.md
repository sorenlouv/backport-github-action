[![npm version](https://img.shields.io/npm/v/github-cherry-pick.svg)](https://npmjs.org/package/github-cherry-pick) [![build status](https://img.shields.io/circleci/project/github/tibdex/github-cherry-pick.svg)](https://circleci.com/gh/tibdex/github-cherry-pick)

# Goal

`github-cherry-pick` cherry-picks several commits on a branch using [the low level Git Data operations provided by the GitHub REST API](https://developer.github.com/v3/git/).

It's the building block of [`github-backport`](https://www.npmjs.com/package/github-backport) and [`github-rebase`](https://www.npmjs.com/package/github-rebase).

# Usage

```javascript
import { cherryPickCommits } from "github-cherry-pick";

const example = async () => {
  const newHeadSha = await cherryPickCommits({
    // The SHA list of the commits to cherry-pick.
    // The commits will be cherry-picked in the order they appear in the array.
    // Merge commits are not supported.
    // See https://git-scm.com/docs/git-cherry-pick for more details.
    commits: [
      "8b10a7808f06970232dc1b45a77b47d63641c4f1",
      "f393441512c54435819d1cdd8921c0d566911af3",
    ],
    // The name of the branch/reference on top of which the commits will be cherry-picked.
    head: "awesome-feature",
    // An already authenticated instance of https://www.npmjs.com/package/@octokit/rest.
    octokit,
    // The username of the repository owner.
    owner,
    // The name of the repository.
    repo,
  });
};
```

`github-cherry-pick` can run on Node.js and in recent browsers.

## Troubleshooting

`github-cherry-pick` uses [`debug`](https://www.npmjs.com/package/debug) to log helpful information at different steps of the cherry-picking process.
To enable these logs, set the `DEBUG` environment variable to `github-cherry-pick`.

# How it Works

The GitHub REST API doesn't provide a direct endpoint for cherry-picking commits on a branch but it does provide lower level Git operations such as:

- merging one branch on top of another one
- creating a commit from a Git tree
- creating/updating/deleting references

It turns out that's all we need to perform a cherry-pick!

## Step by Step

Let's say we have this Git state:

<!--
touch A.txt B.txt C.txt D.txt E.txt
git init
git add A.txt
git commit --message A
git checkout -b feature
git checkout master
git add B.txt
git commit --message B
git checkout feature
git add C.txt
git commit --message C
git add D.txt
git commit --message D
git add E.txt
git commit --message E
git checkout master
-->

```
* 4620c9b (feature) E
* 317c828 D
* 7599421 C
| * 00ad8d7 (HEAD -> master) B
|/
* 72cc07d A
```

and we want to cherry-pick `317c828` and `4620c9b` on the `master` branch.

`github-cherry-pick` would then take the following steps:

1.  Create a `temp` branch from `master` with [POST /repos/:owner/:repo/git/refs](https://developer.github.com/v3/git/refs/#create-a-reference).
    <!--
    git checkout -b temp
    -->
    ```
    * 4620c9b (feature) E
    * 317c828 D
    * 7599421 C
    | * 00ad8d7 (HEAD -> temp, master) B
    |/
    * 72cc07d A
    ```
2.  Create a commit from the tree of `00ad8d7` with `7599421` as parent with [POST /repos/:owner/:repo/git/commits](https://developer.github.com/v3/git/commits/#create-a-commit) and update `temp`'s reference to point to this new commit with [PATCH /repos/:owner/:repo/git/refs/:ref](https://developer.github.com/v3/git/refs/#update-a-reference).
    <!--
    git cat-file -p 00ad8d7
    git commit-tree 7f89cd8 -p 7599421 -m "Use tree of 00ad8d7"
    git update-ref HEAD 80c410e
    -->
    ```
    * 80c410e (HEAD -> temp) Use tree of 00ad8d7
    | * 4620c9b (feature) E
    | * 317c828 D
    |/
    * 7599421 C
    | * 00ad8d7 (master) B
    |/
    * 72cc07d A
    ```
3.  Merge `317c828` on `temp` with [POST /repos/:owner/:repo/merges](https://developer.github.com/v3/repos/merging/#perform-a-merge).
    <!--
    git merge 317c828
    -->
    ```
    *   55a7299 (HEAD -> temp) Merge commit '317c828' into temp
    |\
    * | 80c410e Tree of 00ad8d7 with 7599421 as parent
    | | * 4620c9b (feature) E
    | |/
    | * 317c828 D
    |/
    * 7599421 C
    | * 00ad8d7 (master) B
    |/
    * 72cc07d A
    ```
4.  Create another commit from `55a7299` with `00ad8d7` as the only parent and update `temp`'s reference to point to this new commit.
    <!--
    git cat-file -p 55a7299
    git commit-tree 9b3f8f6 -p 00ad8d7 -m D
    git update-ref HEAD 3698031
    -->
    ```
    * 3698031 (HEAD -> temp) D
    * 00ad8d7 (master) B
    | * 4620c9b (feature) E
    | * 317c828 D
    | * 7599421 C
    |/
    * 72cc07d A
    ```
5.  Repeat steps 2. and 3. to cherry-pick `4620c9b` on `temp`.
    ```
    * d82c247 (HEAD -> temp) E
    * 3698031 D
    * 00ad8d7 (master) B
    | * 4620c9b (feature) E
    | * 317c828 D
    | * 7599421 C
    |/
    * 72cc07d A
    ```
6.  Set `master`'s reference to the same as `temp` with [PATCH /repos/:owner/:repo/git/refs/:ref](https://developer.github.com/v3/git/refs/#update-a-reference), making sure it's a fast-forward update.
    <!--
    git checkout master
    git merge temp --ff-only
    -->
    ```
    * d82c247 (HEAD -> master, temp) E
    * 3698031 D
    * 00ad8d7 B
    | * 4620c9b (feature) E
    | * 317c828 D
    | * 7599421 C
    |/
    * 72cc07d A
    ```
7.  Delete the `temp` branch with [DELETE /repos/:owner/:repo/git/refs/:ref](https://developer.github.com/v3/git/refs/#delete-a-reference) and we're done!
    <!--
    git branch --delete temp
    -->
    ```
    * d82c247 (HEAD -> master) E
    * 3698031 D
    * 00ad8d7 B
    | * 4620c9b (feature) E
    | * 317c828 D
    | * 7599421 C
    |/
    * 72cc07d A
    ```

## Atomicity

`github-cherry-pick` is atomic.
It will either successfully cherry-pick all the given commits on the specified branch or let the branch untouched if one commit could not be cherry picked or if the branch reference changed while the cherry-picking was happening.
There are [tests](tests/index.test.js) for it.
