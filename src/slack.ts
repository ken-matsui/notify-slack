import {WebClient} from '@slack/web-api'
import * as core from '@actions/core'
import {getSlackUserId, toOxfordComma} from './utils'

export default class Slack {
  web: WebClient
  repositoryFullName: string = ''
  prNumber: string = ''

  constructor(token: string) {
    this.web = new WebClient(token)
  }

  static makeJiraReminder(status: string): string {
    if (status !== 'IN PROGRESS' && status !== 'REVIEW' && status !== 'DONE') {
      return ''
    }
    return `\nPlease mark the related Jira ticket(s) as *${status}*`
  }

  createText(payload: any, type: string): any {
    const sender = payload['sender']['login']

    switch (type) {
      case 'requestReview':
        return [`:white_check_mark: ${sender} requested your review`, '']
      case 'requestReviewForAuthor':
        const requestedReviewers = toOxfordComma(
          payload['pull_request']['requested_reviewers'].map(
            (v: any) => v['login']
          )
        )
        return [
          `:white_check_mark: You requested ${requestedReviewers}'s review`,
          'REVIEW'
        ]
      case 'mentionComment':
      case 'reviewMentionComment':
        return [`:speech_balloon: ${sender} mentioned you`, '']
      case 'reviewComment':
        switch (payload['review']['state']) {
          case 'approved':
            return [`:tada: ${sender} approved your pull request`, '']
          case 'changes_requested':
            return [
              `:bulb: ${sender} requested changes on your pull request`,
              'IN PROGRESS'
            ]
          default:
            return [
              `:speech_balloon: ${sender} commented on your pull request`,
              ''
            ]
        }
      case 'merged':
        return [`:white_check_mark: ${sender} merged your pull request`, 'DONE']
    }
  }

  async postMessage(
    githubUserId: string,
    payload: any,
    type: string,
    config: any
  ) {
    const attachment = this.createBaseAttachment(payload, type)
    core.info(`attachment: ${JSON.stringify(attachment)}`)

    const slackUserId = getSlackUserId(githubUserId, config['users'])
    if (slackUserId === undefined) {
      core.info(`target user ${githubUserId} was not found`)
    } else {
      core.info(`target user ${githubUserId} was found: ${slackUserId}`)
      const [text, status] = this.createText(payload, type)
      const repoInfo = ` on *${this.repositoryFullName} ${this.prNumber}*`

      await this.web.chat.postMessage({
        channel: slackUserId,
        text: text + repoInfo + Slack.makeJiraReminder(status),
        attachments: [attachment]
      })
    }
  }

  static getEventType(payload: any): string {
    return Object.prototype.hasOwnProperty.call(payload, 'issue')
      ? 'issue'
      : 'pull_request'
  }

  static createAttachmentColor(type: string, payload: any): string {
    // '#36a64f'
    switch (type) {
      case 'requestReview':
        return 'warning'
      case 'reviewComment':
        switch (payload['review']['state']) {
          case 'approved':
            return 'good'
          case 'changes_requested':
            return 'danger'
          default:
            return ''
        }
      case 'merged':
        return 'good'
      default:
        // mentionComment, reviewMentionComment
        return '' // use the default color
    }
  }

  static createAttachmentTitlePrefix(type: string, payload: any): string {
    switch (type) {
      case 'mentionComment':
      case 'reviewMentionComment':
        return 'Comment on '
      case 'reviewComment':
        switch (payload['review']['state']) {
          case 'approved':
            return 'Approval on '
          case 'changes_requested':
            return 'Requested Changes on '
          case 'commented':
            return 'Comment on '
          default:
            return ''
        }
      default:
        // requestReview, merged
        return ''
    }
  }

  static getImageURL(commentBody: string): string {
    const regex = /(https?:\/\/.*\.(?:png|jpg))/
    const found = commentBody.match(regex)
    if (found) {
      return found[1]
    }
    return ''
  }

  createBaseAttachment(payload: any, type: string): any {
    const isReviewType =
      type === 'reviewComment' || type === 'reviewMentionComment'
    const isCommentType =
      type === 'mentionComment' ||
      type === 'reviewComment' ||
      type === 'reviewMentionComment'

    const event = payload[`${Slack.getEventType(payload)}`]
    const comment = payload[`${isReviewType ? 'review' : 'comment'}`]
    const user = event.user
    const repository = payload['repository']

    this.prNumber = `#${event['number']}`
    this.repositoryFullName = repository['full_name']

    return {
      color: Slack.createAttachmentColor(type, payload),
      author_name: user['login'],
      author_icon: user['avatar_url'],
      title: `${Slack.createAttachmentTitlePrefix(type, payload)}${
        this.prNumber
      } ${event['title']}`,
      title_link: isCommentType ? comment['html_url'] : event['html_url'],
      text: isCommentType ? comment.body : '',
      image_url: isCommentType ? Slack.getImageURL(comment.body) : '', // TODO: remove parsed image url from comment.body
      footer_icon:
        'https://slack-imgs.com/?c=1&o1=wi32.he32.si&url=https%3A%2F%2Fslack.github.com%2Fstatic%2Fimg%2Ffavicon-neutral.png',
      footer: `<${repository['html_url']}|${this.repositoryFullName}>`,
      ts: Math.floor(Date.now() / 1000)
    }
  }
}
