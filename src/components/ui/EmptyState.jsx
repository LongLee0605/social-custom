import Button from './Button'

const EmptyState = ({ message, actionLabel, onAction }) => (
  <div className="text-center py-10 px-4">
    <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">{message}</p>
    {actionLabel && onAction && (
      <Button variant="primary" size="sm" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
)

export default EmptyState
