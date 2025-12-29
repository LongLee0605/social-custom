import Modal from './Modal'
import Button from './Button'
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

const AlertModal = ({ isOpen, onClose, type = 'info', title, message, onConfirm }) => {
  const icons = {
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    error: <XCircle className="w-12 h-12 text-red-500" />,
    warning: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    info: <Info className="w-12 h-12 text-blue-500" />,
  }

  const buttonColors = {
    success: 'primary',
    error: 'danger',
    warning: 'primary',
    info: 'primary',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">{icons[type]}</div>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
        {message && <p className="text-gray-600 mb-6">{message}</p>}
        <div className="flex justify-center space-x-3">
          {onConfirm ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                Hủy
              </Button>
              <Button variant={buttonColors[type]} onClick={onConfirm}>
                Xác nhận
              </Button>
            </>
          ) : (
            <Button variant={buttonColors[type]} onClick={onClose}>
              Đóng
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AlertModal

