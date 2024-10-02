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
    if: github.event.pull_request.merged == true && !(contains(github.event.pull_request.labels.*.name, 'backport')) && !(contains(github.event.pull_request.labels.*.name, 'was-backported'))
    runs-on: ubuntu-latest
    steps:
      - name: Check labels
        id: preview_label_check
        uses: docker://agilepathway/pull-request-label-checker:latest
        with:
          allow_failure: true
          prefix_mode: true
          one_of: backport-to-
          repo_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Backport Action
        uses: sorenlouv/backport-github-action@v9.5.1
        if: steps.preview_label_check.outputs.label_check == 'success'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          auto_backport_label_prefix: backport-to-

      - name: Info log
        if: ${{ success() && steps.preview_label_check.outputs.label_check == 'success' }} 
        run: cat ~/.backport/backport.info.log
        
      - name: Debug log
        if: ${{ failure() && steps.preview_label_check.outputs.label_check == 'success' }}
        run: cat ~/.backport/backport.debug.log        
          
```
> Note: The action won't run if the PR contains the labels `backport` or `was-backported`. Also it uses the `pull-request-label-checker` action just to run if the PR contains the `backport-to-` label prefix.

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

