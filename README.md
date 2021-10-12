# action-deploy

Github action for deploy blocklet to abtnode

Example workflow

```yml
on:
  push:
    # Sequence of patterns matched against refs/tags
    tags:
      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10

name: Deploy Blocklet

jobs:
  Deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Build
        run: <build_your_blocklet> # after build, use `abtnode bundle --create-release` to bundle your blocklet
      - name: Deploy blocklet to abtnode
        uses: blocklet/action-deploy@v0.2.0
        with:
          endpoint: ${{ secrets.STAGING_NODE_ENDPOINT }}
          access-key: ${{ secrets.STAGING_NODE_ACCESS_KEY }}
          access-secret: ${{ secrets.STAGING_NODE_ACCESS_SECRET }}
          slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
```
