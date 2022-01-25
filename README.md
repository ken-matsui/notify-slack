# notify-slack

Send various notifications from GitHub to Slack.

## Description

Reviewers
* requested review
* pr & issue mention

Developers
* review
  * approved
  * changes requested
  * commented
* pr & issue mention

## Configuration

### How to obtain OAuth token of Slack App

1. Go to [Your Apps](https://api.slack.com/apps)
2. Click the Create New App
3. Input App Name and Development Slack Workspace
4. Select Permissions in Add features and functionality
5. Add `chat:write:bot` in Permission Scopes
6. Create a token
7. Copy the OAuth access token

### How to find a Slack user ID

See https://www.workast.com/help/articles/61000165203/.

### `userlist.toml`

`.github/userlist.toml`

```toml
[[users]]
github = "ken-matsui"
slack = "UXXXXXXXXXX"
```

## Usage

### Workflow file

`.github/workflows/notify-slack.yml`

```yaml
name: GitHub Notification

on:
  pull_request:
    types: [review_requested, closed]
  pull_request_review:
    types: [submitted]
  issue_comment:
  pull_request_review_comment:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - uses: ken-matsui/notify-slack@main
        with:
          slack_oauth_access_token: ${{ secrets.SLACK_OAUTH_ACCESS_TOKEN }}
```

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
