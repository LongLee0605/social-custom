import { clsx } from 'clsx'

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      )}
      <input className={clsx('input-modern', error && 'border-red-400 focus:ring-red-500/20', className)} {...props} />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default Input
