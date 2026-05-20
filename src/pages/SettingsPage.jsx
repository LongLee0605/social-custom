import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateUser } from '@/repositories/usersRepository'
import { uploadImage } from '@/services/imageUpload'
import { validateImageFile } from '@/lib/validation'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import AlertModal from '@/components/ui/AlertModal'
import PageHeader from '@/components/ui/PageHeader'
import SectionHeader from '@/components/ui/SectionHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import InstallAppSection from '@/components/pwa/InstallAppSection'
import { Image, X, User, Shield, Smartphone } from 'lucide-react'
import { cn } from '@/lib/cn'

const SECTIONS = [
  { value: 'profile', label: 'Hồ sơ', icon: User },
  { value: 'account', label: 'Tài khoản', icon: Shield },
  { value: 'app', label: 'Ứng dụng', icon: Smartphone },
]

const SettingsPage = () => {
  const { userProfile, currentUser, fetchUserProfile } = useAuth()
  const fileInputRef = useRef(null)
  const [section, setSection] = useState('profile')
  const [formData, setFormData] = useState({ displayName: '', bio: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '' })

  const showAlert = (payload) => setAlert({ isOpen: true, ...payload })

  useEffect(() => {
    if (!userProfile) return
    setFormData({ displayName: userProfile.displayName || '', bio: userProfile.bio || '' })
    setAvatarPreview(userProfile.photoURL || currentUser?.photoURL || null)
  }, [userProfile, currentUser])

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateImageFile(file, 5 * 1024 * 1024)
    if (!validation.valid) return showAlert({ type: 'error', title: 'Lỗi', message: validation.error })
    setSelectedAvatar(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentUser || !formData.displayName.trim()) {
      return showAlert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tên hiển thị' })
    }

    setLoading(true)
    try {
      const updateData = { displayName: formData.displayName.trim(), bio: formData.bio.trim() }
      if (selectedAvatar) {
        setUploadingAvatar(true)
        updateData.photoURL = await uploadImage(
          selectedAvatar,
          `avatars/${currentUser.uid}/${Date.now()}_${selectedAvatar.name}`
        )
        setUploadingAvatar(false)
      }
      await updateUser(currentUser.uid, updateData)
      await fetchUserProfile(currentUser.uid)
      setSelectedAvatar(null)
      showAlert({ type: 'success', title: 'Đã lưu', message: 'Cập nhật hồ sơ thành công.' })
    } catch (error) {
      showAlert({ type: 'error', title: 'Lỗi', message: error.message || 'Không thể cập nhật.' })
    } finally {
      setLoading(false)
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto page-stack animate-fade-in">
      <PageHeader title="Cài đặt" description="Hồ sơ, bảo mật và cài đặt ứng dụng" />

      <div className="lg:hidden">
        <SegmentedControl value={section} onChange={setSection} options={SECTIONS} />
      </div>

      <div className="grid lg:grid-cols-[11rem_1fr] gap-5">
        <nav className="hidden lg:flex flex-col gap-1">
          {SECTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSection(value)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all',
                section === value ? 'nav-active' : 'nav-idle'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {section === 'profile' && (
            <Card>
              <SectionHeader icon={User} title="Thông tin cá nhân" description="Ảnh đại diện, tên và tiểu sử" />
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative">
                    <Avatar
                      src={avatarPreview || userProfile?.photoURL}
                      alt={formData.displayName}
                      size="xl"
                      className="ring-4 ring-brand-100"
                    />
                    {selectedAvatar && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(null)
                          setAvatarPreview(userProfile?.photoURL || currentUser?.photoURL || null)
                        }}
                        className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                      <Image className="h-4 w-4 mr-2" />
                      {uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG, WebP — tối đa 5MB</p>
                  </div>
                </div>
                <Input label="Tên hiển thị" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} />
                <Textarea label="Tiểu sử" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Giới thiệu ngắn về bạn..." />
                <div className="flex justify-end">
                  <Button type="submit" loading={loading || uploadingAvatar}>Lưu thay đổi</Button>
                </div>
              </form>
            </Card>
          )}

          {section === 'account' && (
            <Card>
              <SectionHeader icon={Shield} title="Tài khoản" description="Email và quyền riêng tư" />
              <div className="space-y-4">
                <Input label="Email" type="email" value={currentUser?.email || ''} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                <p className="text-xs text-slate-500 -mt-2">Liên kết Google — không thể đổi tại đây</p>
                <div className="flex items-center justify-between rounded-xl border border-surface-border bg-slate-50/80 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Hồ sơ công khai</p>
                    <p className="text-sm text-slate-500">Mọi người có thể xem bài viết</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <span className="w-11 h-6 rounded-full bg-slate-200 peer-checked:bg-brand-600 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5 block" />
                  </label>
                </div>
              </div>
            </Card>
          )}

          {section === 'app' && <InstallAppSection onAlert={showAlert} />}
        </div>
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

export default SettingsPage
