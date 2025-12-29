import { useState } from 'react'
import { Smile } from 'lucide-react'

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

const MessageReactions = ({ reactions, onReact }) => {
  const [showPicker, setShowPicker] = useState(false)

  if (!reactions || Object.keys(reactions).length === 0) {
    if (!onReact) return null
    return (
      <div className="relative mt-1">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Smile className="w-4 h-4" />
        </button>
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 flex space-x-2 border border-gray-200 z-20">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji)
                  setShowPicker(false)
                }}
                className="text-2xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1 mt-1 flex-wrap">
      {Object.entries(reactions).map(([emoji, userIds]) => (
        <button
          key={emoji}
          onClick={() => onReact && onReact(emoji)}
          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm flex items-center space-x-1 transition-colors"
        >
          <span>{emoji}</span>
          <span className="text-xs text-gray-600">{userIds.length}</span>
        </button>
      ))}
      {onReact && (
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <Smile className="w-4 h-4" />
        </button>
      )}
      {showPicker && onReact && (
        <div className="absolute bg-white rounded-lg shadow-lg p-2 flex space-x-2 border border-gray-200 z-20">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(emoji)
                setShowPicker(false)
              }}
              className="text-2xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MessageReactions

