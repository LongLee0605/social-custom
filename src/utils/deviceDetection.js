/**
 * Utility functions để detect mobile devices và PWA support
 * Hỗ trợ các trình duyệt đặc biệt như Mi Browser, UC Browser, etc.
 */

/**
 * Kiểm tra xem có phải mobile device không
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false

  // Kiểm tra user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  
  // Danh sách các mobile user agents (bao gồm Mi Browser, UC Browser, etc.)
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|mobile safari|miui|xiaomi|mi browser|ucbrowser|uc browser|samsungbrowser|samsung browser|huaweibrowser|huawei browser|oppobrowser|oppo browser|vivobrowser|vivo browser/i
  
  // Kiểm tra touch support
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Kiểm tra screen size
  const isSmallScreen = window.innerWidth <= 768
  
  return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen)
}

/**
 * Kiểm tra xem có phải Mi Browser không
 */
export const isMiBrowser = () => {
  if (typeof window === 'undefined') return false
  const userAgent = navigator.userAgent || ''
  return /mi browser|xiaomi|miui/i.test(userAgent)
}

/**
 * Kiểm tra xem có phải UC Browser không
 */
export const isUCBrowser = () => {
  if (typeof window === 'undefined') return false
  const userAgent = navigator.userAgent || ''
  return /ucbrowser|uc browser/i.test(userAgent)
}

/**
 * Kiểm tra PWA support
 */
export const isPWASupported = () => {
  if (typeof window === 'undefined') return false
  
  // Kiểm tra service worker support
  const hasServiceWorker = 'serviceWorker' in navigator
  
  // Kiểm tra manifest support
  const hasManifest = 'onbeforeinstallprompt' in window || 'standalone' in navigator
  
  // Kiểm tra display mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: minimal-ui)').matches ||
                       (window.navigator.standalone === true)
  
  return hasServiceWorker || hasManifest || isStandalone
}

/**
 * Kiểm tra xem app đã được cài đặt như PWA chưa
 */
export const isPWAInstalled = () => {
  if (typeof window === 'undefined') return false
  
  // Kiểm tra display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }
  
  // Kiểm tra iOS standalone
  if (window.navigator.standalone === true) {
    return true
  }
  
  // Kiểm tra minimal-ui (Android)
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return true
  }
  
  // Kiểm tra fullscreen mode
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return true
  }
  
  return false
}

/**
 * Lấy thông tin device
 */
export const getDeviceInfo = () => {
  return {
    isMobile: isMobileDevice(),
    isMiBrowser: isMiBrowser(),
    isUCBrowser: isUCBrowser(),
    isPWASupported: isPWASupported(),
    isPWAInstalled: isPWAInstalled(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    hasTouch: typeof window !== 'undefined' ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false,
  }
}

