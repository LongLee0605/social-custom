import { cn } from '@/lib/cn'

const SegmentedControl = ({ value, onChange, options, className = '' }) => (
  <div className={cn('flex gap-1 rounded-xl bg-slate-100/90 p-1', className)}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={cn(
          'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all',
          value === opt.value ? 'bg-white text-brand-600 shadow-soft' : 'text-slate-600 hover:text-slate-900'
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

export default SegmentedControl
