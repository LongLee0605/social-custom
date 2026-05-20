import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { lazyRetry } from '@/utils/lazyRetry'

const HomePage = lazyRetry(() => import('@/pages/HomePage'))
const ProfilePage = lazyRetry(() => import('@/pages/ProfilePage'))
const ChatPage = lazyRetry(() => import('@/pages/ChatPage'))
const SettingsPage = lazyRetry(() => import('@/pages/SettingsPage'))
const NotificationsPage = lazyRetry(() => import('@/pages/NotificationsPage'))

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
    <p className="text-gray-600 text-sm">Đang tải...</p>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="profile/:userId?" element={<ProfilePage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
