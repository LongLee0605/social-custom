export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export const CHAT_FILE_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.zip', '.rar', '.mp3', '.mp4', '.wav',
]

export const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9.-]/g, '_')

export const validateImageFile = (file, maxSizeBytes = 10 * 1024 * 1024) => {
  if (!file) return { valid: true }
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
    }
  }
  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF hoặc WebP',
    }
  }
  return { valid: true }
}

export const validateChatFile = (file, maxSizeBytes = 50 * 1024 * 1024) => {
  if (!file) return { valid: true }
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
    }
  }
  const lowerName = file.name.toLowerCase()
  const hasAllowedExt = CHAT_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
  if (!hasAllowedExt) {
    return {
      valid: false,
      error: `Định dạng file không được hỗ trợ. Cho phép: ${CHAT_FILE_EXTENSIONS.join(', ')}`,
    }
  }
  return { valid: true }
}

export const validatePostContent = (content, hasImage) => {
  if (content?.trim() || hasImage) return { valid: true }
  return { valid: false, error: 'Vui lòng nhập nội dung hoặc chọn ảnh' }
}

export const validateCommentText = (text) => {
  const trimmed = text?.trim()
  if (!trimmed) return { valid: false, error: 'Nội dung bình luận không được để trống' }
  return { valid: true, value: trimmed }
}

export const MAX_REPLY_DEPTH = 2
