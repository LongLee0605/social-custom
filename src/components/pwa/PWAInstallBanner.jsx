import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import Button from '@/components/ui/Button'
import { usePWA } from '@/hooks/usePWA'

const DISMISS_KEY = 'pwa-banner-dismissed'

const PWAInstallBanner = () => {
  const { canInstall, isInstalled, hasNativePrompt, installPWA } = usePWA()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isInstalled || !canInstall) {
      setVisible(false)
      return
    }
    const dismissed = sessionStorage.getItem(DISMISS_KEY)
    if (!dismissed) setVisible(true)
  }, [canInstall, isInstalled])

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  const handleInstall = async () => {
    setLoading(true)
    try {
      const result = await installPWA()
      if (result.success) {
        setVisible(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed left-3 right-3 z-[45] lg:bottom-4 lg:left-auto lg:right-6 lg:max-w-sm animate-fade-in max-lg:bottom-[calc(var(--layout-mobile-nav)+env(safe-area-inset-bottom,0px)+var(--layout-mobile-gap))]"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-white/95 p-4 shadow-elevated backdrop-blur-md">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Cài app lên điện thoại</p>
          <p className="text-xs text-slate-500 truncate">
            {hasNativePrompt ? 'Một chạm — dùng như app thật' : 'Thêm vào màn hình chính'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleInstall}
            loading={loading}
            className="!px-3"
          >
            <Download className="h-4 w-4" />
          </Button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallBanner
