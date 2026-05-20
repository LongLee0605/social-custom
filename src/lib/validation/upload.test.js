import { describe, it, expect } from 'vitest'
import {
  validateImageFile,
  validateChatFile,
  validatePostContent,
  validateCommentText,
  sanitizeFileName,
} from './upload.js'

describe('upload validation', () => {
  it('rejects oversized images', () => {
    const file = { size: 11 * 1024 * 1024, type: 'image/png', name: 'a.png' }
    expect(validateImageFile(file).valid).toBe(false)
  })

  it('accepts valid images', () => {
    const file = { size: 1024, type: 'image/png', name: 'a.png' }
    expect(validateImageFile(file).valid).toBe(true)
  })

  it('rejects invalid chat file extensions', () => {
    const file = { size: 1024, name: 'virus.exe' }
    expect(validateChatFile(file).valid).toBe(false)
  })

  it('accepts allowed chat file extensions', () => {
    const file = { size: 1024, name: 'doc.pdf' }
    expect(validateChatFile(file).valid).toBe(true)
  })

  it('validates post content', () => {
    expect(validatePostContent('', false).valid).toBe(false)
    expect(validatePostContent('hello', false).valid).toBe(true)
    expect(validatePostContent('', true).valid).toBe(true)
  })

  it('validates comment text', () => {
    expect(validateCommentText('  ').valid).toBe(false)
    expect(validateCommentText(' ok ').value).toBe('ok')
  })

  it('sanitizes file names', () => {
    expect(sanitizeFileName('a b!@#.png')).toBe('a_b___.png')
  })
})
