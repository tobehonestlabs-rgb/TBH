'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'
import { apiFetch } from '@/lib/api'
import { formatMessageTime, formatGroupLabel, groupMessagesByDate } from '@/lib/chatUtils'
import GifPicker, { GifResult } from './GifPicker'
import ImageEditor from './ImageEditor'
import { useTranslation } from '@/lib/i18n'

type Conversation = {
  id: string
  created_at: string
  last_message_at: string | null
  last_message: string | null
  original_message_id: string | null
  original_message_content?: string | null
  participant_1: string | null
  participant_2: string | null
}

type ConvMsg = {
  id: string
  sender_id: string
  content: string | null
  gif_url?: string | null
  image_url?: string | null
  photos?: string[] | string | null
  created_at: string
  is_read: boolean
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 30) return `${Math.floor(d / 30)}mo`
    if (d > 6)  return `${Math.floor(d / 7)}w`
    if (d > 0)  return `${d}d`
    if (h > 0)  return `${h}h`
    if (m > 0)  return `${m}m`
    return 'now'
  } catch { return '' }
}

const LS_FAVORITES = 'tbh_conv_favorites'
const LS_NAMES     = 'tbh_conv_names'
const LS_LASTSEEN  = 'tbh_conv_lastseen'

function loadFavorites(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_FAVORITES) ?? '[]')) } catch { return new Set() }
}
function saveFavorites(s: Set<string>) {
  try { localStorage.setItem(LS_FAVORITES, JSON.stringify(Array.from(s))) } catch {}
}
function loadNames(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LS_NAMES) ?? '{}') } catch { return {} }
}
function saveNames(n: Record<string, string>) {
  try { localStorage.setItem(LS_NAMES, JSON.stringify(n)) } catch {}
}
function loadLastSeen(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(LS_LASTSEEN) ?? '{}') } catch { return {} }
}
function saveLastSeen(n: Record<string, number>) {
  try { localStorage.setItem(LS_LASTSEEN, JSON.stringify(n)) } catch {}
}

export default function ChatPage({ onUnreadChange }: { onUnreadChange?: (has: boolean) => void }) {
  const { t } = useTranslation()
  const [convs, setConvs]           = useState<Conversation[]>([])
  const [loading, setLoading]       = useState(true)
  const [myUserId, setMyUserId]     = useState<string | null>(null)
  const [selected, setSelected]     = useState<Conversation | null>(null)
  const [msgs, setMsgs]             = useState<ConvMsg[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [showImageFull, setShowImageFull] = useState(false)
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null)

  // Favorites, names, last-seen
  const [favorites, setFavorites]   = useState<Set<string>>(new Set())
  const [convNames, setConvNames]   = useState<Record<string, string>>({})
  const [lastSeenAt, setLastSeenAt] = useState<Record<string, number>>({})

  // GIF picker
  const [showGifPicker, setShowGifPicker] = useState(false)

  // Photo upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const origFileRef = useRef<File | null>(null)

  // Rename modal
  const [renameConvId, setRenameConvId]   = useState<string | null>(null)
  const [renameValue, setRenameValue]     = useState('')
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bottomRef    = useRef<HTMLDivElement>(null)
  const channelRef   = useRef<ReturnType<typeof supabaseClient.channel> | null>(null)
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const listPollRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const selectedRef  = useRef<Conversation | null>(null)
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setPortalTarget(document.getElementById('app-shell'))
    setFavorites(loadFavorites())
    setConvNames(loadNames())
    setLastSeenAt(loadLastSeen())
  }, [])

  const openFullImage = (url: string) => {
    setFullImageUrl(url)
    setShowImageFull(true)
  }

  const fetchConvs = useCallback(async () => {
    try {
      const r = await apiFetch('/api/conversations')
      const d = await r.json()
      const list: Conversation[] = d.conversations ?? []
      setConvs(list)
      setMyUserId(d.userId ?? null)
      return list
    } catch { return [] }
  }, [])

  useEffect(() => {
    fetchConvs().then(list => {
      setLoading(false)
      // Check unread after initial load
      checkUnread(list, loadLastSeen())
    })

    // Poll conversation list every 10s to detect new messages
    listPollRef.current = setInterval(() => {
      fetchConvs().then(list => {
        checkUnread(list, loadLastSeen())
      })
    }, 3000)

    return () => {
      if (listPollRef.current) clearInterval(listPollRef.current)
    }
  }, [fetchConvs])

  const checkUnread = useCallback((list: Conversation[], seen: Record<string, number>) => {
    const hasAny = list.some(c => {
      if (!c.last_message_at) return false
      const t = new Date(c.last_message_at).getTime()
      return t > (seen[c.id] ?? 0)
    })
    onUnreadChange?.(hasAny)
  }, [onUnreadChange])

  // Re-check unread whenever convs or lastSeenAt change
  useEffect(() => {
    checkUnread(convs, lastSeenAt)
  }, [convs, lastSeenAt, checkUnread])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      saveFavorites(next)
      return next
    })
  }

  const openRename = (conv: Conversation, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setRenameConvId(conv.id)
    setRenameValue(convNames[conv.id] ?? conv.last_message ?? '')
  }

  const commitRename = () => {
    if (!renameConvId) return
    const trimmed = renameValue.trim()
    setConvNames(prev => {
      const next = { ...prev }
      if (trimmed) next[renameConvId] = trimmed
      else delete next[renameConvId]
      saveNames(next)
      return next
    })
    setRenameConvId(null)
  }

  const convDisplayName = (conv: Conversation) =>
    convNames[conv.id] || (conv.original_message_content ? truncate(conv.original_message_content, 60) : conv.last_message) || 'New conversation'

  function truncate(s: string, n = 60) {
    if (!s) return ''
    return s.length > n ? s.slice(0, n - 1).trim() + '…' : s
  }

  const sortedConvs = [...convs].sort((a, b) => {
    const aFav = favorites.has(a.id) ? 1 : 0
    const bFav = favorites.has(b.id) ? 1 : 0
    if (bFav !== aFav) return bFav - aFav
    const aT = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
    const bT = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
    return bT - aT
  })

  const openConv = async (conv: Conversation) => {
    // Tear down previous subscription + poll
    if (channelRef.current) { supabaseClient.removeChannel(channelRef.current).catch(() => {}); channelRef.current = null }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }

    selectedRef.current = conv
    setSelected(conv)
    setMsgs([])
    setLoadingMsgs(true)

    // Mark as seen
    const now = Date.now()
    setLastSeenAt(prev => {
      const next = { ...prev, [conv.id]: now }
      saveLastSeen(next)
      return next
    })

    const r = await apiFetch(`/api/conversations/${conv.id}/messages`)
    const d = await r.json()
    const loaded: ConvMsg[] = d.messages ?? []
    setMsgs(loaded)
    setLoadingMsgs(false)
    setTimeout(() => bottomRef.current?.scrollIntoView(), 50)

    // Mark incoming messages as read
    apiFetch(`/api/conversations/${conv.id}/read`, { method: 'POST' }).catch(() => {})

    // Realtime subscription
    const ch = supabaseClient.channel(`conv-${conv.id}`)
    ch
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conv.id}`,
      }, payload => {
        const newMsg = payload.new as ConvMsg
        setMsgs(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev
          // mark for animation
          setAnimatingIds(ids => {
            const next = new Set(ids)
            next.add(newMsg.id)
            setTimeout(() => setAnimatingIds(cur => { const s = new Set(cur); s.delete(newMsg.id); return s }), 800)
            return next
          })
          return [...prev, newMsg]
        })
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        setMyUserId(uid => {
          if (uid && newMsg.sender_id !== uid) {
            apiFetch(`/api/conversations/${conv.id}/read`, { method: 'POST' }).catch(() => {})
          }
          return uid
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conv.id}`,
      }, payload => {
        const updated = payload.new as ConvMsg
        setMsgs(prev => prev.map(m => m.id === updated.id ? { ...m, is_read: updated.is_read } : m))
      })
      .subscribe()

    channelRef.current = ch

    // Polling fallback (faster): check every 1s for new messages
    pollRef.current = setInterval(async () => {
      if (!selectedRef.current) return
      try {
        const res = await apiFetch(`/api/conversations/${selectedRef.current.id}/messages`)
        const data = await res.json()
        const fetched: ConvMsg[] = data.messages ?? []
        setMsgs(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newOnes = fetched.filter(m => !existingIds.has(m.id))
          if (newOnes.length === 0) return prev
          // mark new ones for animation
          setAnimatingIds(ids => {
            const next = new Set(ids)
            newOnes.forEach(n => next.add(n.id))
            // schedule removal
            setTimeout(() => setAnimatingIds(cur => { const s = new Set(cur); newOnes.forEach(n => s.delete(n.id)); return s }), 800)
            return next
          })
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
          return [...prev, ...newOnes]
        })
      } catch {}
    }, 1000)
  }

  const closeConv = () => {
    if (channelRef.current) { supabaseClient.removeChannel(channelRef.current).catch(() => {}); channelRef.current = null }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    selectedRef.current = null
    setSelected(null)
    setMsgs([])
    setShowGifPicker(false)
    // Refresh list on close to pick up any new last_message_at
    fetchConvs()
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteConversation = async (convId: string) => {
    const ok = window.confirm('Delete this conversation? This cannot be undone.')
    if (!ok) return
    setDeletingId(convId)
    // optimistic UI remove
    setConvs(prev => prev.filter(c => c.id !== convId))
    if (selected?.id === convId) {
      closeConv()
    }
    try {
      const res = await apiFetch(`/api/conversations/${convId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Delete failed')
      }
    } catch (e) {
      console.error('Delete conversation error', e)
      // reload list if delete failed
      fetchConvs()
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => () => {
    if (channelRef.current) supabaseClient.removeChannel(channelRef.current).catch(() => {})
    if (pollRef.current) clearInterval(pollRef.current)
    if (listPollRef.current) clearInterval(listPollRef.current)
  }, [])

  const send = async () => {
    if (!input.trim() || !selected || sending) return
    setSending(true)
    const text = input.trim(); setInput('')
    try {
      const r = await apiFetch(`/api/conversations/${selected.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      })
      const { message } = await r.json()
      if (message) {
        setMsgs(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
        setConvs(prev => prev.map(c => c.id === selected.id
          ? { ...c, last_message: text || 'Message', last_message_at: new Date().toISOString() }
          : c))
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch {}
    setSending(false)
  }

  const sendGif = async (gif: GifResult) => {
    if (!selected || sending) return
    setSending(true)
    setShowGifPicker(false)
    try {
      const r = await apiFetch(`/api/conversations/${selected.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ gif_url: gif.url }),
      })
      const { message } = await r.json()
      if (message) {
        setMsgs(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
        setConvs(prev => prev.map(c => c.id === selected.id
          ? { ...c, last_message: '🎬 GIF', last_message_at: new Date().toISOString() }
          : c))
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch {}
    setSending(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB')
      return
    }
    
    // Store original file until editing completes
    origFileRef.current = file

    // Create preview and open editor
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
      setShowImageEditor(true)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Ensure we send the user's JWT so the upload route can authenticate
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        alert('Please sign in to upload images')
        return null
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await apiFetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Image upload error:', error)
      return null
    }
  }

  const sendImage = async () => {
    if (!selectedImage || !selected || sending) return

    setSending(true)
    try {
      const imageUrl = await uploadImage(selectedImage)
      if (!imageUrl) {
        alert('Failed to upload image')
        setSending(false)
        return
      }

      const r = await apiFetch(`/api/conversations/${selected.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: input.trim() || '', photos: [imageUrl] }),
      })
      const { message } = await r.json()
      if (message) {
        setMsgs(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
        setConvs(prev => prev.map(c => c.id === selected.id
          ? { ...c, last_message: '📷 Photo', last_message_at: new Date().toISOString() }
          : c))
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }

      setSelectedImage(null)
      setImagePreview(null)
      setInput('')
    } catch (error) {
      console.error('Send image error:', error)
      alert('Failed to send image')
    }
    setSending(false)
  }

  const lastReadSentId = [...msgs].reverse().find(m => m.sender_id === myUserId && m.is_read)?.id
  const groupedMessages = groupMessagesByDate(msgs)

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-3">
        {[1, 2, 3].map(i => <div key={i} className="h-[72px] rounded-[20px] bg-[#F5F5F5] animate-pulse" />)}
      </div>
    )
  }

  if (convs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[18px] font-bold text-[#0D0D0D]">{t.noConversationsYet || 'Pas encore de conversations'}</p>
        <p className="text-[14px] text-[#888] leading-relaxed max-w-[260px]">
          {t.openAMessage || 'Ouvre un message et appuie sur "Commencer une conversation" pour répondre en privé'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col pb-10">
        {sortedConvs.map((conv, idx) => {
          const isFav = favorites.has(conv.id)
          const seenTs = lastSeenAt[conv.id] ?? 0
          const lastMsgTs = conv.last_message_at ? new Date(conv.last_message_at).getTime() : 0
          const isUnread = lastMsgTs > seenTs

          return (
            <button
              key={conv.id}
              onClick={() => openConv(conv)}
              onTouchStart={() => {
                longPressTimer.current = setTimeout(() => openRename(conv), 600)
              }}
              onTouchEnd={() => {
                if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
              }}
              onTouchMove={() => {
                if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
              }}
              className={`w-full text-left flex items-center gap-3 px-5 py-[14px] active:bg-[#FAFAFA] transition-colors ${idx === 0 ? '' : 'border-t border-[#EFEFEF]'}`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="#888" strokeWidth="2"/>
                  </svg>
                </div>
                {isUnread && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF3B30] border-2 border-white" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {isFav && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF3B30" className="flex-shrink-0">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  )}
                  <p className={`text-[15px] truncate ${isUnread ? 'font-bold text-[#0D0D0D]' : 'font-semibold text-[#0D0D0D]'}`}>
                    {convDisplayName(conv)}
                  </p>
                </div>
                <p className={`text-[12px] truncate ${isUnread ? 'text-[#555]' : 'text-[#ADADAD]'}`}>
                  {conv.last_message ?? (t.noMessagesYet || 'Pas encore de messages')}
                </p>
              </div>

              {/* Right side: time + heart */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {conv.last_message_at && (
                  <p className={`text-[11px] ${isUnread ? 'text-[#FF3B30] font-semibold' : 'text-[#CCC]'}`}>
                    {timeAgo(conv.last_message_at)}
                  </p>
                )}
                <button
                  onClick={e => toggleFavorite(conv.id, e)}
                  className="w-6 h-6 flex items-center justify-center active:scale-75 transition-transform"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isFav ? '#FF3B30' : 'none'} stroke={isFav ? '#FF3B30' : '#CCC'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteConversation(conv.id) }}
                  className="w-6 h-6 flex items-center justify-center active:scale-75 transition-transform"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CC5757" strokeWidth="1.8">
                    <path d="M3 6h18" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </button>
          )
        })}
      </div>

      {/* Rename modal */}
      {renameConvId && portalTarget && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }} onClick={() => setRenameConvId(null)}>
          <div className="bg-white rounded-t-[28px] w-full px-5 pt-3 pb-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#DDD]" />
            </div>
            <p className="text-[18px] font-bold text-[#0D0D0D] mb-4">{t.renameConversation || 'Renommer la conversation'}</p>
            <input
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitRename() }}
              placeholder={t.enterAName || 'Entrez un nom…'}
              maxLength={60}
              className="w-full rounded-[14px] bg-[#F5F5F7] px-4 py-3.5 text-[15px] text-[#0D0D0D] outline-none mb-3"
              style={{ fontFamily: 'inherit' }}
            />
            <div className="flex gap-2">
              <button onClick={() => setRenameConvId(null)} className="flex-1 py-3.5 rounded-[14px] bg-[#F2F2F7] text-[#0D0D0D] font-semibold text-[15px] active:scale-95 transition-transform">
                {t.cancel || 'Annuler'}
              </button>
              <button onClick={commitRename} className="flex-1 py-3.5 rounded-[14px] bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform">
                {t.save || 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}

      {/* Image editor modal */}
      {showImageEditor && imagePreview && portalTarget && createPortal(
        <ImageEditor
          src={imagePreview}
          onDone={(blob, dataUrl) => {
            const fileName = origFileRef.current?.name || `${Date.now()}.jpg`
            const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' })
            setSelectedImage(file)
            setImagePreview(dataUrl)
            setShowImageEditor(false)
            origFileRef.current = null
          }}
          onCancel={() => {
            setShowImageEditor(false)
            setSelectedImage(null)
            setImagePreview(null)
            origFileRef.current = null
          }}
        />,
        portalTarget
      )}

      {/* Conversation thread — portaled */}
      {selected && portalTarget && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col bg-white" style={{ borderRadius: '32px 32px 0 0' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-[#F2F2F2] flex-shrink-0">
            <button onClick={closeConv} className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#0D0D0D] truncate">{convDisplayName(selected)}</p>
              <p className="text-[11px] text-[#ADADAD]">{t.endToEndPrivate || 'Conversation privée de bout en bout'}</p>
            </div>
            {/* Rename button */}
            <button
              onClick={() => openRename(selected)}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 20h9" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => deleteConversation(selected.id)}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 ml-2"
              title="Delete conversation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CC5757" strokeWidth="1.6">
                <path d="M3 6h18" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1.5">
            <style>{`
              .msg-appear { animation: msgEnter 420ms cubic-bezier(.2,.9,.2,1); }
              @keyframes msgEnter {
                from { transform: translateY(10px) scale(0.996); opacity: 0 }
                to   { transform: translateY(0) scale(1); opacity: 1 }
              }
              .msg-appear > * { will-change: transform, opacity }
            `}</style>
            {loadingMsgs ? (
              <div className="flex-1 flex items-center justify-center pt-16">
                <div className="w-8 h-8 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : msgs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center pt-16">
                <p className="text-[14px] text-[#ADADAD] text-center">{t.noMessagesYetSayHello || 'Pas encore de messages. Dis bonjour !'}</p>
              </div>
            ) : (
              groupedMessages.map(group => (
                <div key={group.key} className="flex flex-col gap-1.5">
                  {group.label && (
                    <div className="mx-auto my-2 rounded-full bg-[#0D0D0D] px-3 py-1.5 text-[10px] font-semibold text-white tracking-[0.08em] uppercase">
                      {group.label}
                    </div>
                  )}
                  {group.items.map((m, i) => {
                    const isMine = m.sender_id === myUserId
                    const isLastMine = isMine && group.items.slice(i + 1).every(n => n.sender_id !== myUserId)
                    const photoUrls = Array.isArray(m.photos)
                      ? m.photos.filter(Boolean)
                      : typeof m.photos === 'string' && m.photos
                        ? [m.photos]
                        : m.image_url
                          ? [m.image_url]
                          : []

                    return (
                      <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${animatingIds.has(m.id) ? 'msg-appear' : ''}`}>
                        {m.gif_url ? (
                          <img src={`/api/gif-proxy?url=${encodeURIComponent(m.gif_url)}`} alt="GIF" className="max-w-[220px] rounded-[16px] block" style={{ border: isMine ? '2px solid rgba(100,80,200,0.3)' : '2px solid #E8E8E8' }} />
                        ) : photoUrls.length > 0 ? (
                          <div className="flex max-w-[220px] flex-col gap-2">
                            {m.content && (
                              <div
                                className="px-4 py-3"
                                style={{
                                  background: isMine
                                    ? 'linear-gradient(145deg, #0D0D0D 0%, #1C1C2E 55%, #2D1B69 100%)'
                                    : '#F2F2F2',
                                  borderRadius: isMine ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                }}
                              >
                                <p style={{ color: isMine ? '#FFFFFF' : '#0D0D0D', fontSize: '15px', lineHeight: '1.4' }}>{m.content}</p>
                              </div>
                            )}
                            {photoUrls.map((photoUrl) => (
                              <img
                                key={`${m.id}-${photoUrl}`}
                                src={photoUrl}
                                alt="Photo"
                                className="max-w-[220px] rounded-[16px] block object-cover cursor-pointer"
                                style={{ border: isMine ? '2px solid rgba(100,80,200,0.3)' : '2px solid #E8E8E8' }}
                                onClick={() => openFullImage(photoUrl)}
                              />
                            ))}
                          </div>
                        ) : m.content ? (
                          <div
                            className="max-w-[78%] px-4 py-3"
                            style={{
                              background: isMine
                                ? 'linear-gradient(145deg, #0D0D0D 0%, #1C1C2E 55%, #2D1B69 100%)'
                                : '#F2F2F2',
                              borderRadius: isMine ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                            }}
                          >
                            <p style={{ color: isMine ? '#FFFFFF' : '#0D0D0D', fontSize: '15px', lineHeight: '1.4' }}>{m.content}</p>
                          </div>
                        ) : null}
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] text-[#C8C8C8]">{formatMessageTime(m.created_at)}</span>
                          {isMine && m.id === lastReadSentId && (
                            <span className="text-[10px] text-[#2AC642] font-medium">{t.read || 'Lu'}</span>
                          )}
                          {isMine && m.id !== lastReadSentId && isLastMine && (
                            <span className="text-[10px] text-[#C8C8C8]">{t.sent || 'Envoyé'}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

            {portalTarget && showImageFull && fullImageUrl && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setShowImageFull(false)}>
                <button onClick={() => setShowImageFull(false)} style={{ position: 'absolute', top: 20, right: 20, zIndex: 60, background: 'rgba(255,255,255,0.06)', borderRadius: '999px', padding: '8px' }}>{t.cancel || 'Fermer'}</button>
                <img src={fullImageUrl} alt="Fullscreen" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', borderRadius: 12 }} />
              </div>,
              portalTarget,
            )}

          {/* Input */}
          <div className="px-4 pb-8 pt-3 border-t border-[#F2F2F2] flex-shrink-0">
            {showGifPicker && (
              <div className="relative h-0 mb-[316px]">
                <GifPicker
                  onSelect={gif => sendGif(gif)}
                  onClose={() => setShowGifPicker(false)}
                />
              </div>
            )}
            
            {/* Image preview */}
              {imagePreview && (
              <div className="mb-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[200px] object-contain rounded-[16px]"
                  onClick={() => setShowImageEditor(true)}
                />
                <button
                  onClick={() => { setSelectedImage(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowGifPicker(p => !p)}
                className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 text-[18px]"
                style={{ background: showGifPicker ? '#0D0D0D' : '#F5F5F5' }}
              >
                <span style={{ filter: showGifPicker ? 'brightness(0) invert(1)' : 'none' }}>🎬</span>
              </button>
              
              <label className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 cursor-pointer text-[18px]"
                style={{ background: '#F5F5F5' }}
              >
                <span>📷</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { 
                  if (e.key === 'Enter') { 
                    e.preventDefault(); 
                    if (imagePreview) {
                      sendImage()
                    } else if (input.trim()) {
                      send()
                    }
                  } 
                }}
                placeholder={t.messagePlaceholder || 'Message…'}
                maxLength={500}
                className="flex-1 rounded-full bg-[#F5F5F5] px-4 py-3 text-[15px] text-[#0D0D0D] outline-none"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                onClick={() => {
                  if (imagePreview) {
                    sendImage()
                  } else if (input.trim()) {
                    send()
                  }
                }}
                disabled={sending || (!input.trim() && !imagePreview)}
                className="w-10 h-10 rounded-full bg-[#0D0D0D] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 flex-shrink-0"
              >
                {sending
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                }
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </>
  )
}