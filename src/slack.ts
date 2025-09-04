import * as core from "@actions/core";
import type { WebhookPayload } from "@actions/github/lib/interfaces";
import type { MessageAttachment } from "@slack/types";
import { WebClient } from "@slack/web-api";
import type { Config, Extends } from "./types";
import { getSlackUserId, toOxfordComma } from "./utils";

type MessageType =
	| "mentionComment"
	| "requestReview"
	| "requestReviewForAuthor"
	| "merged"
	| "reviewMentionComment"
	| "reviewComment";

const reviewMessageTypes = ["reviewComment", "reviewMentionComment"] as const;
type ReviewMessage = Extends<MessageType, (typeof reviewMessageTypes)[number]>;

const commentMessageTypes = ["mentionComment", ...reviewMessageTypes] as const;
type CommentMessage = Extends<
	MessageType,
	(typeof commentMessageTypes)[number]
>;

type Status = "IN PROGRESS" | "REVIEW" | "DONE";

function makeTicketStatusReminder(status: Status): string {
	return `\nPlease mark the related ticket(s) as *${status}*`;
}

function detectEventType(payload: WebhookPayload): string {
	return Object.hasOwn(payload, "issue") ? "issue" : "pull_request";
}

function chooseColor(type: MessageType, payload: WebhookPayload): string {
	// '#36a64f'
	switch (type) {
		case "requestReview":
			return "warning";
		case "reviewComment":
			switch (payload.review.state) {
				case "approved":
					return "good";
				case "changes_requested":
					return "danger";
				default:
					return "";
			}
		case "merged":
			return "good";
		default:
			// mentionComment, reviewMentionComment
			return ""; // use the default color
	}
}

function chooseTitlePrefix(type: MessageType, payload: WebhookPayload): string {
	switch (type) {
		case "mentionComment":
		case "reviewMentionComment":
			return "Comment on ";
		case "reviewComment":
			switch (payload.review.state) {
				case "approved":
					return "Approval on ";
				case "changes_requested":
					return "Requested Changes on ";
				case "commented":
					return "Comment on ";
				default:
					return "";
			}
		default:
			// requestReview, merged
			return "";
	}
}

function extractImageURL(commentBody: string): string {
	if (commentBody) {
		const found = commentBody.match(/(https?:\/\/.*\.(?:png|jpg))/);
		if (found) {
			return found[1];
		}
	}
	return "";
}

function createMsg(
	payload: WebhookPayload,
	type: MessageType,
): [string] | [string, Status] {
	const sender = payload.sender?.login;

	switch (type) {
		case "requestReview":
			return [`:white_check_mark: ${sender} requested your review`];
		case "requestReviewForAuthor":
			return [
				`:white_check_mark: You requested ${toOxfordComma(
					payload.pull_request?.requested_reviewers.map(
						(v: { login: string }) => v["login"],
					),
				)}'s review`,
				"REVIEW",
			];
		case "mentionComment":
		case "reviewMentionComment":
			return [`:speech_balloon: ${sender} mentioned you`];
		case "reviewComment":
			switch (payload.review.state) {
				case "approved":
					return [`:tada: ${sender} approved your pull request`];
				case "changes_requested":
					return [
						`:bulb: ${sender} requested changes on your pull request`,
						"IN PROGRESS",
					];
				default:
					return [`:speech_balloon: ${sender} commented on your pull request`];
			}
		case "merged":
			return [`:white_check_mark: ${sender} merged your pull request`, "DONE"];
	}
}

export default class Slack {
	web: WebClient;
	repositoryFullName = "";
	prNumber = "";

	constructor(token: string) {
		this.web = new WebClient(token);
	}

	createBaseAttachment(
		payload: WebhookPayload,
		type: MessageType,
	): MessageAttachment {
		const event = payload[`${detectEventType(payload)}`];
		const [title_link, text, image_url] = ((): [string, string, string] => {
			const isCommentType = commentMessageTypes.includes(
				type as CommentMessage,
			);
			if (isCommentType) {
				const isReviewType = reviewMessageTypes.includes(type as ReviewMessage);
				const comment = payload[`${isReviewType ? "review" : "comment"}`];
				return [
					comment["html_url"],
					comment.body,
					extractImageURL(comment.body), // TODO: remove parsed image url from comment.body
				];
			}
			return [event["html_url"], "", ""];
		})();

		const prNumber = `#${event["number"]}`;
		this.prNumber = prNumber;

		const repository = payload.repository;
		this.repositoryFullName =
			typeof repository?.full_name === "string" ? repository?.full_name : "";

		return {
			color: chooseColor(type, payload),
			author_name: event.user["login"],
			author_icon: event.user["avatar_url"],
			title: `${chooseTitlePrefix(type, payload)}${prNumber} ${event["title"]}`,
			title_link,
			text,
			image_url,
			footer_icon:
				"https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png",
			footer: `<${repository?.html_url}|${this.repositoryFullName}>`,
			ts: Math.floor(Date.now() / 1000).toString(),
		};
	}

	async postMessage(
		githubUserId: string,
		payload: WebhookPayload,
		type: MessageType,
		config: Config,
	): Promise<void> {
		const slackUserId = getSlackUserId(githubUserId, config["users"]);
		if (slackUserId === undefined) {
			core.info(`target user '${githubUserId}' was not found`);
			return;
		}

		core.info(`target user '${githubUserId}' was found: ${slackUserId}`);
		const [text, status] = createMsg(payload, type);
		const reminder =
			status !== undefined ? makeTicketStatusReminder(status) : "";

		const attachment = this.createBaseAttachment(payload, type);
		const repoInfo = ` on *${this.repositoryFullName} ${this.prNumber}*`;
		core.info(`attachment: ${JSON.stringify(attachment)}`);
		await this.web.chat.postMessage({
			channel: slackUserId,
			text: `${text}${repoInfo}${reminder}`,
			attachments: [attachment],
		});
		core.info(`A message is being sent to '${githubUserId}'.`);
	}
}
