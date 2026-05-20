import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, User, MessageCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/contexts/AuthContext'

const NAV = [
  { path: '/', icon: Home, label: 'Trang chủ', match: (p) => p === '/' },
  { path: '/profile', icon: User, label: 'Cá nhân', match: (p, uid) => p.startsWith('/profile') || p === `/profile/${uid}` },
  { path: '/chat', icon: MessageCircle, label: 'Tin nhắn', match: (p) => p.startsWith('/chat') },
  { path: '/settings', icon: Settings, label: 'Cài đặt', match: (p) => p.startsWith('/settings') },
]

const Sidebar = () => {
  const { pathname } = useLocation()
  const { currentUser } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const items = NAV.map((item) => ({
    ...item,
    to: item.path === '/profile' ? `/profile/${currentUser?.uid || ''}` : item.path,
    active: item.match(pathname, currentUser?.uid),
  }))

  const linkClass = (active, compact) =>
    cn(
      compact
        ? 'flex flex-col items-center min-w-[56px] py-1.5 rounded-xl transition-colors'
        : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
      compact ? (active ? 'text-brand-600' : 'text-slate-500') : active ? 'nav-active' : 'nav-idle'
    )

  return (
    <>
      <aside className="fixed left-0 top-14 sm:top-16 z-40 hidden lg:flex lg:flex-col w-60 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] border-r border-surface-border/80 bg-white/90 backdrop-blur-md p-3">
        <nav className="space-y-1">
          {items.map(({ to, icon: Icon, label, active }) => (
            <Link key={to} to={to} className={linkClass(active, false)}>
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <nav
        className="mobile-tab-bar lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-surface-border bg-white/95 backdrop-blur-lg px-2"
        aria-label="Điều hướng chính"
      >
        {items.map(({ to, icon: Icon, label, active }) => (
          <Link key={to} to={to} className={linkClass(active, true)}>
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', active && 'bg-brand-100')}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-medium mt-0.5">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

export default Sidebar
