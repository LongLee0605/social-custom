import { useState, useRef, useEffect } from 'react'
import { Smile, Plus } from 'lucide-react'
import { QUICK_REACTIONS, EXTENDED_REACTIONS } from '@/lib/emojis'
import EmojiPickerModal from '@/components/ui/EmojiPickerModal'
import { cn } from '@/lib/cn'

const ReactionPicker = ({ onReact, align = 'start', className = '' }) => {
  const [showQuick, setShowQuick] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!showQuick) return
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowQuick(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [showQuick])

  const pick = (emoji) => {
    onReact?.(emoji)
    setShowQuick(false)
    setShowModal(false)
  }

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        onClick={() => setShowQuick((v) => !v)}
        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition-colors"
        aria-label="Thêm biểu cảm"
      >
        <Smile className="h-4 w-4" />
      </button>

      {showQuick && (
        <div
          className={cn(
            'absolute bottom-full z-50 mb-1 flex items-center gap-0.5 rounded-2xl border border-surface-border bg-white p-1.5 shadow-elevated',
            align === 'end' ? 'right-0' : 'left-0'
          )}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => pick(emoji)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-xl hover:bg-brand-50 active:scale-110 transition-transform"
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setShowQuick(false)
              setShowModal(true)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
            aria-label="Xem thêm biểu cảm"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      <EmojiPickerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Chọn biểu cảm"
        emojis={EXTENDED_REACTIONS}
        onSelect={pick}
      />
    </div>
  )
}

export default ReactionPicker
