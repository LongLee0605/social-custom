import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import AlertModal from '../ui/AlertModal'
import { useUserInfo } from '../../hooks/useUserInfo'
import { Image, X, Smile } from 'lucide-react'

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

const CreatePost = ({ isOpen, onClose, onCreatePost }) => {
  const { userProfile, currentUser } = useAuth()
  const currentUserInfo = useUserInfo(currentUser?.uid)
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '' })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef(null)

  // Reset emoji picker khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setShowEmojiPicker(false)
      setContent('')
      setImage(null)
      setImagePreview(null)
    }
  }, [isOpen])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const textBefore = content.substring(0, start)
      const textAfter = content.substring(end)
      setContent(textBefore + emoji + textAfter)
      setShowEmojiPicker(false)
      // Focus lại textarea và đặt cursor sau emoji vừa chèn
      setTimeout(() => {
        textarea.focus()
        const newPosition = start + emoji.length
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    } else {
      setContent((prev) => prev + emoji)
      setShowEmojiPicker(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !image) return

    setLoading(true)
    try {
      const result = await onCreatePost({
        content: content.trim(),
        image: image,
      })
      
      if (result.success) {
        setContent('')
        setImage(null)
        setImagePreview(null)
        onClose()
      } else {
        const errorMessage = result.error || 'Có lỗi xảy ra khi tạo bài viết'
        
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: errorMessage,
        })
      }
    } catch (error) {
      console.error('Error creating post:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Có lỗi xảy ra khi tạo bài viết',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo bài viết" size="lg">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <Avatar
            src={currentUserInfo?.photoURL || userProfile?.photoURL}
            alt={currentUserInfo?.displayName || userProfile?.displayName}
            size="sm"
            className="sm:hidden flex-shrink-0"
          />
          <Avatar
            src={currentUserInfo?.photoURL || userProfile?.photoURL}
            alt={currentUserInfo?.displayName || userProfile?.displayName}
            size="md"
            className="hidden sm:block flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              rows={4}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none overflow-hidden"
            />
            {imagePreview && (
              <div className="mt-3 sm:mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 sm:h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {showEmojiPicker && (
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 max-h-48 overflow-y-auto overflow-x-hidden scrollbar-thin">
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2 max-w-full">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="text-xl sm:text-2xl hover:scale-125 transition-transform p-1 hover:bg-gray-200 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 justify-center sm:justify-start">
            <label className="flex items-center space-x-2 text-sm sm:text-base text-gray-600 hover:text-primary-600 cursor-pointer">
              <Image className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Thêm ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center space-x-2 text-sm sm:text-base text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Icon</span>
            </button>
          </div>
          <div className="flex space-x-2 sm:space-x-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 sm:flex-initial">
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={(!content.trim() && !image) || loading}
              className="flex-1 sm:flex-initial"
            >
              {loading ? 'Đang đăng...' : 'Đăng'}
            </Button>
          </div>
        </div>
      </form>
      
      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
      />
    </Modal>
  )
}

export default CreatePost

