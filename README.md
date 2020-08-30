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
    name: Backport Action
    steps:
      - name: Backport
        id: backport
        uses: sqren/backport-github-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
      - name: Get the output time
        run: echo "The time was ${{ steps.backport.outputs.time }}"
```
