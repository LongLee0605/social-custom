import { useAuth } from '@/contexts/AuthContext'
import ReactionPicker from './ReactionPicker'
import { cn } from '@/lib/cn'

const MessageReactions = ({ reactions, onReact, isOwn = false }) => {
  const { currentUser } = useAuth()
  const hasReactions =
    reactions && typeof reactions === 'object' && Object.keys(reactions).length > 0

  if (!hasReactions && !onReact) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {hasReactions &&
        Object.entries(reactions).map(([emoji, userIds]) => {
          if (!Array.isArray(userIds) || userIds.length === 0) return null
          const isActive = userIds.includes(currentUser?.uid)
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact?.(emoji)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm transition-colors',
                isActive
                  ? 'bg-brand-100 ring-1 ring-brand-300'
                  : 'bg-slate-100 hover:bg-slate-200'
              )}
            >
              <span>{emoji}</span>
              <span className="text-xs font-medium text-slate-600">{userIds.length}</span>
            </button>
          )
        })}
      {onReact && (
        <ReactionPicker onReact={onReact} align={isOwn ? 'end' : 'start'} />
      )}
    </div>
  )
}

export default MessageReactions
