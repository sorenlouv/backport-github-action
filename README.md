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
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_dispatch.ref }}
          sparse-checkout: .backportrc.json
          sparse-checkout-cone-mode: false
      - name: Backport Action
        uses: sorenlouv/backport-github-action@v9.5.1
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

