import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {HandlerType, handlerList} from './handler'
import {Config} from './types'
import Slack from './slack'
import toml from 'toml'

const CONFIG_PATH = '.github/userlist.toml'

async function run(): Promise<void> {
  try {
    const eventType: string = github.context.eventName
    const handler: HandlerType | undefined = handlerList[eventType]
    if (handler === undefined) {
      core.warning(`The detected event type is not supported: '${eventType}'`)
      return
    }

    const slackApiToken = core.getInput('slack_oauth_access_token')
    const slack = new Slack(slackApiToken)
    const config = getConfig()
    core.info('Configurations are successfully loaded.')

    const payload = github.context.payload
    core.info(`Processing the detected event type: '${eventType}' ...`)
    core.info(`Processing the detected action: '${payload.action}' ...`)
    await handler(payload, slack, config)
    core.info(`'${eventType}' event has been successfully completed.`)
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

run()
