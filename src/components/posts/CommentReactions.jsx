import { useState, useRef, useEffect } from 'react'
import { Smile, Plus } from 'lucide-react'
import EmojiPickerModal from '../ui/EmojiPickerModal'
import { QUICK_REACTIONS, EXTENDED_REACTIONS } from '@/lib/emojis'

const CommentReactions = ({ reactions, onReact }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const pickerRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!showPicker || !pickerRef.current || !buttonRef.current) return

    const picker = pickerRef.current
    const button = buttonRef.current
    const buttonRect = button.getBoundingClientRect()
    
    picker.style.left = '50%'
    picker.style.top = `${buttonRect.top - 60}px`
    picker.style.transform = 'translateX(-50%)'
    picker.style.position = 'fixed'
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
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs sm:text-sm flex items-center space-x-1 transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] sm:text-xs text-gray-600">{userIds.length}</span>
                </button>
              )
            })}
          </>
        )}
        {onReact && (
          <div className={hasReactions ? 'absolute top-0 -right-6 sm:-right-4 inline-block' : 'relative inline-block'}>
            <button
              ref={buttonRef}
              onClick={() => setShowPicker(!showPicker)}
              className="p-0.5 sm:p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <Smile className="w-3 h-3 sm:w-4 sm:h-4" />
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
                  {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(emoji)
                      setShowPicker(false)
                    }}
                    className="text-xl sm:text-2xl hover:scale-125 transition-transform p-1 sm:p-1.5 flex-shrink-0"
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowPicker(false)
                    setShowEmojiModal(true)
                  }}
                  className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <EmojiPickerModal
        isOpen={showEmojiModal}
        onClose={() => setShowEmojiModal(false)}
        title="Chọn biểu cảm"
        emojis={EXTENDED_REACTIONS}
        onSelect={(emoji) => onReact?.(emoji)}
      />
    </>
  )
}

export default CommentReactions

