const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 mb-5">
    {Icon && (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
    )}
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
  </div>
)

export default SectionHeader
