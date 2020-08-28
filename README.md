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
    runs-on: ubuntu-18.04
    name: Backport
    steps:
      - name: Backport
        uses: sqren/backport-github-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```
