import { useMemo, useCallback } from 'react'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'

const ChatListItem = ({ chat, isSelected, onClick }) => {
  const userInfo = useUserInfo(chat.userId)

  const displayName = useMemo(() => userInfo?.displayName || chat.userName, [userInfo?.displayName, chat.userName])
  const photoURL = useMemo(() => userInfo?.photoURL || null, [userInfo?.photoURL])
  const timeString = useMemo(() => {
    if (!chat.updatedAt) return null
    return new Date(chat.updatedAt.toMillis?.() || chat.updatedAt).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [chat.updatedAt])

  const handleClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick && chat?.id) {
      onClick(chat)
    }
  }, [onClick, chat])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
        isSelected ? 'bg-primary-50 border-l-4 border-primary-600' : ''
      }`}
      aria-label={`Mở cuộc trò chuyện với ${displayName}`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <Avatar
            src={photoURL}
            alt={displayName}
            size="md"
          />
          {chat.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-900 truncate">
              {displayName}
            </p>
            {timeString && (
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                {timeString}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {chat.lastMessage || 'Chưa có tin nhắn'}
          </p>
        </div>
        {chat.unreadCount > 0 && (
          <span className="bg-primary-600 text-white text-xs font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </span>
        )}
      </div>
    </button>
  )
}

export default ChatListItem

