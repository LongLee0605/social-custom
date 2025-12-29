import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, User, MessageCircle, Settings, Menu, X } from 'lucide-react'
import { clsx } from 'clsx'

const Sidebar = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/profile', icon: User, label: 'Trang cá nhân' },
    { path: '/chat', icon: MessageCircle, label: 'Tin nhắn' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' },
  ]

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const NavContent = () => (
    <nav className="p-3 sm:p-4">
      <ul className="space-y-1 sm:space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path))
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={clsx(
                  'flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base',
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <>
      <aside className="fixed left-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-64 bg-white shadow-sm hidden lg:block z-40">
        <NavContent />
      </aside>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <nav className="flex items-center justify-around px-2 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-600'
                )}
                title={item.label}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export default Sidebar

