export function getSlackUserId(githubUser: string, users: any[]): string {
  const user = users.find(u => u.github === githubUser)
  if (user !== undefined) {
    return user['slack']
  }
  return user
}

function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function parseMentionComment(body: string): any {
  let mentionUsers: string[] = []
  if (body) {
    const matches = body.match(/@([a-zA-Z0-9_-]+)/g)
    if (matches !== null) {
      mentionUsers = matches.map(match => match.slice(1)) || []
    }
  }
  return {mentionUsers: removeDuplicates(mentionUsers)}
}

// ref: https://gist.github.com/JamieMason/c1a089f6f1f147dbe9f82cb3e25cd12e
export function toOxfordComma(array: string[]): string {
  return array.length > 2
    ? array
        .slice(0, array.length - 1)
        .concat(`and ${array.slice(-1)}`)
        .join(', ')
    : array.join(' and ')
}
