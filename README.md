# Backport Github Action

See [Backport documentation](https://github.com/sqren/backport) for all configuration options.

**Example usage**

Create a file `/.github/workflows/backport.yml` with the following content:

```yml
on:
  pull_request_target:
    branches:
      - master
    types:
      - labeled
      - closed

jobs:
  backport:
    name: Backport PR
    if: |
      github.event.pull_request.merged == true
      && contains(github.event.pull_request.labels.*.name, 'auto-backport')
      && (
        (github.event.action == 'labeled' && github.event.label.name == 'auto-backport')
        || (github.event.action == 'closed')
      )
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Actions
        uses: actions/checkout@v2
        with:
          repository: 'elastic/kibana-github-actions'
          ref: main
          path: ./actions

      - name: Install Actions
        run: npm install --production --prefix ./actions

      - name: Run Backport
        uses: ./actions/backport
        with:
          github_token: ${{secrets.GITHUB_TOKEN}}
          commit_user: <YOUR_USERNAME>
          commit_email: <YOUR_EMAIL>
```
