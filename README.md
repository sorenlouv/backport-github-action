This is a Github Action based on the popular cli tool [`backport`](https://github.com/sqren/backport).

# How to use

Add the backport workflow to `.github/workflows/backport.yml`:

```yml
name: Backport
on:
  pull_request_target:
    types:
      - closed
      - labeled

jobs:
  backport:
    name: Backport Action
    runs-on: ubuntu-latest
    steps:
      - name: Backport
        uses: sqren/backport-github-action@v1
        with:
          # Required
          # Token to authenticate requests. Can be left untouched
          github_token: ${{ secrets.GITHUB_TOKEN }}

          # Required
          # Backport PR by adding a label
          # Example: PRs labeled with "backport-to-branch-a" will be backported to "branch-a"
          backport_by_label: '^backport-to-(.*)$'

          # Optional
          # Backport PR by writing a comment
          # Example: PRs commented with "backport to branch-a" will be backported to "branch-a"
          # backport_by_comment: '^backport to (.*)$'

          # Optional
          # Title for the backport PR
          # Example: [branch-a] My commit msg
          # pr_title: '[{targetBranch}] {commitMessages}'

          # Optional
          # Comma separated list of labels that will be added to the backport PR.
          # target_pr_labels: 'backport'
```

## Related

- [backport cli](https://github.com/sqren/backport)
