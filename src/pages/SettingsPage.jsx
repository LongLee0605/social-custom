import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { uploadImage } from '../services/imageUpload'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import AlertModal from '../components/ui/AlertModal'
import { usePWA } from '../hooks/usePWA'
import { Image, X, Download, CheckCircle, Smartphone } from 'lucide-react'

const SettingsPage = () => {
  const { userProfile, currentUser, fetchUserProfile } = useAuth()
  const { isInstallable, isInstalled, isMobile, installPWA } = usePWA()
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [installingPWA, setInstallingPWA] = useState(false)
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '' })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
      })
      setAvatarPreview(userProfile.photoURL || currentUser?.photoURL || null)
    }
  }, [userProfile, currentUser])

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB',
        })
        return
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF hoặc WebP',
        })
        return
      }

      setSelectedAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null)
    setAvatarPreview(userProfile?.photoURL || currentUser?.photoURL || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentUser) return

    if (!formData.displayName.trim()) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập tên hiển thị',
      })
      return
    }

    setLoading(true)
    try {
      const updateData = {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
      }

      if (selectedAvatar) {
        setUploadingAvatar(true)
        try {
          const avatarPath = `avatars/${currentUser.uid}/${Date.now()}_${selectedAvatar.name}`
          const avatarURL = await uploadImage(selectedAvatar, avatarPath)
          updateData.photoURL = avatarURL
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError)
          setAlert({
            isOpen: true,
            type: 'error',
            title: 'Lỗi',
            message: uploadError.message || 'Lỗi khi upload ảnh đại diện',
          })
          setLoading(false)
          setUploadingAvatar(false)
          return
        } finally {
          setUploadingAvatar(false)
        }
      }

      const userDocRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userDocRef, updateData)

      await fetchUserProfile(currentUser.uid)
      setSelectedAvatar(null)

      setAlert({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: 'Cập nhật thông tin thành công!',
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Có lỗi xảy ra khi cập nhật thông tin',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cá nhân</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar
                src={avatarPreview || userProfile?.photoURL || currentUser?.photoURL}
                alt={userProfile?.displayName || currentUser?.displayName}
                size="xl"
              />
              {selectedAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Image className="w-4 h-4 mr-2" />
                {uploadingAvatar ? 'Đang upload...' : selectedAvatar ? 'Thay đổi ảnh' : 'Thay đổi ảnh đại diện'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG hoặc GIF. Tối đa 5MB
              </p>
            </div>
          </div>

          <Input
            label="Tên hiển thị"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiểu sử
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Giới thiệu về bản thân..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading || uploadingAvatar} disabled={loading || uploadingAvatar}>
              {uploadingAvatar ? 'Đang upload ảnh...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Tài khoản</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Email được liên kết với tài khoản Google của bạn
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quyền riêng tư</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Tài khoản công khai</p>
              <p className="text-sm text-gray-500">
                Mọi người có thể xem bài viết của bạn
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Ứng dụng</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Smartphone className="w-5 h-5 text-primary-600" />
                <p className="font-medium text-gray-900">Cài đặt ứng dụng</p>
              </div>
              <p className="text-sm text-gray-500 ml-8">
                {isInstalled 
                  ? 'Ứng dụng đã được cài đặt trên thiết bị của bạn'
                  : isInstallable
                  ? 'Cài đặt ứng dụng để truy cập nhanh hơn và sử dụng offline'
                  : isMobile
                  ? 'Trên trình duyệt mobile, bạn có thể cài đặt ứng dụng từ menu trình duyệt (Menu > "Thêm vào màn hình chính" hoặc "Install app")'
                  : 'Mở ứng dụng trên thiết bị di động để cài đặt'}
              </p>
            </div>
            <div className="ml-4">
              {isInstalled ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Đã cài đặt</span>
                </div>
              ) : isInstallable ? (
                <Button
                  variant="primary"
                  onClick={async () => {
                    setInstallingPWA(true)
                    try {
                      const result = await installPWA()
                      if (result.success) {
                        setAlert({
                          isOpen: true,
                          type: 'success',
                          title: 'Thành công',
                          message: 'Ứng dụng đã được cài đặt thành công!',
                        })
                      } else if (result.manual) {
                        // Hướng dẫn cài đặt thủ công
                        setAlert({
                          isOpen: true,
                          type: 'info',
                          title: 'Hướng dẫn cài đặt',
                          message: result.error || 'Vui lòng sử dụng menu trình duyệt để cài đặt ứng dụng.',
                        })
                      } else {
                        setAlert({
                          isOpen: true,
                          type: 'info',
                          title: 'Thông tin',
                          message: result.error || 'Cài đặt đã bị hủy',
                        })
                      }
                    } catch (error) {
                      console.error('PWA install error:', error)
                      setAlert({
                        isOpen: true,
                        type: 'error',
                        title: 'Lỗi',
                        message: error.message || 'Không thể cài đặt ứng dụng. Vui lòng thử lại.',
                      })
                    } finally {
                      setInstallingPWA(false)
                    }
                  }}
                  disabled={installingPWA}
                  loading={installingPWA}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {installingPWA ? 'Đang cài đặt...' : 'Cài đặt ứng dụng'}
                </Button>
              ) : (
                <div className="text-sm text-gray-500 text-center">
                  <p>Không khả dụng</p>
                  <p className="text-xs mt-1">Mở trên mobile</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

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

export default SettingsPage

