import * as core from '@actions/core'
import {Config} from './types'
import Slack from './slack'
import {WebhookPayload} from '@actions/github/lib/interfaces'
import {parseMentionComment} from './utils'

async function handlePullRequestEvent(
  payload: WebhookPayload,
  slack: Slack,
  config: Config
): Promise<void> {
  const action = payload.action
  const pullRequestAuthor = payload.pull_request?.user.login
  core.info(`Processing the detected action: '${action}' ...`)

  if (action === 'review_requested') {
    const requestedReviewer = payload.requested_reviewer?.login
    if (requestedReviewer !== undefined) {
      await slack.postMessage(
        requestedReviewer,
        payload,
        'requestReview',
        config
      )
    }

    // Pull Requestの作成者とReview Requestの送信者が同じ場合のみ、
    // Jiraチケットのリマインドを送信する。
    const reviewRequestSender = payload.sender?.login
    if (
      pullRequestAuthor !== undefined &&
      reviewRequestSender !== undefined &&
      pullRequestAuthor === reviewRequestSender
    ) {
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
    core.warning(`${action} action was not hooked`)
    return
  }
}

async function handlePullRequestReviewEvent(
  payload: WebhookPayload,
  slack: Slack,
  config: Config
): Promise<void> {
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
}

async function handleIssueEvent(
  payload: WebhookPayload,
  slack: Slack,
  config: Config
): Promise<void> {
  const action = payload.action
  core.info(`Processing the detected action: '${action}' ...`)

  // || action === 'edited'  TODO: もし、beforeにメンションが無く、afterにあれば、メンションする？
  if (action === 'created') {
    const comment = parseMentionComment(payload.comment?.body)
    for (const mentionUser of comment.mentionUsers) {
      await slack.postMessage(mentionUser, payload, 'mentionComment', config)
    }
  } else {
    core.warning(`${action} action was not hooked`)
  }
}

export type HandlerType = (
  payload: WebhookPayload,
  slack: Slack,
  config: Config
) => Promise<void>

type HandlerList = {readonly [key: string]: HandlerType}

export const handlerList: HandlerList = {
  pull_request: handlePullRequestEvent,
  pull_request_review: handlePullRequestReviewEvent,
  issue_comment: handleIssueEvent,
  pull_request_review_comment: handleIssueEvent
}
