import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchUsersByPrefix, searchUsersFallback } from '@/repositories/usersRepository'
import { useAuth } from '@/contexts/AuthContext'
import { Search, MessageCircle, LogOut, Settings, X, ChevronDown } from 'lucide-react'
import Avatar from '../ui/Avatar'
import NotificationDropdown from '../notifications/NotificationDropdown'
import { useChats } from '@/hooks/useChats'
import { useUserInfo } from '@/hooks/useUserInfo'

const Header = () => {
  const { currentUser, userProfile, profileError, logout } = useAuth()
  const { chats } = useChats()
  const navigate = useNavigate()
  const currentUserInfo = useUserInfo(currentUser?.uid)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchRef = useRef(null)
  const searchResultsRef = useRef(null)
  const userMenuRef = useRef(null)

  const totalUnreadChats = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (!searchResultsRef.current?.contains(event.target)) {
          setShowSearchResults(false)
        }
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      setSearchLoading(false)
      return
    }

    let cancelled = false
    const queryAtStart = searchQuery

    const runSearch = async () => {
      setSearchLoading(true)
      try {
        let results = await searchUsersByPrefix(queryAtStart, currentUser?.uid, 5)
        if (results.length === 0) {
          results = await searchUsersFallback(queryAtStart, currentUser?.uid, 5)
        }
        if (!cancelled && queryAtStart === searchQuery) {
          setSearchResults(results)
          setShowSearchResults(true)
        }
      } catch (error) {
        console.error('Error searching users:', error)
        if (!cancelled && queryAtStart === searchQuery) {
          try {
            const results = await searchUsersFallback(queryAtStart, currentUser?.uid, 5)
            setSearchResults(results)
            setShowSearchResults(true)
          } catch {
            setSearchResults([])
          }
        }
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    }

    const timeoutId = setTimeout(runSearch, 300)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [searchQuery, currentUser?.uid])

  const handleLogout = async () => {
    setUserMenuOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="glass-header sticky top-0 z-50">
      {profileError && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 sm:text-sm">
          Không tải được hồ sơ. Một số tính năng có thể bị hạn chế.
        </div>
      )}
      <div className="container-custom">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity"
          >
            <img src="/logo.svg" alt="Social Custom" className="h-9 w-9 sm:h-10 sm:w-10" />
            <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
              Social Custom
            </span>
          </Link>

          <div className="hidden md:block flex-1 max-w-md mx-2">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="w-full rounded-full border border-surface-border bg-slate-50/80 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showSearchResults && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-surface-border bg-white shadow-elevated max-h-80 overflow-y-auto scrollbar-custom"
                >
                  {searchLoading ? (
                    <div className="p-6 text-center">
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p className="p-4 text-center text-sm text-slate-500">Không tìm thấy người dùng</p>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((user) => (
                        <Link
                          key={user.id}
                          to={`/profile/${user.uid}`}
                          onClick={() => {
                            setSearchQuery('')
                            setShowSearchResults(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <Avatar src={user.photoURL} alt={user.displayName} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 truncate">
                              {user.displayName || 'Người dùng'}
                            </p>
                            {user.email && (
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
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

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link
              to="/chat"
              className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
              title="Tin nhắn"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              {totalUnreadChats > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
                </span>
              )}
            </Link>
            <NotificationDropdown />

            <div className="relative ml-1" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1 rounded-xl p-1 pr-2 hover:bg-slate-100 transition-colors"
                aria-expanded={userMenuOpen}
              >
                <Avatar
                  src={currentUserInfo?.photoURL || userProfile?.photoURL || currentUser?.photoURL}
                  alt={currentUserInfo?.displayName || userProfile?.displayName}
                  size="sm"
                />
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-elevated z-50 animate-fade-in">
                  <Link
                    to={`/profile/${currentUser?.uid}`}
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Trang cá nhân
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4" />
                    Cài đặt
                  </Link>
                  <hr className="my-1 border-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
