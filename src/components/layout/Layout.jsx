import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import NotificationManager from '../notifications/NotificationManager'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationManager />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="container-custom py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

