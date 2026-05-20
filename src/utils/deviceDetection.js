export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|mobile safari|miui|xiaomi|mi browser|ucbrowser|uc browser|samsungbrowser|samsung browser|huaweibrowser|huawei browser|oppobrowser|oppo browser|vivobrowser|vivo browser/i
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth <= 768
  return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen)
}

export const isIOS = () => {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent || '')
}

export const isAndroid = () => {
  if (typeof window === 'undefined') return false
  return /android/i.test(navigator.userAgent || '')
}

export const isMiBrowser = () => {
  if (typeof window === 'undefined') return false
  return /mi browser|xiaomi|miui/i.test(navigator.userAgent || '')
}

export const isUCBrowser = () => {
  if (typeof window === 'undefined') return false
  return /ucbrowser|uc browser/i.test(navigator.userAgent || '')
}

export const isPWASupported = () => {
  if (typeof window === 'undefined') return false
  try {
    const hasServiceWorker = 'serviceWorker' in navigator
    const hasManifest = document.querySelector('link[rel="manifest"]') !== null
    let isStandalone = false
    if (window.matchMedia) {
      isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches
    }
    if (window.navigator?.standalone === true) isStandalone = true
    return hasServiceWorker || hasManifest || isStandalone
  } catch {
    return false
  }
}

export const isPWAInstalled = () => {
  if (typeof window === 'undefined') return false
  try {
    if (window.matchMedia?.('(display-mode: standalone)').matches) return true
    if (window.navigator?.standalone === true) return true
    if (window.matchMedia?.('(display-mode: minimal-ui)').matches) return true
    if (window.matchMedia?.('(display-mode: fullscreen)').matches) return true
  } catch {
    /* ignore */
  }
  return false
}

export const getDeviceInfo = () => ({
  isMobile: isMobileDevice(),
  isIOS: isIOS(),
  isAndroid: isAndroid(),
  isMiBrowser: isMiBrowser(),
  isUCBrowser: isUCBrowser(),
  isPWASupported: isPWASupported(),
  isPWAInstalled: isPWAInstalled(),
  userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
  screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  hasTouch: typeof window !== 'undefined' ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false,
})
