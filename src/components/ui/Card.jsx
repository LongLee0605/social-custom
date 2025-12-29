import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Card = forwardRef(({ children, className = '', padding = true, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'bg-white rounded-lg shadow-sm',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card

