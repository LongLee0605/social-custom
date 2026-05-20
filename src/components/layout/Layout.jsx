import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import NotificationManager from '../notifications/NotificationManager'
import PWAInstallBanner from '@/components/pwa/PWAInstallBanner'
import { ChatsProvider } from '@/contexts/ChatsContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'

const Layout = () => (
  <ChatsProvider>
    <NotificationsProvider>
      <div className="app-shell flex min-h-dvh flex-col">
        <Header />
        <NotificationManager />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="main-content lg:ml-60">
            <div className="container-custom max-w-6xl py-4 sm:py-5 lg:py-6">
              <Outlet />
            </div>
          </main>
        </div>
        <PWAInstallBanner />
      </div>
    </NotificationsProvider>
  </ChatsProvider>
)

export default Layout
