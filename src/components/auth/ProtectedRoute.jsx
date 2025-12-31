import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingScreen from '../ui/LoadingScreen'

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()
  const [showLoading, setShowLoading] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const hasShownAnimationRef = useRef(false)

  useEffect(() => {
    // Chỉ hiển thị animation khi đã load xong và có user, và chưa từng hiển thị
    if (!loading && currentUser && !hasShownAnimationRef.current) {
      setShowLoading(true)
      setAnimationComplete(false)
      hasShownAnimationRef.current = true
    } else if (!loading && !currentUser) {
      // Nếu không có user, không cần loading
      setShowLoading(false)
    }
  }, [loading, currentUser])

  const handleLoadingComplete = () => {
    setAnimationComplete(true)
    setTimeout(() => {
      setShowLoading(false)
    }, 0)
  }

  // Hiển thị spinner đơn giản khi đang loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Hiển thị animation khi đã load xong và có user
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

