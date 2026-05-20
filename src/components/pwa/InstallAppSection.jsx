import { useState } from 'react'
import { Smartphone, Download, CheckCircle2, Share, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import SectionHeader from '@/components/ui/SectionHeader'
import { usePWA } from '@/hooks/usePWA'

const IOS_STEPS = [
  { icon: Share, text: 'Nhấn Chia sẻ (Share) trên Safari' },
  { icon: Plus, text: 'Chọn "Thêm vào Màn hình chính"' },
  { icon: CheckCircle2, text: 'Nhấn "Thêm" để hoàn tất' },
]

const InstallAppSection = ({ onAlert }) => {
  const { canInstall, isInstalled, hasNativePrompt, platform, installPWA } = usePWA()
  const [loading, setLoading] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  const handleInstall = async () => {
    setLoading(true)
    try {
      const result = await installPWA()
      if (result.success) {
        onAlert?.({ type: 'success', title: 'Đã cài đặt', message: 'Ứng dụng đã được thêm vào thiết bị.' })
        return
      }
      if (result.platform === 'ios' || result.error === 'ios_instructions') {
        setShowIosGuide(true)
        return
      }
      onAlert?.({
        type: result.manual ? 'info' : 'info',
        title: result.manual ? 'Hướng dẫn' : 'Thông báo',
        message: result.error || 'Không thể cài đặt lúc này.',
      })
    } catch (err) {
      onAlert?.({ type: 'error', title: 'Lỗi', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <SectionHeader icon={Smartphone} title="Cài đặt ứng dụng" description="Thêm lên màn hình chính để dùng như app native" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-4">
        <p className="text-sm text-slate-600 max-w-md">
          {isInstalled
            ? 'App đã được cài. Mở từ icon trên màn hình chính.'
            : 'Truy cập nhanh, toàn màn hình, hỗ trợ offline cơ bản.'}
        </p>
        {isInstalled ? (
          <span className="inline-flex items-center gap-2 text-emerald-700 text-sm font-medium shrink-0">
            <CheckCircle2 className="h-5 w-5" /> Đã cài đặt
          </span>
        ) : canInstall ? (
          <Button variant="primary" onClick={handleInstall} loading={loading} className="shrink-0 w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            {hasNativePrompt ? 'Cài đặt ngay' : platform === 'ios' ? 'Hướng dẫn iOS' : 'Cài đặt'}
          </Button>
        ) : (
          <p className="text-xs text-slate-500 shrink-0">Dùng Chrome/Safari trên điện thoại</p>
        )}
      </div>

      <Modal isOpen={showIosGuide} onClose={() => setShowIosGuide(false)} title="Cài trên iPhone / iPad">
        <ol className="space-y-3">
          {IOS_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <li key={i} className="flex gap-3 rounded-xl bg-slate-50 p-3 border border-surface-border">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
                  {i + 1}
                </span>
                <Icon className="h-5 w-5 text-brand-600 shrink-0" />
                <span className="text-sm text-slate-700">{step.text}</span>
              </li>
            )
          })}
        </ol>
        <Button variant="primary" className="w-full mt-4" onClick={() => setShowIosGuide(false)}>
          Đã hiểu
        </Button>
      </Modal>
    </Card>
  )
}

export default InstallAppSection
