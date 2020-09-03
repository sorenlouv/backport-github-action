How to use:

Add the following to `.github/workflows`

```yml
name: Backport
on:
  pull_request:
    types:
      - closed
      - labeled

jobs:
  backport:
    name: Backport Action
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          repository: 'sqren/backport-github-action'
      - run: yarn
      - run: yarn tsc
      - uses: sqren/backport-github-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```
