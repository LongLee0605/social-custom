import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Search, MessageCircle, LogOut, Settings } from 'lucide-react'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import NotificationDropdown from '../notifications/NotificationDropdown'
import { useChats } from '../../hooks/useChats'
import { useUserInfo } from '../../hooks/useUserInfo'

const Header = () => {
  const { currentUser, userProfile, logout } = useAuth()
  const { chats } = useChats()
  const navigate = useNavigate()
  const currentUserInfo = useUserInfo(currentUser?.uid)
  
  const totalUnreadChats = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Social Custom
            </span>
          </Link>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/chat"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <MessageCircle className="w-6 h-6" />
              {totalUnreadChats > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
                </span>
              )}
            </Link>
            <NotificationDropdown />
            
            <div className="relative group ml-2">
              <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <Avatar
                  src={currentUserInfo?.photoURL || userProfile?.photoURL || currentUser?.photoURL}
                  alt={currentUserInfo?.displayName || userProfile?.displayName || currentUser?.displayName}
                  size="sm"
                />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  to={`/profile/${currentUser?.uid}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Trang cá nhân
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </Link>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

