import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import { useMessages } from '../../hooks/useMessages'
import { useTyping } from '../../hooks/useTyping'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useUserInfo } from '../../hooks/useUserInfo'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import { formatRelativeTime } from '../../utils/formatDate'
import { MoreVertical, Phone, Video, Search, ArrowDown, X } from 'lucide-react'
import AlertModal from '../ui/AlertModal'
import Input from '../ui/Input'

const ChatWindow = ({ chat }) => {
  const { currentUser } = useAuth()

  // Validate chat object
  if (!chat || !chat.id) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Lỗi: Không tìm thấy thông tin cuộc trò chuyện</p>
        </div>
      </Card>
    )
  }

  const {
    messages,
    loading,
    hasMore,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    markAsRead,
    retryFailedMessage,
  } = useMessages(chat.id)
  const { typingUsers, setTyping } = useTyping(chat.id)
  const { isOnline, lastSeen } = useOnlineStatus(chat.userId)
  const userInfo = useUserInfo(chat.userId)
  const [editingMessage, setEditingMessage] = useState(null)
  const [editText, setEditText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const scrollTimeoutRef = useRef(null)
  const lastScrollTopRef = useRef(0)
  const isScrollingDownRef = useRef(false)

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const query = searchQuery.toLowerCase()
    return messages.filter((msg) => {
      if (msg.text?.toLowerCase().includes(query)) return true
      if (msg.senderName?.toLowerCase().includes(query)) return true
      return false
    })
  }, [messages, searchQuery])

  const groupedMessages = useMemo(() => {
    return filteredMessages.reduce((groups, message, index) => {
      const prevMessage = index > 0 ? filteredMessages[index - 1] : null
      const nextMessage = index < filteredMessages.length - 1 ? filteredMessages[index + 1] : null

      const timeDiff = prevMessage && message.createdAt && prevMessage.createdAt
        ? (message.createdAt.toMillis?.() || new Date(message.createdAt).getTime()) -
        (prevMessage.createdAt.toMillis?.() || new Date(prevMessage.createdAt).getTime())
        : Infinity

      const nextTimeDiff = nextMessage && message.createdAt && nextMessage.createdAt
        ? (nextMessage.createdAt.toMillis?.() || new Date(nextMessage.createdAt).getTime()) -
        (message.createdAt.toMillis?.() || new Date(message.createdAt).getTime())
        : Infinity

      const isGrouped =
        prevMessage &&
        prevMessage.senderId === message.senderId &&
        timeDiff < 300000

      const hasTimeGap = timeDiff >= 180000
      const nextHasTimeGap = nextTimeDiff >= 180000

      groups.push({
        ...message,
        isGrouped,
        showAvatar: !isGrouped,
        hasTimeGap,
        showTime: hasTimeGap || (!nextHasTimeGap && index === filteredMessages.length - 1),
      })

      return groups
    }, [])
  }, [filteredMessages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    // Ẩn button khi đang scroll to bottom
    setShowScrollButton(false)
    // Reset scroll direction
    isScrollingDownRef.current = false
  }, [])

  useEffect(() => {
    if (messages.length > 0 && !searchQuery) {
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [messages.length, scrollToBottom, searchQuery])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      const isNearBottom = distanceFromBottom < 150
      
      // Xác định hướng scroll
      const currentScrollTop = scrollTop
      const isScrollingDown = currentScrollTop > lastScrollTopRef.current
      isScrollingDownRef.current = isScrollingDown
      lastScrollTopRef.current = currentScrollTop

      // Ẩn button nếu:
      // 1. Đang ở gần bottom
      // 2. Đang search
      // 3. Đang scroll down (chỉ hiện khi scroll up)
      // 4. Không có đủ tin nhắn để scroll
      const shouldShow = !isNearBottom && 
                        !searchQuery && 
                        !isScrollingDown && 
                        scrollHeight > clientHeight &&
                        distanceFromBottom > 50

      // Debounce để tránh re-render nhiều
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setShowScrollButton(shouldShow)
      }, 150)
    }

    // Kiểm tra ban đầu
    handleScroll()

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [searchQuery])

  useEffect(() => {
    if (chat.id && messages.length > 0 && !searchQuery) {
      const timer = setTimeout(() => {
        markAsRead()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [chat.id, messages.length, markAsRead, searchQuery])

  const handleSend = useCallback(async (text) => {
    if (!text?.trim()) return
    setSending(true)
    try {
      const result = await sendMessage(text)
      if (result.success) {
        setTyping(false)
        setTimeout(() => scrollToBottom(), 100)
      } else if (result.error) {
        console.error('Error sending message:', result.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }, [sendMessage, setTyping, scrollToBottom])

  const handleSendImage = useCallback(async (imageURL, fileName) => {
    if (!imageURL) return
    setSending(true)
    try {
      const result = await sendMessage(null, imageURL)
      if (result.success) {
        setTimeout(() => scrollToBottom(), 100)
      } else if (result.error) {
        console.error('Error sending image:', result.error)
      }
    } catch (error) {
      console.error('Error sending image:', error)
    } finally {
      setSending(false)
    }
  }, [sendMessage, scrollToBottom])

  const handleSendFile = useCallback(async (fileURL, fileName, fileSize) => {
    if (!fileURL) return
    setSending(true)
    try {
      const result = await sendMessage(null, null, fileURL, fileName, fileSize)
      if (result.success) {
        setTimeout(() => scrollToBottom(), 100)
      } else if (result.error) {
        console.error('Error sending file:', result.error)
      }
    } catch (error) {
      console.error('Error sending file:', error)
    } finally {
      setSending(false)
    }
  }, [sendMessage, scrollToBottom])

  const handleEdit = useCallback((message) => {
    setEditingMessage(message)
    setEditText(message.text || '')
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (editingMessage && editText.trim()) {
      await editMessage(editingMessage.id, editText)
      setEditingMessage(null)
      setEditText('')
    }
  }, [editingMessage, editText, editMessage])

  const handleDeleteMessage = useCallback(async (messageId) => {
    await deleteMessage(messageId)
    setShowDeleteConfirm(null)
  }, [deleteMessage])

  const handleReactMessage = useCallback(async (messageId, emoji) => {
    await reactToMessage(messageId, emoji)
  }, [reactToMessage])

  const handleTyping = useCallback((text) => {
    if (text && text.length > 0) {
      setTyping(true)
    } else {
      setTyping(false)
    }
  }, [setTyping])

  const getStatusText = useCallback(() => {
    if (isOnline) {
      return 'Đang hoạt động'
    }
    if (lastSeen) {
      return `Hoạt động ${formatRelativeTime(lastSeen)}`
    }
    return 'Offline'
  }, [isOnline, lastSeen])

  const handleScrollToTop = useCallback(() => {
    if (hasMore && !loading) {
      loadMoreMessages()
    }
  }, [hasMore, loading, loadMoreMessages])

  return (
    <Card className="lg:h-full h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <Link
          to={`/profile/${chat.userId}`}
          className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="relative flex-shrink-0">
            <Avatar
              src={userInfo?.photoURL || null}
              alt={userInfo?.displayName || chat.userName}
              size="sm"
              className="sm:hidden"
            />
            <Avatar
              src={userInfo?.photoURL || null}
              alt={userInfo?.displayName || chat.userName}
              size="md"
              className="hidden sm:block"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate hover:text-primary-600 transition-colors">
              {userInfo?.displayName || chat.userName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {typingUsers.length > 0
                ? 'Đang soạn tin nhắn...'
                : getStatusText()}
            </p>
          </div>
        </Link>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Tìm kiếm tin nhắn"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            className="hidden sm:block p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Gọi điện"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            className="hidden sm:block p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Gọi video"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            className="hidden sm:block p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Thêm"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="p-2 sm:p-3 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin nhắn..."
              className="pl-9 sm:pl-10 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-1">
              Tìm thấy {filteredMessages.length} tin nhắn
            </p>
          )}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 bg-gray-50 relative scrollbar-thin"
        style={{ scrollBehavior: 'smooth' }}
        onScroll={(e) => {
          const container = e.target
          if (container.scrollTop === 0 && hasMore && !loading) {
            const previousScrollHeight = container.scrollHeight
            loadMoreMessages().then(() => {
              setTimeout(() => {
                container.scrollTop = container.scrollHeight - previousScrollHeight
              }, 100)
            })
          }
        }}
      >
        {loading && messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">
              {searchQuery ? 'Không tìm thấy tin nhắn nào' : 'Chưa có tin nhắn nào'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy bắt đầu cuộc trò chuyện!'}
            </p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center py-2">
                <button
                  onClick={handleScrollToTop}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Đang tải...' : 'Tải thêm tin nhắn cũ'}
                </button>
              </div>
            )}
            <div className="space-y-1">
              {groupedMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isGrouped={message.isGrouped}
                  showAvatar={message.showAvatar}
                  hasTimeGap={message.hasTimeGap}
                  showTime={message.showTime}
                  onEdit={handleEdit}
                  onDelete={handleDeleteMessage}
                  onReact={handleReactMessage}
                  onRetry={message.status === 'failed' ? () => retryFailedMessage(message.id) : null}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
        {showScrollButton && (
          <div className='flex w-full items-center justify-center absolute bottom-4 left-0 right-0 z-10 animate-fade-in'>
            <button
              onClick={scrollToBottom}
              className="bg-primary-600 text-white rounded-full p-2 sm:p-3 shadow-lg hover:bg-primary-700 transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Cuộn xuống dưới"
            >
              <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {editingMessage && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSaveEdit()
                }
                if (e.key === 'Escape') {
                  setEditingMessage(null)
                  setEditText('')
                }
              }}
              className="flex-1"
              autoFocus
            />
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Lưu
            </button>
            <button
              onClick={() => {
                setEditingMessage(null)
                setEditText('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        onSendImage={handleSendImage}
        onSendFile={handleSendFile}
        onTyping={handleTyping}
        disabled={sending}
      />

      <AlertModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        type="warning"
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa tin nhắn này? Hành động này không thể hoàn tác."
        onConfirm={() => handleDeleteMessage(showDeleteConfirm)}
      />
    </Card>
  )
}

export default ChatWindow
