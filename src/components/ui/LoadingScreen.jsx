import { useState, useEffect } from 'react'
import DrawingAnimation from './DrawingAnimation'

/**
 * Loading Screen với animation bản vẽ
 * Hiển thị khi đang load/authenticate
 */
const LoadingScreen = ({ onComplete }) => {
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Kiểm tra mobile
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Bắt đầu animation ngay lập tức
    setShowAnimation(true)
  }, [])

  const handleAnimationComplete = () => {
    setAnimationComplete(true)
    // Đợi animation hoàn tất rồi mới gọi onComplete (fade out)
    // Giảm delay để tăng tốc độ load
    setTimeout(() => {
      onComplete?.()
    }, 400) // 400ms delay để tăng tốc độ load
  }

  // Paths cho bản vẽ - 4 hình vuông thành 1 hàng
  // Kích thước PC: 500x250, tính toán paths cho 480x230 (có padding 10px)
  const getDrawingPaths = () => {
    const rectX = 10
    const rectY = 10
    const rectWidth = 460  // 480 - 20 (padding)
    const rectHeight = 210 // 230 - 20 (padding) - giảm từ 260 xuống 210
    const rectEndX = rectX + rectWidth
    const rectEndY = rectY + rectHeight
    
    const squareWidth = rectWidth / 4
    const blockHeight = rectHeight / 3
    
    const div1X = rectX + squareWidth
    const div2X = rectX + squareWidth * 2
    const div3X = rectX + squareWidth * 3
    
    const div1Y = rectY + blockHeight
    const div2Y = rectY + blockHeight * 2
    
    const square2CenterX = rectX + squareWidth * 1.5
    const square4CenterX = rectX + squareWidth * 3.5
    
    const block2CenterY = rectY + blockHeight * 1.5
    const block3CenterY = rectY + blockHeight * 2.5
    
    const halfSquareWidth = squareWidth / 2

    return [
      {
        d: `M ${rectX},${rectY} L ${rectEndX},${rectY} L ${rectEndX},${rectEndY} L ${rectX},${rectEndY} Z`,
        stroke: '#6366f1',
        strokeWidth: 4,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: `M ${div1X},${rectY} L ${div1X},${rectEndY}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${div2X},${rectY} L ${div2X},${rectEndY}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${div3X},${rectY} L ${div3X},${rectEndY}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${rectX},${div1Y} L ${rectX + halfSquareWidth},${div1Y}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${div1X},${div2Y} L ${rectX + halfSquareWidth},${div2Y}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${square2CenterX},${div1Y} L ${square2CenterX},${div2Y}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${div2X},${div1Y} L ${div2X + halfSquareWidth},${div1Y}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${div3X},${div2Y} L ${div2X + halfSquareWidth},${div2Y}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${rectEndX},${div1Y} L ${div3X + halfSquareWidth},${div1Y}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      },
      {
        d: `M ${square4CenterX},${block2CenterY} L ${square4CenterX},${block3CenterY}`,
        stroke: '#6366f1',
        strokeWidth: 4,
        strokeLinecap: 'round'
      }
    ]
  }

  // Kích thước: PC 500x250, Mobile scale
  const svgWidth = isMobile && typeof window !== 'undefined' 
    ? Math.min(400, window.innerWidth * 0.9) 
    : 500
  const svgHeight = isMobile ? (svgWidth * 250) / 500 : 250

  // Kiểm tra SVG support - đơn giản hóa để tương thích với mọi trình duyệt
  const hasSVGSupport = typeof window !== 'undefined' && 
                        typeof document !== 'undefined' &&
                        typeof SVGElement !== 'undefined' && 
                        'createElementNS' in document

  return (
    <div 
      className={`fixed inset-0 bg-white z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        animationComplete ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        pointerEvents: animationComplete ? 'none' : 'auto',
        WebkitTransition: 'opacity 0.5s ease-out',
        MozTransition: 'opacity 0.5s ease-out',
        msTransition: 'opacity 0.5s ease-out',
        OTransition: 'opacity 0.5s ease-out'
      }}
    >
      {/* Chỉ hiển thị animation bản vẽ */}
      {showAnimation ? (
        <div 
          className="flex items-center justify-center"
          style={{
            width: `${svgWidth}px`,
            height: `${svgHeight}px`,
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}
        >
          {hasSVGSupport ? (
            <DrawingAnimation
              paths={getDrawingPaths()}
              width={480}
              height={230}
              duration={2500}
              autoPlay={true}
              strokeColor="#6366f1"
              onComplete={handleAnimationComplete}
            />
          ) : (
            // Fallback đơn giản nếu không hỗ trợ SVG
            <div 
              style={{ 
                width: '100%', 
                height: '100%', 
                border: '2px solid #6366f1', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ 
                width: '80%', 
                height: '80%', 
                border: '1px solid #6366f1', 
                borderRadius: '2px' 
              }}></div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default LoadingScreen

