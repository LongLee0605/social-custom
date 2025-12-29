import { clsx } from 'clsx'

const Card = ({ children, className = '', padding = true, ...props }) => {
  return (
    <div
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
}

export default Card

