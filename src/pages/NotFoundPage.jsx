import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

const NotFoundPage = () => (
  <div className="flex min-h-[60dvh] items-center justify-center px-4">
    <div className="text-center">
      <p className="text-8xl font-bold text-brand-600 sm:text-9xl">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Trang không tìm thấy</h1>
      <p className="mt-2 text-slate-500">
        Trang bạn tìm không tồn tại hoặc đã bị xóa.
      </p>
      <Link to="/" className="mt-8 inline-block">
        <Button variant="primary">Về trang chủ</Button>
      </Link>
    </div>
  </div>
)

export default NotFoundPage
