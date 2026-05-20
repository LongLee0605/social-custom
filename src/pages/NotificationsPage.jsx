import { Link } from 'react-router-dom'
import { useNotifications } from '@/contexts/NotificationsContext'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import NotificationItem from '@/components/notifications/NotificationItem'
const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()

  const handleClick = async (notification) => {
    if (!notification.read) await markAsRead(notification.id)
  }

  return (
    <div className="mx-auto max-w-2xl page-stack animate-fade-in">
      <PageHeader
        title="Thông báo"
        description={unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Đánh dấu đã đọc
            </Button>
          ) : null
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState message="Chưa có thông báo. Khi có hoạt động mới, bạn sẽ thấy tại đây." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-soft divide-y divide-surface-border">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleClick(notification)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-sm text-slate-500">
        <Link to="/" className="text-brand-600 hover:text-brand-700 font-medium">
          ← Về trang chủ
        </Link>
      </p>
    </div>
  )
}

export default NotificationsPage
