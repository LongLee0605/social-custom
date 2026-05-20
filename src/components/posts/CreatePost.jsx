import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import AlertModal from '../ui/AlertModal'
import { useUserInfo } from '../../hooks/useUserInfo'
import EmojiPickerModal from '../ui/EmojiPickerModal'
import { MESSAGE_EMOJIS } from '@/lib/emojis'
import { Image, X, Smile } from 'lucide-react'

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
              className="input-modern resize-none text-sm sm:text-base"
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-surface-border pt-3 sm:pt-4 space-y-3 sm:space-y-0">
          <div className="flex items-center justify-center gap-3 sm:justify-start sm:gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 transition-colors hover:text-brand-600 sm:text-base">
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
              onClick={() => setShowEmojiPicker(true)}
              className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-brand-600 sm:text-base"
            >
              <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Emoji</span>
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
    </Modal>
  )
}

export default CreatePost

