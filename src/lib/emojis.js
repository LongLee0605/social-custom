/** Quick reactions shown in inline picker */
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

/** Extended reactions for modal — deduplicated */
export const EXTENDED_REACTIONS = [
  ...QUICK_REACTIONS,
  '😊', '😍', '🤔', '😎', '😴', '😋', '😭', '😡', '🤗', '👏',
  '🔥', '💯', '🎉', '✨', '⭐', '💪', '🙌', '👌', '👎', '💔',
  '💖', '💝', '🎁', '🏆', '🥇', '🥈', '🥉', '🎯', '💎', '🌟',
  '💫', '⚡', '🌈',
].filter((emoji, index, arr) => arr.indexOf(emoji) === index)

/** Common emojis for message composer */
export const MESSAGE_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪',
  '😎', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '😢', '😭',
  '😤', '😠', '😡', '🤯', '😳', '🥺', '😱', '😨', '🤗', '🤔',
  '🤭', '🙄', '😯', '😮', '😲', '🥱', '😴', '🤤', '😷', '🤒',
  '👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '💔', '🔥', '✨',
  '🎉', '🎁', '⭐', '💯', '✅', '❌', '👋', '🙏', '💀', '👻',
]
