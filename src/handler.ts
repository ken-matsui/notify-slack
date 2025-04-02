import * as core from "@actions/core";
import type { WebhookPayload } from "@actions/github/lib/interfaces";
import type Slack from "./slack";
import type { Config } from "./types";
import { extractUsersFromComment } from "./utils";

async function handlePullRequestReviewRequestedAction(
	payload: WebhookPayload,
	slack: Slack,
	config: Config,
): Promise<void> {
	const requestedReviewer = payload.requested_reviewer?.login;
	await slack.postMessage(requestedReviewer, payload, "requestReview", config);

	// Send a ticket reminder when an author of PR and a sender of review request are the same.
	const prAuthor = payload.pull_request?.user.login;
	const reviewRequestSender = payload.sender?.login;
	if (prAuthor === reviewRequestSender) {
		await slack.postMessage(
			prAuthor,
			payload,
			"requestReviewForAuthor",
			config,
		);
	}
}

async function handlePullRequestEvent(
	payload: WebhookPayload,
	slack: Slack,
	config: Config,
): Promise<void> {
	const action = payload.action;

	if (action === "review_requested") {
		await handlePullRequestReviewRequestedAction(payload, slack, config);
	} else if (action === "closed" && payload.pull_request?.merged) {
		const prAuthor = payload.pull_request?.user.login;
		await slack.postMessage(prAuthor, payload, "merged", config);
	} else {
		core.warning(`'${action}' action was ignored`);
	}
}

async function handlePullRequestReviewEvent(
	payload: WebhookPayload,
	slack: Slack,
	config: Config,
): Promise<void> {
	// First, if the comment has mentions, notify them.
	const mentionUsers = extractUsersFromComment(payload.review.body);
	for (const user of mentionUsers) {
		await slack.postMessage(user, payload, "reviewMentionComment", config);
	}

	// Notify an author of PR of all review comments (without theirs).
	// However, ignore comments if they have been already notified.
	const reviewer = payload.review.user.login;
	const prAuthor = payload.pull_request?.user.login;
	if (!mentionUsers.includes(prAuthor) && reviewer !== prAuthor) {
		await slack.postMessage(prAuthor, payload, "reviewComment", config);
	}
}

async function handleIssueCreatedAction(
	payload: WebhookPayload,
	slack: Slack,
	config: Config,
): Promise<void> {
	const mentionUsers = extractUsersFromComment(payload.comment?.body);
	for (const user of mentionUsers) {
		await slack.postMessage(user, payload, "mentionComment", config);
	}
}

async function handleIssueEvent(
	payload: WebhookPayload,
	slack: Slack,
	config: Config,
): Promise<void> {
	const action = payload.action;

	// TODO: If there's no mentions in the `before` and the `after` has mentions,
	//  should this action send a notification?
	if (action === "created") {
		// || action === 'edited'
		await handleIssueCreatedAction(payload, slack, config);
	} else {
		core.warning(`'${action}' action was ignored`);
	}
}

export type HandlerType = (
	payload: WebhookPayload,
	slack: Slack,
	config: Config,
) => Promise<void>;

type HandlerList = { readonly [key: string]: HandlerType };

export const handlerList: HandlerList = {
	pull_request: handlePullRequestEvent,
	pull_request_review: handlePullRequestReviewEvent,
	issue_comment: handleIssueEvent,
	pull_request_review_comment: handleIssueEvent,
};
