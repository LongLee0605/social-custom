import { useState, useEffect } from 'react'
import { isPWAInstalled, isMobileDevice, isPWASupported } from '../utils/deviceDetection'

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Kiểm tra mobile và PWA support
    setIsMobile(isMobileDevice())
    setIsSupported(isPWASupported())
    
    // Kiểm tra xem app đã được cài đặt chưa (nhiều cách)
    const checkInstalled = () => {
      if (isPWAInstalled()) {
        setIsInstalled(true)
        return true
      }
      
      // Kiểm tra display mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return true
      }
      
      // Kiểm tra iOS standalone
      if (window.navigator.standalone === true) {
        setIsInstalled(true)
        return true
      }
      
      // Kiểm tra minimal-ui
      if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        setIsInstalled(true)
        return true
      }
      
      return false
    }
    
    if (checkInstalled()) {
      return
    }

    // Lắng nghe beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Lắng nghe appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    // Lắng nghe display mode changes
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsInstalled(true)
        setIsInstallable(false)
      }
    }

    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)')
    const minimalUIMediaQuery = window.matchMedia('(display-mode: minimal-ui)')
    
    if (standaloneMediaQuery.addEventListener) {
      standaloneMediaQuery.addEventListener('change', handleDisplayModeChange)
    }
    if (minimalUIMediaQuery.addEventListener) {
      minimalUIMediaQuery.addEventListener('change', handleDisplayModeChange)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      if (standaloneMediaQuery.removeEventListener) {
        standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange)
      }
      if (minimalUIMediaQuery.removeEventListener) {
        minimalUIMediaQuery.removeEventListener('change', handleDisplayModeChange)
      }
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) {
      return { success: false, error: 'Install prompt not available' }
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
        setIsInstalled(true)
        return { success: true }
      } else {
        return { success: false, error: 'User dismissed install prompt' }
      }
    } catch (error) {
      console.error('Error installing PWA:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    isInstallable,
    isInstalled,
    isMobile,
    isSupported,
    installPWA,
  }
}

