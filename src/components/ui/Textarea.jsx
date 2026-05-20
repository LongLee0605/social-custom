import { cn } from '@/lib/cn'

const Textarea = ({ label, error, className = '', rows = 4, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <textarea
      rows={rows}
      className={cn('input-modern resize-none', error && 'border-red-400', className)}
      {...props}
    />
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
)

export default Textarea
