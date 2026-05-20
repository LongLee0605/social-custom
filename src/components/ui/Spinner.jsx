const Spinner = ({ label, className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    {label && <p className="mt-3 text-sm text-slate-500">{label}</p>}
  </div>
)

export default Spinner
