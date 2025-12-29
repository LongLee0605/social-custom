import { useEffect, memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'
import { Heart, MessageCircle, UserPlus, MessageSquare, X } from 'lucide-react'

const ToastNotification = memo(({ notification, onClose, onMarkAsRead }) => {
  const userInfo = useUserInfo(notification.relatedUserId)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-500" />
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />
    }
  }, [])

  const getNotificationLink = useCallback(() => {
    if (notification.link) {
      return notification.link
    }

    switch (notification.type) {
      case 'like':
      case 'comment':
        return notification.relatedPostId ? `/?postId=${notification.relatedPostId}` : '/'
      case 'message':
        return notification.relatedUserId ? `/chat?userId=${notification.relatedUserId}` : '/chat'
      case 'follow':
        return notification.relatedUserId ? `/profile/${notification.relatedUserId}` : '/'
      default:
        return '/'
    }
  }, [notification])

  const handleClick = useCallback((e) => {
    e.preventDefault()
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    const link = getNotificationLink()
    if (link && link !== '#') {
      navigate(link)
    }
    onClose()
  }, [notification.read, notification.id, onMarkAsRead, onClose, navigate, getNotificationLink])

  const handleCloseClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    onClose()
  }, [onClose, notification.read, notification.id, onMarkAsRead])

  const displayName = useMemo(() => userInfo?.displayName || notification.relatedUserName || 'Ai đó', [userInfo?.displayName, notification.relatedUserName])
  const photoURL = useMemo(() => userInfo?.photoURL || null, [userInfo?.photoURL])

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[320px] max-w-[400px] animate-slide-in cursor-pointer">
      <div
        onClick={handleClick}
        className="flex items-start space-x-3"
      >
        <div className="flex-shrink-0">
          {notification.relatedUserId ? (
            <Avatar
              src={photoURL}
              alt={displayName}
              size="md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">
              {displayName}
            </span>{' '}
            {notification.message}
          </p>
        </div>
        <button
          onClick={handleCloseClick}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
})

ToastNotification.displayName = 'ToastNotification'

export default ToastNotification

