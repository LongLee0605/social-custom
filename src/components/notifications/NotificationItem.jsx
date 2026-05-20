import { memo, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { useUserInfo } from '../../hooks/useUserInfo'
import { formatRelativeTime } from '../../utils/formatDate'
import { Heart, MessageCircle, UserPlus, MessageSquare, FileText, Bell } from 'lucide-react'
import { cn } from '@/lib/cn'

const NotificationItem = memo(({ notification, onClick }) => {
  const userInfo = useUserInfo(notification.relatedUserId)

  const displayName = useMemo(
    () => userInfo?.displayName || notification.relatedUserName || 'Ai đó',
    [userInfo?.displayName, notification.relatedUserName]
  )
  const photoURL = useMemo(() => userInfo?.photoURL || null, [userInfo?.photoURL])

  const getNotificationLink = useCallback(() => {
    if (notification.link) return notification.link
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'new_post':
        return notification.relatedPostId ? `/?postId=${notification.relatedPostId}` : '/'
      case 'message':
        return notification.relatedUserId ? `/chat?userId=${notification.relatedUserId}` : '/chat'
      case 'follow':
        return notification.relatedUserId ? `/profile/${notification.relatedUserId}` : '/'
      default:
        return '/notifications'
    }
  }, [notification])

  const icon = useMemo(() => {
    const cls = 'h-5 w-5'
    switch (notification.type) {
      case 'like':
        return <Heart className={cn(cls, 'text-red-500')} />
      case 'comment':
        return <MessageCircle className={cn(cls, 'text-brand-500')} />
      case 'follow':
        return <UserPlus className={cn(cls, 'text-emerald-500')} />
      case 'message':
        return <MessageSquare className={cn(cls, 'text-violet-500')} />
      case 'new_post':
        return <FileText className={cn(cls, 'text-amber-500')} />
      default:
        return <Bell className={cn(cls, 'text-slate-400')} />
    }
  }, [notification.type])

  return (
    <Link
      to={getNotificationLink()}
      onClick={onClick}
      className={cn(
        'block p-4 transition-colors hover:bg-slate-50',
        !notification.read && 'bg-brand-50/60'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {notification.relatedUserId ? (
            <Avatar src={photoURL} alt={displayName} size="sm" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
              {icon}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-800">
            <span className="font-semibold text-slate-900">{displayName}</span>{' '}
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
        {!notification.read && (
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden />
        )}
      </div>
    </Link>
  )
})

NotificationItem.displayName = 'NotificationItem'

export default NotificationItem
