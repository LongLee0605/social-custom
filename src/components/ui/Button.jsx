import { cn } from '@/lib/cn'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-md shadow-brand-500/20',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
  outline: 'border-2 border-brand-500 text-brand-600 hover:bg-brand-50 bg-white focus:ring-brand-500',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-400',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => (
  <button
    type={type}
    className={cn(
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
      variants[variant],
      sizes[size],
      className
    )}
    disabled={disabled || loading}
    onClick={onClick}
    {...props}
  >
    {loading ? (
      <>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span>Đang xử lý...</span>
      </>
    ) : (
      children
    )}
  </button>
)

export default Button
