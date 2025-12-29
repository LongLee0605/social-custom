import { useState, useRef, useEffect } from 'react'
import { Send, Image as ImageIcon, Paperclip, Smile, X } from 'lucide-react'
import Button from '../ui/Button'
import AlertModal from '../ui/AlertModal'
import { uploadImage, uploadFile } from '../../services/imageUpload'

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
  '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
  '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
  '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
  '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
]

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
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
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
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Chức năng gửi ảnh chưa được cấu hình.',
      })
      return
    }

    try {
      setUploading(true)
      const maxSize = 10 * 1024 * 1024
      if (selectedImage.size > maxSize) {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB',
        })
        setUploading(false)
        return
      }

      const imagePath = `chat-images/${Date.now()}_${selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const imageURL = await uploadImage(selectedImage, imagePath)
      
      if (!imageURL) {
        throw new Error('Không nhận được URL ảnh sau khi upload')
      }

      await onSendImage(imageURL, selectedImage.name)
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi upload ảnh',
        message: error.message || 'Lỗi khi upload ảnh. Vui lòng kiểm tra cấu hình Cloudinary và thử lại.',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSendFile = async () => {
    if (!selectedFile || disabled || uploading) return

    try {
      setUploading(true)
      const maxSize = 50 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: 'Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 50MB',
        })
        setUploading(false)
        return
      }

      const filePath = `chat-files/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
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
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB',
      })
      e.target.value = ''
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF hoặc WebP',
      })
      e.target.value = ''
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 50MB',
      })
      e.target.value = ''
      return
    }

    setSelectedFile(file)
    e.target.value = ''
  }

  const insertEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      {imagePreview && (
        <div className="p-2 sm:p-3 border-b border-gray-200 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
          />
          <button
            onClick={() => {
              setImagePreview(null)
              setSelectedImage(null)
            }}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {selectedFile && (
        <div className="p-2 sm:p-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 max-h-48 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2 max-w-full">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-xl sm:text-2xl hover:scale-125 transition-transform p-1 hover:bg-gray-200 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="p-2 sm:p-4">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={disabled}
              title="Gửi ảnh"
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={disabled}
              title="Gửi file"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={disabled}
              title="Emoji"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex flex-1 relative min-w-0">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => {
                const value = e.target.value
                setMessageText(value)
                if (onTyping) {
                  onTyping(value)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-20 sm:max-h-24 overflow-y-auto scrollbar-hide"
              disabled={disabled}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={(!messageText.trim() && !selectedImage && !selectedFile) || disabled || uploading}
            className="rounded-full p-1.5 sm:p-2 flex-shrink-0"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>
      </form>

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

