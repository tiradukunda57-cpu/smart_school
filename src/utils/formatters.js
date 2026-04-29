import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  try {
    return format(parseISO(date), 'MMM dd, yyyy')
  } catch {
    return format(new Date(date), 'MMM dd, yyyy')
  }
}

export const formatDatetime = (date) => {
  if (!date) return '—'
  try {
    return format(parseISO(date), 'MMM dd, yyyy · h:mm a')
  } catch {
    return '—'
  }
}

export const timeAgo = (date) => {
  if (!date) return '—'
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true })
  } catch {
    return '—'
  }
}

export const formatName = (firstName, lastName) =>
  `${firstName || ''} ${lastName || ''}`.trim()

export const getInitials = (firstName, lastName) => {
  const f = firstName?.[0] || ''
  const l = lastName?.[0] || ''
  return (f + l).toUpperCase()
}

export const formatGrade = (grade) => grade || 'N/A'