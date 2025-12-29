const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(?::[0-9]+)?(?:\/[^\s<>"{}|\\^`\[\]]*)?)/gi

export const linkifyText = (text) => {
  if (!text) return []

  const parts = []
  let lastIndex = 0
  let match

  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      })
    }

    let url = match[0]
    let displayUrl = url

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.startsWith('www.')) {
        url = 'https://' + url
      } else {
        url = 'https://' + url
      }
    }

    if (displayUrl.length > 50) {
      displayUrl = displayUrl.substring(0, 47) + '...'
    }

    parts.push({
      type: 'link',
      url: url,
      displayUrl: displayUrl,
      originalText: match[0],
    })

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    })
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}

export const hasLinks = (text) => {
  if (!text) return false
  return URL_REGEX.test(text)
}

