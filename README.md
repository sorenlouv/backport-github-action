# Backport Github Action

## Getting started

Create a file `/.github/workflows/backport.yml` with the following content:

```yml
on:
  pull_request_target:
    types:
      - labeled
      - closed

jobs:
  backport:
    name: Backport PR
    runs-on: ubuntu-latest
    if: |
      github.event.pull_request.merged == true
      && contains(github.event.pull_request.labels.*.name, 'auto-backport')
      && (
        (github.event.action == 'labeled' && github.event.label.name == 'auto-backport')
        || (github.event.action == 'closed')
      )
    steps:
      - name: Backport Action
        uses: sqren/backport-github-action@v7.3.1-1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          autoBackportLabelPrefix: backport-to

      - name: Backport log
        run: cat /home/runner/.backport/backport.log
          
```

Now, to backport a pull request, simply apply the labels `auto-backport` and `backport-to-production`. This will automatically backport the PR to the branch called "production" when the PR is merged. 

## Configuration

For more fine grained customization, and for the ability to run the [Backport Tool](https://github.com/sqren/backport) as a CLI tool locally, you should create a `.backportrc.json` file in the root directory:

```js
// .backportrc.json
{
  // example repo info
  "repoOwner": "torvalds",
  "repoName": "linux",

  // the branches available to backport to
  "targetBranchChoices": ["main", "production", "staging"],

  // In this case, adding the label "backport-to-production" will backport the PR to the "production" branch
  "branchLabelMapping": {
    "^backport-to-(.+)$": "$1"
  }
}
```


 See the [Backport Tool documentation](https://github.com/sqren/backport/blob/main/docs/configuration.md) for all configuration options.

