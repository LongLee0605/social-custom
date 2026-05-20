import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '@/contexts/NotificationsContext'
import { Bell } from 'lucide-react'
import Button from '../ui/Button'
import NotificationItem from './NotificationItem'

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleNotificationClick = useCallback(
    async (notification) => {
      if (!notification.read) await markAsRead(notification.id)
      setIsOpen(false)
    },
    [markAsRead]
  )

  const displayNotifications = useMemo(() => notifications.slice(0, 10), [notifications])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="relative rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-600"
        aria-label="Thông báo"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 flex max-h-[min(70dvh,500px)] w-80 flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-elevated">
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
            <h3 className="font-semibold text-slate-900">Thông báo</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                Đọc tất cả
              </Button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-custom">
            {displayNotifications.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">Chưa có thông báo</p>
            ) : (
              <div className="divide-y divide-surface-border">
                {displayNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-surface-border p-3 text-center">
              <Link
                to="/notifications"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
