import { useMemo, useCallback } from 'react'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'
import { formatRelativeTime } from '../../utils/formatDate'
import { cn } from '@/lib/cn'

const ChatListItem = ({ chat, isSelected, onClick }) => {
  const userInfo = useUserInfo(chat.userId)

  const displayName = useMemo(
    () => userInfo?.displayName || chat.userName,
    [userInfo?.displayName, chat.userName]
  )
  const photoURL = useMemo(() => userInfo?.photoURL || chat.userPhotoURL || null, [userInfo?.photoURL, chat.userPhotoURL])

  const timeLabel = useMemo(() => {
    if (!chat.updatedAt) return null
    const date = chat.updatedAt.toDate?.() || new Date(chat.updatedAt.toMillis?.() || chat.updatedAt)
    return formatRelativeTime(date)
  }, [chat.updatedAt])

  const handleClick = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (onClick && chat?.id) onClick(chat)
    },
    [onClick, chat]
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full p-3 text-left transition-colors sm:p-4',
        isSelected ? 'border-l-4 border-brand-600 bg-brand-50/80' : 'hover:bg-slate-50'
      )}
      aria-label={`Mở cuộc trò chuyện với ${displayName}`}
      aria-current={isSelected ? 'true' : undefined}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar src={photoURL} alt={displayName} size="md" />
          {chat.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-slate-900">{displayName}</p>
            {timeLabel && <span className="shrink-0 text-xs text-slate-400">{timeLabel}</span>}
          </div>
          <p className="truncate text-sm text-slate-500">{chat.lastMessage || 'Chưa có tin nhắn'}</p>
        </div>
        {chat.unreadCount > 0 && (
          <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white">
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </span>
        )}
      </div>
    </button>
  )
}

export default ChatListItem
