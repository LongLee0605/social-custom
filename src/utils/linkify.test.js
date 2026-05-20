import { describe, it, expect } from 'vitest'
import { linkifyText, hasLinks } from './linkify.js'

describe('linkify', () => {
  it('returns empty for empty text', () => {
    expect(linkifyText('')).toEqual([])
    expect(hasLinks('')).toBe(false)
  })

  it('detects https links', () => {
    const parts = linkifyText('Visit https://example.com now')
    expect(parts.some((p) => p.type === 'link')).toBe(true)
    expect(hasLinks('https://example.com')).toBe(true)
  })

  it('creates link parts for https URLs', () => {
    const parts = linkifyText('see https://example.com today')
    const link = parts.find((p) => p.type === 'link')
    expect(link?.url).toBe('https://example.com')
  })

  it('returns plain text when no links', () => {
    expect(linkifyText('hello world')).toEqual([{ type: 'text', content: 'hello world' }])
  })
})
