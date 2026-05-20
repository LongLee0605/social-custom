import { useState, memo, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'
import { formatMessageTime } from '../../utils/formatDate'
import { MoreVertical, Trash2, Edit2 } from 'lucide-react'
import MessageReactions from './MessageReactions'
import { linkifyText } from '../../utils/linkify'
import { cn } from '@/lib/cn'

const formatFileSize = (bytes) => {
  if (!bytes || typeof bytes !== 'number') return ''
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

const MessageBubble = memo(({
  message,
  isGrouped,
  showAvatar,
  hasTimeGap,
  showTime,
  onDeleteRequest,
  onEdit,
  onReact,
  onRetry,
}) => {
  const { currentUser } = useAuth()
  const isOwn = useMemo(
    () => message.senderId === currentUser?.uid,
    [message.senderId, currentUser?.uid]
  )
  const [showMenu, setShowMenu] = useState(false)
  const senderInfo = useUserInfo(message.senderId)

  const handleMenuToggle = useCallback(() => {
    setShowMenu((prev) => !prev)
  }, [])

  const handleEditClick = useCallback(() => {
    onEdit?.(message)
    setShowMenu(false)
  }, [onEdit, message])

  const handleDeleteClick = useCallback(() => {
    onDeleteRequest?.(message.id)
    setShowMenu(false)
  }, [onDeleteRequest, message.id])

  const handleReactClick = useCallback(
    (emoji) => {
      onReact?.(message.id, emoji)
    },
    [onReact, message.id]
  )

  const hasReactions = useMemo(
    () =>
      message.reactions &&
      typeof message.reactions === 'object' &&
      Object.keys(message.reactions).length > 0,
    [message.reactions]
  )

  const textParts = useMemo(() => {
    if (!message.text) return []
    return linkifyText(message.text)
  }, [message.text])

  const canEdit = isOwn && message.text && message.status !== 'failed'
  const canDelete = isOwn && onDeleteRequest

  return (
    <div
      className={cn(
        'flex group',
        isOwn ? 'flex-row-reverse' : 'gap-2',
        hasTimeGap ? 'mt-5' : isGrouped && !hasReactions ? 'mt-0.5' : isGrouped ? 'mt-1' : 'mt-3'
      )}
    >
      {!isOwn && (
        <div className="w-8 shrink-0">
          {(!isGrouped || showAvatar) && (
            <div className="pt-5">
              <Avatar
                src={senderInfo?.photoURL || null}
                alt={senderInfo?.displayName || message.senderName}
                size="sm"
              />
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          'flex min-w-0 flex-col',
          isOwn ? 'items-end max-w-[88%] sm:max-w-[80%]' : 'items-start max-w-[85%] sm:max-w-[72%]'
        )}
      >
        {!isGrouped && !isOwn && (
          <span className="mb-1 px-1 text-xs font-medium text-slate-500">
            {senderInfo?.displayName || message.senderName}
          </span>
        )}

        <div className="relative group/message w-full">
          <div
            className={cn(
              'relative rounded-2xl px-3.5 py-2 shadow-soft transition-all',
              isOwn
                ? message.status === 'failed'
                  ? 'rounded-tr-md border border-red-300 bg-red-50 text-red-900'
                  : 'rounded-tr-md bg-brand-600 text-white'
                : 'rounded-tl-md border border-surface-border bg-white text-slate-900',
              isGrouped && (isOwn ? 'rounded-tr-md' : 'rounded-tl-md'),
              message.status === 'sending' && 'opacity-70'
            )}
          >
            {message.text && (
              <p className={cn('whitespace-pre-wrap break-words text-[15px] leading-relaxed', isOwn && 'text-white')}>
                {message.edited && (
                  <span className={cn('mr-1 text-xs', isOwn ? 'text-white/70' : 'text-slate-400')}>
                    (đã sửa)
                  </span>
                )}
                {textParts.map((part, index) =>
                  part.type === 'link' ? (
                    <a
                      key={index}
                      href={part.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'underline hover:opacity-80',
                        isOwn ? 'text-brand-100' : 'text-brand-600'
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {part.displayUrl}
                    </a>
                  ) : (
                    <span key={index}>{part.content}</span>
                  )
                )}
              </p>
            )}

            {message.imageURL && (
              <div className="mt-2 max-w-xs overflow-hidden rounded-xl">
                <img
                  src={message.imageURL}
                  alt="Ảnh đính kèm"
                  className="h-auto w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
                  onClick={() => {
                    const w = window.open(message.imageURL, '_blank', 'noopener,noreferrer')
                    if (w) w.opener = null
                  }}
                />
              </div>
            )}

            {message.fileURL && (
              <a
                href={message.fileURL}
                download={message.fileName}
                className={cn(
                  'mt-2 flex items-center gap-2 rounded-xl p-2.5 transition-colors',
                  isOwn ? 'bg-white/15 hover:bg-white/25' : 'bg-slate-50 hover:bg-slate-100'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{message.fileName || 'Tệp đính kèm'}</p>
                  {message.fileSize && (
                    <p className={cn('text-xs', isOwn ? 'text-white/70' : 'text-slate-500')}>
                      {formatFileSize(message.fileSize)}
                    </p>
                  )}
                </div>
                <span className={cn('shrink-0 text-xs font-medium', isOwn ? 'text-brand-100' : 'text-brand-600')}>
                  Tải xuống
                </span>
              </a>
            )}

            {(canEdit || canDelete || onReact) && (
              <div
                className={cn(
                  'absolute top-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/message:opacity-100',
                  isOwn ? '-left-8' : '-right-8'
                )}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleMenuToggle}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Tùy chọn tin nhắn"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} aria-hidden />
                      <div
                        className={cn(
                          'absolute z-20 mt-1 w-44 rounded-xl border border-surface-border bg-white py-1 shadow-elevated',
                          isOwn ? 'right-0' : 'left-0'
                        )}
                      >
                        {onReact && (
                          <p className="px-3 py-1.5 text-xs font-medium text-slate-400">Biểu cảm</p>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={handleEditClick}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Edit2 className="h-4 w-4" />
                            Chỉnh sửa
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {(hasReactions || onReact) && (
            <div className="mt-1">
              <MessageReactions
                reactions={message.reactions}
                onReact={onReact ? handleReactClick : null}
                isOwn={isOwn}
              />
            </div>
          )}

          {hasTimeGap && (
            <div className={cn('mt-2 flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          )}
          {!hasTimeGap && (
            <div className={cn('mt-1 flex items-center gap-1 px-0.5', isOwn && 'flex-row-reverse')}>
              {showTime && (
                <span className="text-[11px] text-slate-400">
                  {formatMessageTime(message.createdAt)}
                </span>
              )}
              {isOwn && (
                <>
                  {message.status === 'sending' && (
                    <span className="text-[11px] text-slate-400">Đang gửi…</span>
                  )}
                  {message.status === 'failed' && onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="text-[11px] font-medium text-red-500 hover:text-red-700"
                    >
                      Gửi lại
                    </button>
                  )}
                  {message.status === 'sent' && message.read && (
                    <span className="text-[11px] text-brand-500" title="Đã đọc">
                      ✓✓
                    </span>
                  )}
                  {message.status === 'sent' && !message.read && (
                    <span className="text-[11px] text-slate-400" title="Đã gửi">
                      ✓
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'

export default MessageBubble
