import { useState, memo, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'
import { formatRelativeTime, formatMessageTime } from '../../utils/formatDate'
import { MoreVertical, Trash2, Edit2, Smile } from 'lucide-react'
import MessageReactions from './MessageReactions'

const MessageBubble = memo(({ message, isGrouped, showAvatar, onDelete, onEdit, onReact }) => {
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

  return (
    <div
      className={`flex items-end space-x-2 group ${isOwn ? 'flex-row-reverse space-x-reverse' : ''} ${
        isGrouped ? 'mt-1' : 'mt-4'
      }`}
    >
      {(!isGrouped || showAvatar) && !isOwn && (
        <div className="flex-shrink-0">
          <Avatar
            src={senderInfo?.photoURL || null}
            alt={senderInfo?.displayName || message.senderName}
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}
      {isOwn && <div className="flex-shrink-0 w-8"></div>}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%] lg:max-w-[60%]`}>
        {!isGrouped && !isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-1">{senderInfo?.displayName || message.senderName}</span>
        )}

        <div className="relative group/message">
          <div
            className={`relative px-4 py-2 rounded-2xl shadow-sm transition-all ${
              isOwn
                ? 'bg-primary-600 text-white rounded-tr-sm'
                : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'
            } ${isGrouped ? (isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm') : ''}`}
          >
            {message.text && (
              <p className={`whitespace-pre-wrap break-words ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                {message.edited && (
                  <span className="text-xs opacity-70 mr-1">(đã chỉnh sửa)</span>
                )}
                {message.text}
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
              <div className="absolute -right-8 top-0 opacity-0 group-hover/message:opacity-100 transition-opacity">
                <div className="relative">
                  <button
                    onClick={handleMenuToggle}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
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

          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="mt-1">
              <MessageReactions
                reactions={message.reactions}
                onReact={onReact ? handleReactClick : null}
              />
            </div>
          )}
          {(!message.reactions || Object.keys(message.reactions).length === 0) && onReact && (
            <div className="mt-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
              <MessageReactions
                reactions={{}}
                onReact={handleReactClick}
              />
            </div>
          )}

          <div className={`flex items-center space-x-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className={`text-xs ${isOwn ? 'text-gray-500' : 'text-gray-400'}`}>
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwn && message.read && (
              <span className="text-xs text-primary-600">✓✓</span>
            )}
            {isOwn && !message.read && message.sent && (
              <span className="text-xs text-gray-400">✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'

export default MessageBubble

