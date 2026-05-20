import { Component } from 'react'
import Button from '@/components/ui/Button'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('UI error boundary:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Đã xảy ra lỗi</h2>
          <p className="mb-6 max-w-md text-slate-600">
            Ứng dụng gặp sự cố không mong muốn. Bạn có thể tải lại trang để thử lại.
          </p>
          <Button variant="primary" onClick={this.handleRetry}>
            Tải lại
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
