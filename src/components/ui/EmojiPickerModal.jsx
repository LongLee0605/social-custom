import Modal from './Modal'
import { cn } from '@/lib/cn'

const EmojiPickerModal = ({ isOpen, onClose, title = 'Chọn biểu cảm', emojis, onSelect }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
    <div className="max-h-[min(50dvh,400px)] overflow-y-auto scrollbar-custom -mx-1">
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2 p-1">
        {emojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            className={cn(
              'flex h-11 w-full items-center justify-center rounded-xl text-2xl sm:text-3xl',
              'transition-transform hover:bg-brand-50 active:scale-95'
            )}
            aria-label={`Chọn ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  </Modal>
)

export default EmojiPickerModal
