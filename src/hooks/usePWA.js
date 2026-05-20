import { useState, useEffect, useCallback } from 'react'
import {
  isPWAInstalled,
  isMobileDevice,
  isPWASupported,
  isIOS,
  isAndroid,
} from '@/utils/deviceDetection'

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [platform, setPlatform] = useState('desktop')

  const refreshInstallState = useCallback(() => {
    setIsInstalled(isPWAInstalled())
    setIsMobile(isMobileDevice())
    setIsSupported(isPWASupported())
    if (isIOS()) setPlatform('ios')
    else if (isAndroid()) setPlatform('android')
    else if (isMobileDevice()) setPlatform('mobile')
    else setPlatform('desktop')
  }, [])

  useEffect(() => {
    refreshInstallState()

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsInstalled(true)
        setDeferredPrompt(null)
      }
    }

    const standaloneMq = window.matchMedia('(display-mode: standalone)')
    const minimalMq = window.matchMedia('(display-mode: minimal-ui)')

    standaloneMq.addEventListener?.('change', handleDisplayModeChange)
    minimalMq.addEventListener?.('change', handleDisplayModeChange)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    const interval = setInterval(refreshInstallState, 3000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      standaloneMq.removeEventListener?.('change', handleDisplayModeChange)
      minimalMq.removeEventListener?.('change', handleDisplayModeChange)
    }
  }, [refreshInstallState])

  const hasNativePrompt = Boolean(deferredPrompt)
  const canInstall = !isInstalled && (hasNativePrompt || isSupported)

  const installPWA = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setDeferredPrompt(null)
          setIsInstalled(true)
          return { success: true }
        }
        return { success: false, error: 'Bạn đã hủy cài đặt' }
      } catch (error) {
        console.error('Error installing PWA:', error)
        return { success: false, error: error.message }
      }
    }

    if (platform === 'ios') {
      return {
        success: false,
        manual: true,
        platform: 'ios',
        error: 'ios_instructions',
      }
    }

    if (isMobile || isSupported) {
      return {
        success: false,
        manual: true,
        platform,
        error:
          'Nhấn menu trình duyệt (⋮) và chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".',
      }
    }

    return {
      success: false,
      error: 'Trình duyệt không hỗ trợ cài đặt. Hãy dùng Chrome hoặc Edge trên điện thoại.',
    }
  }

  return {
    isInstallable: canInstall,
    canInstall,
    isInstalled,
    isMobile,
    isSupported,
    hasNativePrompt,
    platform,
    installPWA,
  }
}
