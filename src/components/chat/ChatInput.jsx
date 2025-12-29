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

    if (selectedImage) {
      await handleSendImage()
    } else if (selectedFile) {
      await handleSendFile()
    } else if (messageText.trim()) {
      onSend(messageText.trim())
      setMessageText('')
    }
  }

  const handleSendImage = async () => {
    if (!selectedImage) return

    try {
      const imagePath = `chat-images/${Date.now()}_${selectedImage.name}`
      const imageURL = await uploadImage(selectedImage, imagePath)
      onSendImage(imageURL, selectedImage.name)
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
    }
  }

  const handleSendFile = async () => {
    if (!selectedFile) return

    try {
      const filePath = `chat-files/${Date.now()}_${selectedFile.name}`
      const fileURL = await uploadFile(selectedFile, filePath)
      onSendFile(fileURL, selectedFile.name, selectedFile.size)
      setSelectedFile(null)
    } catch (error) {
      console.error('Error uploading file:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi upload file',
        message: error.message || 'Lỗi khi upload file. Vui lòng thử lại.',
      })
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
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
        <div className="p-2 border-b border-gray-200 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg"
          />
          <button
            onClick={() => {
              setImagePreview(null)
              setSelectedImage(null)
            }}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedFile && (
        <div className="p-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Paperclip className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-gray-200 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="p-4">
        <div className="flex items-end space-x-2">
          <div className="flex items-center space-x-1">
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
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={disabled}
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={disabled}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={disabled}
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value)
                if (onTyping) {
                  onTyping(e.target.value)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32 overflow-y-auto"
              disabled={disabled}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={(!messageText.trim() && !selectedImage && !selectedFile) || disabled}
            className="rounded-full p-2"
          >
            <Send className="w-5 h-5" />
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

