import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">
          Trang không tìm thấy
        </h2>
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link to="/">
          <Button variant="primary">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage

