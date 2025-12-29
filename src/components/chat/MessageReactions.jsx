import { useState, useRef, useEffect } from 'react'
import { Smile, Plus } from 'lucide-react'
import Modal from '../ui/Modal'

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

// Danh sách emoji đầy đủ hơn
const ALL_EMOJIS = [
  '👍', '❤️', '😂', '😮', '😢', '🙏', '😊', '😍', '🤔', '😎',
  '😴', '😋', '😭', '😡', '🤗', '👏', '🔥', '💯', '🎉', '✨',
  '⭐', '💪', '🙌', '👌', '👍', '👎', '💔', '💖', '💝', '🎁',
  '🏆', '🥇', '🥈', '🥉', '🎯', '💎', '🌟', '💫', '⚡', '🌈'
]

const MessageReactions = ({ reactions, onReact, isOwn = false }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const pickerRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!showPicker || !pickerRef.current || !buttonRef.current) return

    const picker = pickerRef.current
    const button = buttonRef.current
    const chatContainer = button.closest('[class*="col-span-2"]') || 
                         document.querySelector('.lg\\:col-span-2') ||
                         document.querySelector('[class*="max-w"]')
    
    const buttonRect = button.getBoundingClientRect()
    
    if (chatContainer) {
      const containerRect = chatContainer.getBoundingClientRect()
      const containerCenterX = containerRect.left + containerRect.width / 2
      
      picker.style.left = `${containerCenterX}px`
      picker.style.top = `${buttonRect.top - 60}px`
      picker.style.transform = 'translateX(-50%)'
      picker.style.position = 'fixed'
    } else {
      picker.style.left = '50%'
      picker.style.top = `${buttonRect.top - 60}px`
      picker.style.transform = 'translateX(-50%)'
      picker.style.position = 'fixed'
    }
  }, [showPicker])

  const hasReactions = reactions && typeof reactions === 'object' && Object.keys(reactions).length > 0

  if (!hasReactions && !onReact) {
    return null
  }

  return (
    <>
      <div className={`flex items-center space-x-1 flex-wrap relative ${!hasReactions ? 'inline-block' : ''}`}>
        {hasReactions && (
          <>
            {Object.entries(reactions).map(([emoji, userIds]) => {
              if (!Array.isArray(userIds)) return null
              return (
                <button
                  key={emoji}
                  onClick={() => onReact && onReact(emoji)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm flex items-center space-x-1 transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-xs text-gray-600">{userIds.length}</span>
                </button>
              )
            })}
          </>
        )}
          {onReact && (
            <div className={hasReactions ? `absolute top-[2px] ${isOwn ? '-left-8' : '-right-4'} inline-block` : 'relative inline-block'}>
              <button
                ref={buttonRef}
                onClick={() => setShowPicker(!showPicker)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showPicker && (
                <div 
                  ref={pickerRef}
                  className="fixed bg-white rounded-lg shadow-lg p-2 flex items-center space-x-1 border border-gray-200 z-50"
                  style={{ 
                    width: 'auto',
                    minWidth: 'fit-content'
                  }}
                >
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(emoji)
                        setShowPicker(false)
                      }}
                      className="text-2xl hover:scale-125 transition-transform p-1.5 flex-shrink-0"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setShowPicker(false)
                      setShowEmojiModal(true)
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
      </div>
      
      {showEmojiModal && (
        <Modal
          isOpen={showEmojiModal}
          onClose={() => setShowEmojiModal(false)}
          title="Chọn biểu cảm"
          size="md"
        >
          <div className="max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-8 gap-2 p-2">
              {ALL_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    if (onReact) {
                      onReact(emoji)
                    }
                    setShowEmojiModal(false)
                  }}
                  className="text-3xl hover:scale-125 transition-transform p-2 hover:bg-gray-100 rounded-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default MessageReactions

