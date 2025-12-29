import { useState, memo } from 'react'
import { clsx } from 'clsx'

const Avatar = memo(({ src, alt, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const displaySrc = src && src.trim() !== '' ? src : null

  return (
    <div
      className={clsx(
        'rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden',
        sizes[size],
        className
      )}
    >
      {displaySrc && !imageError ? (
        <img
          src={displaySrc}
          alt={alt || 'Avatar'}
          className={`w-full h-full object-cover ${imageLoaded ? '' : 'opacity-0'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <span>{getInitials(alt)}</span>
      )}
    </div>
  )
})

Avatar.displayName = 'Avatar'

export default Avatar

