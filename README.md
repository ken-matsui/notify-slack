# notify-slack

Send various notifications from GitHub to Slack.

## Message Examples on Slack

### All (specified in `userlist.toml`) users
* Received a mention on a PR or an issue
  * :speech_balloon: ken-matsui-developer mentioned you on **ken-matsui/notify-slack #1**<br/>
    > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F26405363%3Fv%3D4" width="15" height="15" /> **ken-matsui-developer**<br/>
    > [Comment on #1 Testing Notifications](https://github.com/ken-matsui/notify-slack/pull/1#issue-1054118774)<br/>
    > @ken-matsui-reviewer<br/>
    > Hi, I am testing notifications using ken-matsui/notify-slack.<br/>
    > Please let me know if you receive any notification on Slack.<br/>
    > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png" width="15" height="15" /> [ken-matsui/notify-slack](https://github.com/ken-matsui/notify-slack) | Jan 6th

### Reviewers
* Received a review request
  * :white_check_mark: ken-matsui-developer requested your review on **ken-matsui/notify-slack #1**
    > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F26405363%3Fv%3D4" width="15" height="15" /> **ken-matsui-developer**<br/>
    > [#1 Testing Notifications](https://github.com/ken-matsui/notify-slack/pull/1)<br/>
    > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png" width="15" height="15" /> [ken-matsui/notify-slack](https://github.com/ken-matsui/notify-slack) | Jan 6th

### Developers
* Requested a review
  * :white_check_mark: You requested ken-matsui-reviewer's review on **ken-matsui/notify-slack #1**<br/>
    Please mark the related ticket(s) as **REVIEW**
    > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F26405363%3Fv%3D4" width="15" height="15" /> **ken-matsui-developer**<br/>
    > [#1 Testing Notifications](https://github.com/ken-matsui/notify-slack/pull/1)<br/>
    > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png" width="15" height="15" /> [ken-matsui/notify-slack](https://github.com/ken-matsui/notify-slack) | Jan 6th
* A reviewer has (on a developer's PR):
  * approved
    * :tada: ken-matsui-reviewer approved your pull request on **ken-matsui/notify-slack #1**
      > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F26405363%3Fv%3D4" width="15" height="15" /> **ken-matsui-developer**<br/>
      > [Approval on #1 Testing Notifications](https://github.com/ken-matsui/notify-slack/pull/1)<br/>
      > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png" width="15" height="15" /> [ken-matsui/notify-slack](https://github.com/ken-matsui/notify-slack) | Jan 6th
  * requested changes
    * :bulb: ken-matsui-reviewer requested changes on your pull request on **ken-matsui/notify-slack #1**<br/>
      Please mark the related ticket(s) as **IN PROGRESS**
      > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F26405363%3Fv%3D4" width="15" height="15" /> **ken-matsui-developer**<br/>
      > [Requested Changes #1 Testing Notifications](https://github.com/ken-matsui/notify-slack/pull/1)<br/>
      > I would prefer the first line to be like the following.<br/>
      > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png" width="15" height="15" /> [ken-matsui/notify-slack](https://github.com/ken-matsui/notify-slack) | Jan 6th
  * commented
    * :speech_balloon: ken-matsui-reviewer commented on your pull request on **ken-matsui/notify-slack #1**<br/>
      > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F26405363%3Fv%3D4" width="15" height="15" /> **ken-matsui-developer**<br/>
      > [Comment on #1 Testing Notifications](https://github.com/ken-matsui/notify-slack/pull/1)<br/>
      > Is this a typo?<br/>
      > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png" width="15" height="15" /> [ken-matsui/notify-slack](https://github.com/ken-matsui/notify-slack) | Jan 6th
* Developer's PR has been merged
  * :white_check_mark: ken-matsui-reviewer merged your pull request on **ken-matsui/notify-slack #1**<br/>
    Please mark the related ticket(s) as **DONE**<br/>
    > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F26405363%3Fv%3D4" width="15" height="15" /> **ken-matsui-developer**<br/>
    > [#1 Testing Notifications](https://github.com/ken-matsui/notify-slack/pull/1)<br/>
    > <img src="https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png" width="15" height="15" /> [ken-matsui/notify-slack](https://github.com/ken-matsui/notify-slack) | Jan 6th

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

## Contributing

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

<!--
Run the tests :heavy_check_mark:
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```
-->

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
