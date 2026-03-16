# Backport Github Action

## Getting started

Create a file `/.github/workflows/backport.yml` with the following content:

```yml
name: Automatic backport action

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
        uses: sorenlouv/backport-github-action@v11
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          auto_backport_label_prefix: backport-to-

      - name: Info log
        if: ${{ success() }}
        run: cat ~/.backport/backport.info.log
        
      - name: Debug log
        if: ${{ failure() }}
        run: cat ~/.backport/backport.debug.log        
          
```

Now, to backport a pull request, simply apply the label `backport-to-production`. This will automatically backport the PR to the branch called "production" when the PR is merged. 

## Configuration

For more fine grained customization, and for the ability to run the [Backport Tool](https://github.com/sorenlouv/backport) as a CLI tool locally, you should create a `.backportrc.json` file in the root directory:

```js
// .backportrc.json
{
  // example repo info
  "repoOwner": "torvalds",
  "repoName": "linux",

  // `targetBranch` option allows to automatically backport every PR to a specific branch without the need for labels
  "targetBranches": ["production"],

  // the branches available to backport to
  "targetBranchChoices": ["main", "production", "staging"],

  // In this case, adding the label "backport-to-production" will backport the PR to the "production" branch
  "branchLabelMapping": {
    "^backport-to-(.+)$": "$1"
  }
}
```


 See the [Backport Tool documentation](https://github.com/sorenlouv/backport/blob/main/docs/config-file-options.md) for all configuration options.

## Error handling

By default the action ignores `merge-conflict-exception` and `no-branches-exception`. These are the most common "expected" outcomes:

- **`merge-conflict-exception`**: The cherry-pick had conflicts. The backport tool already posts a detailed status comment on the source PR, so a CI failure adds no actionable information.
- **`no-branches-exception`**: The PR has no matching backport labels. This fires on every merged PR that doesn't need backporting, so failing CI would be noise.

All other errors (permissions issues, config errors, GitHub API failures, etc.) will fail the CI job.

You can override this via the `ignore_error_codes` input:

```yml
- name: Backport Action
  uses: sorenlouv/backport-github-action@v11
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    auto_backport_label_prefix: backport-to-
    # fail CI on all errors including merge conflicts
    ignore_error_codes: ""
```

Or ignore additional error codes:

```yml
- name: Backport Action
  uses: sorenlouv/backport-github-action@v11
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    auto_backport_label_prefix: backport-to-
    ignore_error_codes: "merge-conflict-exception,no-branches-exception,auto-merge-not-available-exception"
```

See [`BackportErrorCode` in backport-error.ts](https://github.com/sorenlouv/backport/blob/main/src/lib/backport-error.ts) for the full list of valid error codes.

