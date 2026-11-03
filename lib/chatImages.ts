/**
 * Safely extracts clean, absolute image URLs from any combination of:
 * - JavaScript string arrays: ['https://...']
 * - JSON-stringified arrays: '["https://..."]'
 * - PostgreSQL array strings: '{"https://..."}'
 * - Plain URL strings: 'https://...'
 * - Malformed / wrapped strings
 */
export function extractPhotoUrls(photos?: unknown, imageUrl?: unknown): string[] {
  const urls: string[] = []

  const parseItem = (val: unknown) => {
    if (!val) return
    if (Array.isArray(val)) {
      val.forEach(parseItem)
      return
    }
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (!trimmed) return

      // Try JSON parsing if it looks like a JSON array or object
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            parsed.forEach(parseItem)
            return
          }
        } catch {
          // Check for Postgres array syntax: {"url1","url2"}
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const inner = trimmed.slice(1, -1)
            const parts = inner.split(',').map(s => s.replace(/^"|"$/g, '').trim())
            parts.forEach(parseItem)
            return
          }
        }
      }

      // Clean single string (strip any wrapped quotes or brackets)
      const cleanUrl = trimmed.replace(/^["'\[]+|["'\]]+$/g, '').trim()
      if (cleanUrl) {
        urls.push(cleanUrl)
      }
    }
  }

  parseItem(photos)
  parseItem(imageUrl)

  // Deduplicate and filter out empties
  return Array.from(new Set(urls.filter(Boolean)))
}
