import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

const Card = forwardRef(({ children, className = '', padding = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-surface-elevated rounded-2xl border border-surface-border/90 shadow-soft',
      padding && 'p-4 sm:p-5',
      className
    )}
    {...props}
  >
    {children}
  </div>
))

Card.displayName = 'Card'

export default Card
