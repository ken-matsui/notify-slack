const Slack = require('./slack');
const { parseMentionComment } = require('./utils');

module.exports.handlePullRequestEvent = async (payload, slackApiToken, config) => {
  const slack = new Slack(slackApiToken);
  const action = payload.action;
  const pullRequestAuthor = payload['pull_request']['user']['login'];

  if (action === 'review_requested') {
    const requestedReviewer = payload['requested_reviewer']['login'];
    await slack.postMessage(requestedReviewer, payload, 'requestReview', config);

    // Pull Requestの作成者とReview Requestの送信者が同じ場合のみ、
    // Jiraチケットのリマインドを送信する。
    if (pullRequestAuthor === payload['sender']['login']) {
      await slack.postMessage(
        pullRequestAuthor,
        payload,
        'requestReviewForAuthor',
        config
      );
    }
  } else if (action === 'closed' && payload['pull_request']['merged']) {
    await slack.postMessage(pullRequestAuthor, payload, 'merged', config);
  } else {
    console.log(`${action} action was not hooked`);
  }

  return { message: 'Pull request event processing has been completed' };
};

module.exports.handlePullRequestReviewEvent = async (
  payload,
  slackApiToken,
  config
) => {
  const slack = new Slack(slackApiToken);

  // まずは、メンションがあれば、それを通知する。
  const comment = parseMentionComment(payload['review'].body);
  for (const mentionUser of comment.mentionUsers) {
    await slack.postMessage(mentionUser, payload, 'reviewMentionComment', config);
  }

  // PRのAuthorには、レビューコメントの全てをメンションする。（本人自身のレビューコメント以外）
  // また、メンションが既にされている場合は無視する。
  const reviewer = payload['review']['user']['login'];
  const author = payload['pull_request']['user']['login'];
  if (!comment.mentionUsers.includes(author) && reviewer !== author) {
    await slack.postMessage(author, payload, 'reviewComment', config);
  }

  return { message: 'Pull request review event processing has been completed' };
};

module.exports.handleIssueEvent = async (payload, slackApiToken, config) => {
  const slack = new Slack(slackApiToken);
  const action = payload.action;

  // || action === 'edited'
  if (action === 'created') {
    const comment = parseMentionComment(payload.comment.body);
    for (const mentionUser of comment.mentionUsers) {
      await slack.postMessage(mentionUser, payload, 'mentionComment', config);
    }
  } else {
    console.log(`${action} action was not hooked`);
  }

  return { message: 'Issue event processing has been completed' };
};

module.exports.handleEvent = async (githubEvent, payload, slackApiToken, config) => {
  if (githubEvent === 'pull_request') {
    return handlePullRequestEvent(payload, slackApiToken, config).catch((err) => {
      console.error(err);
    });
  } else if (githubEvent === 'pull_request_review') {
    return handlePullRequestReviewEvent(payload, slackApiToken, config).catch((err) => {
      console.error(err);
    });
  } else if (
    githubEvent === 'issue_comment' ||
    githubEvent === 'pull_request_review_comment'
  ) {
    return handleIssueEvent(payload, slackApiToken, config).catch((err) => {
      console.error(err);
    });
  }
  console.log(`event of type ${githubEvent} was ignored.`);
  return { message: null };
};
