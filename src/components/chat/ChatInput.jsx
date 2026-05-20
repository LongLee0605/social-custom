import { useState, useRef, useEffect } from 'react'
import { Send, Image as ImageIcon, Paperclip, Smile, X } from 'lucide-react'
import Button from '../ui/Button'
import AlertModal from '../ui/AlertModal'
import EmojiPickerModal from '../ui/EmojiPickerModal'
import { uploadImage, uploadFile } from '../../services/imageUpload'
import { validateImageFile, validateChatFile, sanitizeFileName } from '@/lib/validation'
import { MESSAGE_EMOJIS } from '@/lib/emojis'
import { cn } from '@/lib/cn'

const ChatInput = ({ onSend, onSendImage, onSendFile, onTyping, disabled = false }) => {
  const [messageText, setMessageText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [alert, setAlert] = useState({ isOpen: false, type: 'error', title: '', message: '' })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const scrollHeight = el.scrollHeight
    const minHeight = 40
    const maxHeight = 120
    el.style.height = `${Math.max(minHeight, Math.min(scrollHeight, maxHeight))}px`
    el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [messageText])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim() && !selectedImage && !selectedFile) return
    if (disabled) return

    try {
      if (selectedImage) {
        await handleSendImage()
      } else if (selectedFile) {
        await handleSendFile()
      } else if (messageText.trim()) {
        const textToSend = messageText.trim()
        setMessageText('')
        await onSend(textToSend)
      }
    } catch (error) {
      console.error('Error in handleSend:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.',
      })
    }
  }

  const handleSendImage = async () => {
    if (!selectedImage || disabled || uploading) return
    if (!onSendImage) {
      setAlert({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Chức năng gửi ảnh chưa được cấu hình.' })
      return
    }

    try {
      setUploading(true)
      const validation = validateImageFile(selectedImage)
      if (!validation.valid) {
        setAlert({ isOpen: true, type: 'error', title: 'Lỗi', message: validation.error })
        return
      }

      const imagePath = `chat-images/${Date.now()}_${sanitizeFileName(selectedImage.name)}`
      const imageURL = await uploadImage(selectedImage, imagePath)
      if (!imageURL) throw new Error('Không nhận được URL ảnh sau khi upload')

      await onSendImage(imageURL, selectedImage.name)
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi upload ảnh',
        message: error.message || 'Lỗi khi upload ảnh. Vui lòng thử lại.',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSendFile = async () => {
    if (!selectedFile || disabled || uploading) return

    try {
      setUploading(true)
      const validation = validateChatFile(selectedFile)
      if (!validation.valid) {
        setAlert({ isOpen: true, type: 'error', title: 'Lỗi', message: validation.error })
        return
      }

      const filePath = `chat-files/${Date.now()}_${sanitizeFileName(selectedFile.name)}`
      const fileURL = await uploadFile(selectedFile, filePath)
      await onSendFile(fileURL, selectedFile.name, selectedFile.size)
      setSelectedFile(null)
    } catch (error) {
      console.error('Error uploading file:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi upload file',
        message: error.message || 'Lỗi khi upload file. Vui lòng thử lại.',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setAlert({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Ảnh tối đa 10MB' })
      e.target.value = ''
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setAlert({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Chỉ hỗ trợ JPG, PNG, GIF, WebP' })
      e.target.value = ''
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      setAlert({ isOpen: true, type: 'error', title: 'Lỗi', message: 'File tối đa 50MB' })
      e.target.value = ''
      return
    }

    setSelectedFile(file)
    e.target.value = ''
  }

  const insertEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji)
    textareaRef.current?.focus()
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  const iconBtn = 'rounded-full p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600 disabled:opacity-40'

  return (
    <div className="shrink-0 border-t border-surface-border bg-white safe-bottom">
      {imagePreview && (
        <div className="relative border-b border-surface-border p-3">
          <img src={imagePreview} alt="Xem trước" className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />
          <button
            type="button"
            onClick={() => {
              setImagePreview(null)
              setSelectedImage(null)
            }}
            className="absolute right-3 top-3 rounded-full bg-slate-900/60 p-1 text-white hover:bg-slate-900/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {selectedFile && (
        <div className="flex items-center justify-between gap-2 border-b border-surface-border p-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Paperclip className="h-5 w-5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="p-2 sm:p-3">
        <div className="flex items-end gap-1.5 sm:gap-2">
          <div className="flex shrink-0 items-center gap-0.5">
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
            <button type="button" onClick={() => imageInputRef.current?.click()} className={iconBtn} disabled={disabled} title="Gửi ảnh">
              <ImageIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className={iconBtn} disabled={disabled} title="Gửi file">
              <Paperclip className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setShowEmojiPicker(true)} className={iconBtn} disabled={disabled} title="Emoji">
              <Smile className="h-5 w-5" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value)
              onTyping?.(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
            placeholder="Nhập tin nhắn..."
            rows={1}
            disabled={disabled}
            className={cn(
              'min-h-[40px] max-h-[120px] w-full flex-1 resize-none rounded-2xl border border-surface-border',
              'px-4 py-2 text-[15px] text-slate-900 placeholder:text-slate-400',
              'focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
            )}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={(!messageText.trim() && !selectedImage && !selectedFile) || disabled || uploading}
            className="shrink-0 rounded-full !p-2.5"
          >
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>

      <EmojiPickerModal
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        title="Chèn emoji"
        emojis={MESSAGE_EMOJIS}
        onSelect={insertEmoji}
      />

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
      />
    </div>
  )
}

export default ChatInput
