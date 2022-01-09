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
    await handler(github.context.payload, slack, config)
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
