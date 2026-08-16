export type ChatMessageLike = {
  created_at: string
}

export function formatMessageTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function formatGroupLabel(iso: string): string {
  try {
    const date = new Date(iso)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

    if (sameDay(date, today)) return 'Today'
    if (sameDay(date, yesterday)) return 'Yesterday'

    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return ''
  }
}

export function groupMessagesByDate<T extends ChatMessageLike>(messages: T[]) {
  const groups = new Map<string, T[]>()

  for (const message of messages) {
    const key = new Date(message.created_at).toISOString().slice(0, 10)
    const current = groups.get(key) ?? []
    current.push(message)
    groups.set(key, current)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, label: formatGroupLabel(key), items }))
}
