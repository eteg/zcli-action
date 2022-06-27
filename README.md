# Conectme

Github Action to deploy Zendesk Apps using ZCLI.

## :clipboard: Table of contents

- [Installation]()
- [Usage]()
- [Change the Action]()
- [Change the Code]()
- [Package for distribution]()
- [Create a release branch]()
- [License](#scroll-license)

## :package: Installation

Install the dependencies

```bash
yarn install
```

Run the tests :heavy_check_mark:

```bash
$ yarn test

 PASS  ./index.test.js
  ✓ test runs (95ms)
...
```

## :repeat: Change the Action

The action.yml defines the inputs and output for your action.

Update the action.yml and index.js if you want to make changes to the action.

## :keyboard: Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
const core = require('@actions/core');
...

async function run() {
  try {
      ...
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

## :rocket: Usage

You can now consume the action by referencing the release branch, e.g.: `@v1`

```yaml
uses: eteg/zcli-action@v1
```

This is a complete example of the action usage for development purposes.:

```yaml
name: zcli-action-dev

on:
  push:
    branches: ["develop"]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x]

    env:
      ZENDESK_SUBDOMAIN: ${{ secrets.ZENDESK_SUBDOMAIN_DEV }}
      ZENDESK_EMAIL: ${{ secrets.ZENDESK_EMAIL_DEV }}
      ZENDESK_API_TOKEN: ${{ secrets.ZENDESK_API_TOKEN_DEV }}

    steps:
      - name: Setup Checkout
        uses: actions/checkout@v3

      - name: Setup Node ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
          cache-dependency-path: "./yarn.lock"

      - name: Setup ZCLI
        uses: eteg/zcli-action@v1
        with:
          env: "dev"
```

> NOTE: You must setup env variables in [Github Action Secrets](https://github.com/eteg/conectview/settings/secrets/actions_)

> NOTE: Don't forget to add `env` in `Setup ZCLI`, the env must be exactly `dev` or `prod`.

## :envelope: Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos. Packaging the action will create a packaged action in the dist folder.

Run prepare for distribution

```bash
yarn run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## :exploding_head: Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

Your action is now published! :rocket:

## :scroll: License

This project have no license. You're under no obligation to choose a license. However, without a license, the default copyright laws apply, meaning that you retain all rights to your source code and no one may reproduce, distribute, or create derivative works from your work. Github licensing page.