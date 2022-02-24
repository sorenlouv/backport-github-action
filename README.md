# Backport Github Action

See [Backport documentation](https://github.com/sqren/backport) for all configuration options.

**Example usage**

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
        uses: sqren/backport-github-action@v7.3.1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Backport log
        run: cat /home/runner/.backport/backport.log
          
```
