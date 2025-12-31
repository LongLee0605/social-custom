import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Search, MessageCircle, LogOut, Settings, X } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef(null)
  const searchResultsRef = useRef(null)
  
  const totalUnreadChats = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const searchUsers = async () => {
      setSearchLoading(true)
      try {
        const usersRef = collection(db, 'users')
        const snapshot = await getDocs(usersRef)
        const queryLower = searchQuery.toLowerCase()
        
        const results = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (user) =>
              user.uid &&
              user.uid !== currentUser?.uid &&
              (user.displayName?.toLowerCase().includes(queryLower) ||
                user.email?.toLowerCase().includes(queryLower))
          )
          .slice(0, 5)

        setSearchResults(results)
        setShowSearchResults(true)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setSearchLoading(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentUser?.uid])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleUserClick = () => {
    setSearchQuery('')
    setShowSearchResults(false)
  }


  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.svg" 
              alt="Social Custom Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Social Custom
            </span>
          </Link>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {showSearchResults && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
                >
                  {searchLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Không tìm thấy người dùng
                    </div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((user) => (
                        <Link
                          key={user.id}
                          to={`/profile/${user.uid}`}
                          onClick={handleUserClick}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <Avatar
                            src={user.photoURL}
                            alt={user.displayName}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {user.displayName || 'Người dùng'}
                            </p>
                            {user.email && (
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/chat"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors relative"
              title="Tin nhắn"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalUnreadChats > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs font-medium rounded-full min-w-[16px] h-4 sm:min-w-[18px] sm:h-[18px] flex items-center justify-center px-0.5 sm:px-1 text-[10px] sm:text-xs">
                  {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
                </span>
              )}
            </Link>
            <NotificationDropdown />
            
            <div className="relative group ml-1 sm:ml-2">
              <button className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <Avatar
                  src={currentUserInfo?.photoURL || userProfile?.photoURL || currentUser?.photoURL}
                  alt={currentUserInfo?.displayName || userProfile?.displayName || currentUser?.displayName}
                  size="sm"
                />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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

