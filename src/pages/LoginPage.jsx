import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import AlertModal from '../components/ui/AlertModal'
import { Chrome } from 'lucide-react'

const LoginPage = () => {
  const { currentUser, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      navigate('/')
    }
  }, [currentUser, navigate])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        if (result.warning) {
          setAlert({
            isOpen: true,
            type: 'warning',
            title: 'Cảnh báo',
            message: result.warning,
          })
        }
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Đăng nhập thất bại',
          message: result.error || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Đăng nhập thất bại',
        message: error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng đến với Social Custom
          </h1>
          <p className="text-gray-600">
            Đăng nhập để kết nối với bạn bè và chia sẻ khoảnh khắc
          </p>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center space-x-2"
          disabled={loading}
          loading={loading}
        >
          <Chrome className="w-5 h-5" />
          <span>Đăng nhập với Google</span>
        </Button>

        <p className="text-sm text-gray-500 text-center mt-6">
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Điều khoản sử dụng
          </a>{' '}
          và{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Chính sách bảo mật
          </a>
        </p>
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

