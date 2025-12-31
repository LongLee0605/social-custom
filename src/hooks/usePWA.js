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
    const mobile = isMobileDevice()
    const supported = isPWASupported()
    setIsMobile(mobile)
    setIsSupported(supported)
    
    // Kiểm tra xem app đã được cài đặt chưa (nhiều cách)
    const checkInstalled = () => {
      if (isPWAInstalled()) {
        setIsInstalled(true)
        return true
      }
      
      // Kiểm tra display mode
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return true
      }
      
      // Kiểm tra iOS standalone
      if (window.navigator && window.navigator.standalone === true) {
        setIsInstalled(true)
        return true
      }
      
      // Kiểm tra minimal-ui
      if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) {
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
      console.log('[PWA] beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    
    // Kiểm tra lại sau một khoảng thời gian (để đảm bảo service worker đã load)
    let checkTimeout = null
    const checkInstallability = () => {
      // Nếu đã có deferredPrompt, không cần check lại
      if (deferredPrompt) {
        setIsInstallable(true)
        return
      }
      
      // Kiểm tra xem có thể install không (cho mobile browsers)
      if (mobile && supported && !checkInstalled()) {
        // Trên mobile, có thể hiển thị button ngay cả khi chưa có beforeinstallprompt
        // Vì một số trình duyệt mobile không trigger event này ngay lập tức
        const hasManifest = document.querySelector('link[rel="manifest"]')
        const hasServiceWorker = 'serviceWorker' in navigator
        
        if (hasManifest && hasServiceWorker) {
          // Đợi một chút để service worker có thể register
          setTimeout(() => {
            if (!checkInstalled() && !deferredPrompt) {
              // Vẫn hiển thị button cho mobile, hướng dẫn user cài đặt thủ công
              setIsInstallable(true)
            }
          }, 2000)
        }
      }
    }
    
    // Check ngay và sau 2 giây
    checkInstallability()
    checkTimeout = setTimeout(checkInstallability, 2000)

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
      clearTimeout(checkTimeout)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      if (standaloneMediaQuery && standaloneMediaQuery.removeEventListener) {
        standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange)
      }
      if (minimalUIMediaQuery && minimalUIMediaQuery.removeEventListener) {
        minimalUIMediaQuery.removeEventListener('change', handleDisplayModeChange)
      }
    }
  }, [deferredPrompt])

  const installPWA = async () => {
    // Nếu có deferredPrompt, sử dụng nó
    if (deferredPrompt) {
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
    
    // Nếu không có deferredPrompt nhưng là mobile và supported
    // Hướng dẫn user cài đặt thủ công
    if (isMobile && isSupported) {
      return { 
        success: false, 
        error: 'Vui lòng sử dụng menu trình duyệt để cài đặt: Menu > "Thêm vào màn hình chính" hoặc "Install app"',
        manual: true
      }
    }
    
    return { success: false, error: 'Install prompt not available. Please use a supported browser.' }
  }

  return {
    isInstallable,
    isInstalled,
    isMobile,
    isSupported,
    installPWA,
  }
}

