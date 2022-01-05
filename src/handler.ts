import * as core from '@actions/core'
import {Config} from './types'
import Slack from './slack'
import {WebhookPayload} from '@actions/github/lib/interfaces'
import {parseMentionComment} from './utils'

async function handlePullRequestEvent(
  payload: WebhookPayload,
  slackApiToken: string,
  config: Config
): Promise<void> {
  const slack = new Slack(slackApiToken)
  const action = payload.action
  const pullRequestAuthor = payload.pull_request?.user.login

  if (action === 'review_requested') {
    const requestedReviewer = payload.requested_reviewer.login
    await slack.postMessage(requestedReviewer, payload, 'requestReview', config)

    // Pull Requestの作成者とReview Requestの送信者が同じ場合のみ、
    // Jiraチケットのリマインドを送信する。
    if (pullRequestAuthor === payload.sender?.login) {
      await slack.postMessage(
        pullRequestAuthor,
        payload,
        'requestReviewForAuthor',
        config
      )
    }
  } else if (action === 'closed' && payload.pull_request?.merged) {
    await slack.postMessage(pullRequestAuthor, payload, 'merged', config)
  } else {
    core.info(`${action} action was not hooked`)
    return
  }

  core.info('Pull request event processing has been completed')
}

async function handlePullRequestReviewEvent(
  payload: WebhookPayload,
  slackApiToken: string,
  config: Config
): Promise<void> {
  const slack = new Slack(slackApiToken)

  // まずは、メンションがあれば、それを通知する。
  const comment = parseMentionComment(payload.review.body)
  for (const mentionUser of comment.mentionUsers) {
    await slack.postMessage(
      mentionUser,
      payload,
      'reviewMentionComment',
      config
    )
  }

  // PRのAuthorには、レビューコメントの全てをメンションする。（本人自身のレビューコメント以外）
  // また、メンションが既にされている場合は無視する。
  const reviewer = payload.review.user.login
  const author = payload.pull_request?.user.login
  if (!comment.mentionUsers.includes(author) && reviewer !== author) {
    await slack.postMessage(author, payload, 'reviewComment', config)
  }

  core.info('Pull request review event processing has been completed')
}

async function handleIssueEvent(
  payload: WebhookPayload,
  slackApiToken: string,
  config: Config
): Promise<void> {
  const slack = new Slack(slackApiToken)
  const action = payload.action

  // || action === 'edited'
  if (action === 'created') {
    const comment = parseMentionComment(payload.comment?.body)
    for (const mentionUser of comment.mentionUsers) {
      await slack.postMessage(mentionUser, payload, 'mentionComment', config)
    }
    core.info('Issue event processing has been completed')
  } else {
    core.info(`${action} action was not hooked`)
  }
}

export async function handleEvent(
  githubEvent: string,
  payload: WebhookPayload,
  slackApiToken: string,
  config: Config
): Promise<void> {
  if (githubEvent === 'pull_request') {
    await handlePullRequestEvent(payload, slackApiToken, config)
  } else if (githubEvent === 'pull_request_review') {
    await handlePullRequestReviewEvent(payload, slackApiToken, config)
  } else if (
    githubEvent === 'issue_comment' ||
    githubEvent === 'pull_request_review_comment'
  ) {
    await handleIssueEvent(payload, slackApiToken, config)
  } else {
    core.info(`event of type ${githubEvent} was ignored.`)
  }
}
