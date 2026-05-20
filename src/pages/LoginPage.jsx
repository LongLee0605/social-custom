import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import AlertModal from '@/components/ui/AlertModal'
import { Chrome } from 'lucide-react'

const LoginPage = () => {
  const { currentUser, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) navigate('/')
  }, [currentUser, navigate])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        if (result.warning) {
          setAlert({ isOpen: true, type: 'warning', title: 'Cảnh báo', message: result.warning })
        } else navigate('/')
      } else {
        setAlert({ isOpen: true, type: 'error', title: 'Đăng nhập thất bại', message: result.error })
      }
    } catch (error) {
      setAlert({ isOpen: true, type: 'error', title: 'Đăng nhập thất bại', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_#eef2ff_0%,_#f4f6fb_50%,_#fff_100%)]">
      <div className="w-full max-w-md rounded-3xl border border-surface-border bg-white p-8 sm:p-10 shadow-elevated">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="" className="h-14 w-14 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Social Custom</h1>
          <p className="text-slate-500 text-sm mt-2">Kết nối, chia sẻ và trò chuyện realtime</p>
        </div>
        <Button onClick={handleGoogleSignIn} variant="primary" size="lg" className="w-full" loading={loading} disabled={loading}>
          <Chrome className="w-5 h-5" />
          Đăng nhập với Google
        </Button>
      </div>
      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
      />
    </div>
  )
}

export default LoginPage
