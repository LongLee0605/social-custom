import { useEffect, useRef, useState } from 'react'

/**
 * Component để vẽ SVG path dần dần với animation
 */
const DrawingAnimation = ({ 
  paths = [], 
  width = 400, 
  height = 300,
  strokeColor = '#6366f1',
  strokeWidth = 3,
  duration = 2000,
  autoPlay = true,
  onComplete
}) => {
  const [progress, setProgress] = useState(0)
  const pathRefs = useRef([])

  useEffect(() => {
    if (!autoPlay || paths.length === 0) return

    const startTime = Date.now()
    let animationFrameId = null
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min(elapsed / duration, 1)
      setProgress(currentProgress)
      
      if (currentProgress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        // Đảm bảo onComplete được gọi
        if (onComplete) {
          setTimeout(() => {
            onComplete()
          }, 100)
        }
      }
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [autoPlay, duration, onComplete, paths.length])

  // Tính toán progress cho từng path - vẽ tuần tự từng path một
  const getPathProgress = (index) => {
    const totalPaths = paths.length
    const progressPerPath = 1 / totalPaths
    const pathStart = index * progressPerPath
    const pathEnd = (index + 1) * progressPerPath
    
    if (progress < pathStart) return 0
    if (progress > pathEnd) return 1
    
    // Tính progress trong khoảng của path này (0-1)
    const localProgress = (progress - pathStart) / progressPerPath
    return localProgress
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
    >
      {paths.map((path, index) => {
        const pathElement = pathRefs.current[index]
        const pathLength = pathElement?.getTotalLength() || 0
        const pathProgress = getPathProgress(index)
        const strokeDashoffset = pathLength * (1 - pathProgress)

        return (
          <path
            key={index}
            ref={(el) => {
              if (el) pathRefs.current[index] = el
            }}
            d={path.d}
            fill={path.fill || 'none'}
            stroke={path.stroke || strokeColor}
            strokeWidth={path.strokeWidth || strokeWidth}
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: pathProgress > 0 ? 1 : 0
            }}
          />
        )
      })}
    </svg>
  )
}

export default DrawingAnimation

