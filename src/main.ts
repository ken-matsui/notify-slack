import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {Config} from './types'
import {handleEvent} from './handler'
import toml from 'toml'

const CONFIG_PATH = '.github/userlist.toml'

async function run(): Promise<void> {
  try {
    const eventType = github.context.eventName
    if (!isSupportedEventType(eventType)) {
      core.warning(`The detected event type is not supported: '${eventType}'`)
      return
    }

    const slackApiToken = core.getInput('slack_oauth_access_token')
    const config = getConfig()

    await handleEvent(eventType, github.context.payload, slackApiToken, config)
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(error)
      core.setFailed(error.message)
    }
  }
}

function getConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Configuration file '${CONFIG_PATH}' not found`)
  }

  if (!fs.lstatSync(CONFIG_PATH).isFile()) {
    throw new Error(`'${CONFIG_PATH}' is not a file.`)
  }

  const fileContent = fs.readFileSync(CONFIG_PATH, {encoding: 'utf8'})
  return toml.parse(fileContent)
}

function isSupportedEventType(eventType: string): boolean {
  const supportedEventTypes = [
    'pull_request',
    'pull_request_review',
    'issue_comment',
    'pull_request_review_comment'
  ]
  return supportedEventTypes.includes(eventType)
}

run()
