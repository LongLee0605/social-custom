import { useState, memo, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'
import { formatRelativeTime, formatMessageTime } from '../../utils/formatDate'
import { MoreVertical, Trash2, Edit2, Smile } from 'lucide-react'
import MessageReactions from './MessageReactions'
import { linkifyText } from '../../utils/linkify'

const MessageBubble = memo(({ message, isGrouped, showAvatar, hasTimeGap, showTime, onDelete, onEdit, onReact, onRetry }) => {
  const { currentUser } = useAuth()
  const isOwn = useMemo(() => message.senderId === currentUser?.uid, [message.senderId, currentUser?.uid])
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const senderInfo = useUserInfo(message.senderId)

  const handleMenuToggle = useCallback(() => {
    setShowMenu(prev => !prev)
  }, [])

  const handleReactionsToggle = useCallback(() => {
    setShowReactions(prev => !prev)
    setShowMenu(false)
  }, [])

  const handleEditClick = useCallback(() => {
    if (onEdit) {
      onEdit(message)
      setShowMenu(false)
    }
  }, [onEdit, message])

  const handleDeleteClick = useCallback(() => {
    if (onDelete) {
      onDelete(message.id)
      setShowMenu(false)
    }
  }, [onDelete, message.id])

  const handleReactClick = useCallback((emoji) => {
    if (onReact) {
      onReact(message.id, emoji)
    }
  }, [onReact, message.id])

  const hasReactions = useMemo(() => {
    return message.reactions && typeof message.reactions === 'object' && Object.keys(message.reactions).length > 0
  }, [message.reactions])

  const textParts = useMemo(() => {
    if (!message.text) return []
    return linkifyText(message.text)
  }, [message.text])

  return (
    <div
      className={`flex group ${isOwn ? 'flex-row-reverse' : 'space-x-2'} ${
        hasTimeGap ? 'mt-6' : isGrouped && !hasReactions ? 'mt-0' : isGrouped ? 'mt-1' : 'mt-4'
      }`}
    >
      {!isOwn && (
        <div className="flex-shrink-0 w-8">
          {(!isGrouped || showAvatar) && (
            <div className="pt-[22px]">
              <Avatar
                src={senderInfo?.photoURL || null}
                alt={senderInfo?.displayName || message.senderName}
                size="sm"
              />
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${isOwn ? 'max-w-[90%] sm:max-w-[85%] lg:max-w-[70%]' : 'max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]'}`}>
        {!isGrouped && !isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-1">{senderInfo?.displayName || message.senderName}</span>
        )}

        <div className="relative group/message">
          <div
            className={`relative px-4 py-2 rounded-2xl shadow-sm transition-all ${
              isOwn
                ? message.status === 'failed'
                  ? 'bg-red-100 text-red-900 border border-red-300 rounded-tr-sm'
                  : 'bg-primary-600 text-white rounded-tr-sm'
                : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'
            } ${isGrouped ? (isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm') : ''} ${
              message.status === 'sending' ? 'opacity-70' : ''
            }`}
          >
            {message.text && (
              <p className={`whitespace-pre-wrap break-words ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                {message.edited && (
                  <span className="text-xs opacity-70 mr-1">(đã chỉnh sửa)</span>
                )}
                {textParts.map((part, index) => {
                  if (part.type === 'link') {
                    return (
                      <a
                        key={index}
                        href={part.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline hover:opacity-80 transition-opacity ${
                          isOwn ? 'text-blue-200' : 'text-primary-600'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {part.displayUrl}
                      </a>
                    )
                  }
                  return <span key={index}>{part.content}</span>
                })}
              </p>
            )}

            {message.imageURL && (
              <div className="mt-2 rounded-lg overflow-hidden max-w-sm">
                <img
                  src={message.imageURL}
                  alt="Message"
                  className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.imageURL, '_blank')}
                />
              </div>
            )}

            {message.fileURL && (
              <div className="mt-2 flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                  <p className="text-xs opacity-70">{message.fileSize}</p>
                </div>
                <a
                  href={message.fileURL}
                  download
                  className="text-primary-600 hover:text-primary-700"
                >
                  Tải xuống
                </a>
              </div>
            )}

            {isOwn && (
              <div className="absolute -right-6 sm:-right-8 top-0 opacity-0 group-hover/message:opacity-100 transition-opacity">
                <div className="relative">
                  <button
                    onClick={handleMenuToggle}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200" style={{ maxWidth: 'min(160px, calc(100vw - 2rem))' }}>
                      <button
                        onClick={handleReactionsToggle}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Smile className="w-4 h-4" />
                        <span>Thêm biểu cảm</span>
                      </button>
                      {onEdit && (
                        <button
                          onClick={handleEditClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Chỉnh sửa</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={handleDeleteClick}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {hasReactions && (
            <div className="mt-1">
              <MessageReactions
                reactions={message.reactions}
                onReact={onReact ? handleReactClick : null}
                isOwn={isOwn}
              />
            </div>
          )}
          {!hasReactions && onReact && (
            <div className={`opacity-0 group-hover/message:opacity-100 transition-opacity absolute bg-white rounded-full shadow-lg border border-gray-200 -top-1 ${isOwn ? '-left-4' : '-right-4'}`}>
              <MessageReactions
                reactions={{}}
                onReact={handleReactClick}
                isOwn={isOwn}
              />
            </div>
          )}

          {hasTimeGap && (
            <div className={`flex items-center mt-2 mb-1 w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          )}
          {!hasTimeGap && (
            <div className={`flex items-center space-x-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
              {showTime && (
                <span className={`text-xs ${isOwn ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatMessageTime(message.createdAt)}
                </span>
              )}
              {isOwn && (
                <>
                  {message.status === 'sending' && (
                    <span className="text-xs text-gray-400 animate-pulse">⏳</span>
                  )}
                  {message.status === 'failed' && onRetry && (
                    <button
                      onClick={onRetry}
                      className="text-xs text-red-500 hover:text-red-700"
                      title="Gửi lại"
                    >
                      ⚠️
                    </button>
                  )}
                  {message.status === 'sent' && message.read && (
                    <span className="text-xs text-primary-600" title="Đã đọc">✓✓</span>
                  )}
                  {message.status === 'sent' && !message.read && (
                    <span className="text-xs text-gray-400" title="Đã gửi">✓</span>
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

