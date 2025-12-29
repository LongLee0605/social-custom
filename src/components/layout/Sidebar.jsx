import { Link, useLocation } from 'react-router-dom'
import { Home, User, MessageCircle, Settings, Users } from 'lucide-react'
import { clsx } from 'clsx'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/profile', icon: User, label: 'Trang cá nhân' },
    { path: '/chat', icon: MessageCircle, label: 'Tin nhắn' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' },
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-sm hidden lg:block">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={clsx(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

