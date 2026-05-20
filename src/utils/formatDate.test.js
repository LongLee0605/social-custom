import { describe, it, expect } from 'vitest'
import { formatRelativeTime, formatFullDate, formatMessageTime } from './formatDate.js'

describe('formatDate', () => {
  it('returns empty for missing timestamp', () => {
    expect(formatRelativeTime(null)).toBe('')
    expect(formatFullDate(undefined)).toBe('')
    expect(formatMessageTime('')).toBe('')
  })

  it('formats Date objects', () => {
    const date = new Date('2024-01-15T10:00:00')
    expect(formatFullDate(date)).toContain('2024')
    expect(formatMessageTime(date)).toBeTruthy()
  })

  it('handles Firestore-like timestamps', () => {
    const ts = { toDate: () => new Date('2024-06-01T12:00:00') }
    expect(formatRelativeTime(ts)).toBeTruthy()
  })
})
