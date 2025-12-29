import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ''

  try {
    let date
    if (timestamp?.toDate) {
      date = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else {
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) {
      return ''
    }

    return formatDistanceToNow(date, { addSuffix: true, locale: vi })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

export const formatFullDate = (timestamp) => {
  if (!timestamp) return ''

  try {
    let date
    if (timestamp?.toDate) {
      date = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else {
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

export const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''

  try {
    let date
    if (timestamp?.toDate) {
      date = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else {
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) {
      return ''
    }

    const now = new Date()
    const diff = now - date
    const diffMinutes = Math.floor(diff / 60000)
    const diffHours = Math.floor(diff / 3600000)
    const diffDays = Math.floor(diff / 86400000)

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    if (diffDays === 1) {
      return 'Hôm qua ' + date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    if (diffDays < 7) {
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
      return days[date.getDay()] + ' ' + date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Error formatting message time:', error)
    return ''
  }
}
