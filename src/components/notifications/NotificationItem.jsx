import { memo, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'
import { formatRelativeTime } from '../../utils/formatDate'
import { Heart, MessageCircle, UserPlus } from 'lucide-react'

const NotificationItem = memo(({ notification, onClick }) => {
  const userInfo = useUserInfo(notification.relatedUserId)

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />
    }
  }, [])

  const displayName = useMemo(() => userInfo?.displayName || notification.relatedUserName || 'Ai đó', [userInfo?.displayName, notification.relatedUserName])
  const photoURL = useMemo(() => userInfo?.photoURL || null, [userInfo?.photoURL])

  return (
    <Link
      to={notification.link || '#'}
      onClick={handleClick}
      className={`block p-4 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {notification.relatedUserId ? (
            <Avatar
              src={photoURL}
              alt={displayName}
              size="sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">
              {displayName}
            </span>{' '}
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
        {!notification.read && (
          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
        )}
      </div>
    </Link>
  )
})

NotificationItem.displayName = 'NotificationItem'

export default NotificationItem

