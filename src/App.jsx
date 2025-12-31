import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
    <p className="text-gray-600 text-sm">Đang tải...</p>
  </div>
)

function App() {
  return (
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
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App

