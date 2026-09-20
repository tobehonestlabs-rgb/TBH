'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'
import { apiFetch } from '@/lib/api'
import { formatMessageTime, formatGroupLabel, groupMessagesByDate } from '@/lib/chatUtils'
import GifPicker, { GifResult } from './GifPicker'
import ImageEditor from './ImageEditor'
import { useTranslation } from '@/lib/i18n'
import { extractPhotoUrls } from '@/lib/chatImages'

type Conversation = {
  id: string
  created_at: string
  last_message_at: string | null
  last_message: string | null
  original_message_id: string | null
  original_message_content?: string | null
  participant_1: string | null
  participant_2: string | null
  last_sender_id?: string | null
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
  reply_to_id?: string | null
  reply_to_content?: string | null
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

function cleanReplyPreview(text?: string | null): string {
  if (!text) return ''
  return text.replace(/^[📷🎬🔙↪]\s*/, '').trim()
}

function MessageBubbleRow({
  m,
  isMine,
  isPrevSame,
  isNextSame,
  isLastMine,
  bubbleRadius,
  lastReadSentId,
  onReply,
  onOpenFull,
  isAnimated,
  t,
}: {
  m: ConvMsg
  isMine: boolean
  isPrevSame: boolean
  isNextSame: boolean
  isLastMine: boolean
  bubbleRadius: string
  lastReadSentId?: string
  onReply: (m: ConvMsg) => void
  onOpenFull: (url: string) => void
  isAnimated: boolean
  t: any
}) {
  const [dragOffset, setDragOffset] = useState(0)
  const touchStartX = useRef(0)
  const isDragging = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    const deltaX = e.touches[0].clientX - touchStartX.current
    if (deltaX > 0) {
      setDragOffset(Math.min(deltaX * 0.55, 65))
    } else {
      setDragOffset(0)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    if (dragOffset >= 40) {
      try { navigator.vibrate?.(20) } catch {}
      onReply(m)
    }
    setDragOffset(0)
  }

  const scrollToRepliedMessage = (replyId?: string | null) => {
    if (!replyId) return
    const target = document.getElementById(`msg-${replyId}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      target.classList.add('opacity-50')
      setTimeout(() => target.classList.remove('opacity-50'), 600)
    }
  }

  const photoUrls = extractPhotoUrls(m.photos, m.image_url)

  return (
    <div
      id={`msg-${m.id}`}
      className={`relative group flex flex-col ${isMine ? 'items-end' : 'items-start'} ${isPrevSame ? 'mt-1' : 'mt-2.5'} ${isAnimated ? 'msg-appear' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: dragOffset > 0 ? `translateX(${dragOffset}px)` : 'none',
        transition: isDragging.current ? 'none' : 'transform 200ms cubic-bezier(0.2, 0.9, 0.2, 1)',
      }}
    >
      {/* Swipe Reply Icon (slides from the left when dragged) */}
      <div
        className="absolute left-[-36px] top-1/2 -translate-y-1/2 pointer-events-none transition-opacity"
        style={{
          opacity: Math.min(dragOffset / 35, 1),
          transform: `translateY(-50%) scale(${Math.min(dragOffset / 35, 1)})`,
        }}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${dragOffset >= 40 ? 'bg-[#0D0D0D] text-white' : 'bg-[#E5E5EA] text-[#8E8E93]'}`}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 14l-5-5 5-5M4 9h10a5 5 0 0 1 5 5v3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Desktop Hover Reply Button */}
      <button
        type="button"
        onClick={() => onReply(m)}
        className={`hidden group-hover:flex absolute top-1/2 -translate-y-1/2 ${isMine ? 'left-[-30px]' : 'right-[-30px]'} w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 text-[#0D0D0D] items-center justify-center transition-transform active:scale-90 z-20`}
        title="Répondre"
      >
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 14l-5-5 5-5M4 9h10a5 5 0 0 1 5 5v3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Media: GIF */}
      {m.gif_url ? (
        <div
          className="max-w-[240px] shadow-sm overflow-hidden flex flex-col transition-all"
          style={{
            background: isMine
              ? 'linear-gradient(145deg, #000000 0%, #303030 100%)'
              : '#F2F2F4',
            borderRadius: bubbleRadius,
            border: isMine ? '1.5px solid rgba(255,255,255,0.12)' : '1px solid #E8E8E8',
          }}
        >
          {m.reply_to_content && (
            <div
              onClick={() => scrollToRepliedMessage(m.reply_to_id)}
              className={`px-3.5 pt-2 pb-2 cursor-pointer transition-colors border-b select-none ${
                isMine
                  ? 'bg-white/[0.08] hover:bg-white/[0.14] border-white/15'
                  : 'bg-black/[0.05] hover:bg-black/[0.08] border-black/[0.08]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className={isMine ? 'text-white/70 shrink-0' : 'text-[#8E8E93] shrink-0'}>
                  <path d="M9 14l-5-5 5-5M4 9h10a5 5 0 0 1 5 5v3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isMine ? 'text-white/70' : 'text-[#6E6E73]'}`}>
                  Réponse
                </span>
              </div>
              <p
                className={`text-[12px] leading-snug line-clamp-2 ${isMine ? 'text-white/90' : 'text-[#1C1C1E]'}`}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {cleanReplyPreview(m.reply_to_content)}
              </p>
            </div>
          )}
          <img
            src={`/api/gif-proxy?url=${encodeURIComponent(m.gif_url)}`}
            alt="GIF"
            className="w-full block"
          />
        </div>
      ) : photoUrls.length > 0 ? (
        <div
          className="max-w-[260px] shadow-sm overflow-hidden flex flex-col transition-all"
          style={{
            background: isMine
              ? 'linear-gradient(145deg, #000000 0%, #303030 100%)'
              : '#F2F2F4',
            borderRadius: bubbleRadius,
            border: isMine ? '1.5px solid rgba(255,255,255,0.12)' : '1px solid #E8E8E8',
          }}
        >
          {m.reply_to_content && (
            <div
              onClick={() => scrollToRepliedMessage(m.reply_to_id)}
              className={`px-3.5 pt-2 pb-2 cursor-pointer transition-colors border-b select-none ${
                isMine
                  ? 'bg-white/[0.08] hover:bg-white/[0.14] border-white/15'
                  : 'bg-black/[0.05] hover:bg-black/[0.08] border-black/[0.08]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className={isMine ? 'text-white/70 shrink-0' : 'text-[#8E8E93] shrink-0'}>
                  <path d="M9 14l-5-5 5-5M4 9h10a5 5 0 0 1 5 5v3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isMine ? 'text-white/70' : 'text-[#6E6E73]'}`}>
                  Réponse
                </span>
              </div>
              <p
                className={`text-[12px] leading-snug line-clamp-2 ${isMine ? 'text-white/90' : 'text-[#1C1C1E]'}`}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {cleanReplyPreview(m.reply_to_content)}
              </p>
            </div>
          )}
          {m.content && (
            <div className="px-4 py-2.5">
              <p
                style={{
                  color: isMine ? '#FFFFFF' : '#0D0D0D',
                  fontSize: '15px',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {m.content}
              </p>
            </div>
          )}
          {photoUrls.map((photoUrl) => (
            <img
              key={`${m.id}-${photoUrl}`}
              src={photoUrl}
              alt="Photo"
              className="w-full block object-cover cursor-pointer"
              onClick={() => onOpenFull(photoUrl)}
            />
          ))}
        </div>
      ) : m.content ? (
        m.reply_to_content ? (
          /* 1 Single box divided into two compartments: upper = referenced message, lower = sent message */
          <div
            className="max-w-[82%] sm:max-w-[75%] min-w-[150px] shadow-sm overflow-hidden flex flex-col transition-all"
            style={{
              background: isMine
                ? 'linear-gradient(145deg, #000000 0%, #303030 100%)'
                : '#F2F2F4',
              borderRadius: bubbleRadius,
            }}
          >
            {/* Compartiment supérieur : message auquel on répond */}
            <div
              onClick={() => scrollToRepliedMessage(m.reply_to_id)}
              className={`px-3.5 pt-2 pb-2 cursor-pointer transition-colors border-b select-none ${
                isMine
                  ? 'bg-white/[0.08] hover:bg-white/[0.14] border-white/15'
                  : 'bg-black/[0.05] hover:bg-black/[0.08] border-black/[0.08]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className={isMine ? 'text-white/70 shrink-0' : 'text-[#8E8E93] shrink-0'}>
                  <path d="M9 14l-5-5 5-5M4 9h10a5 5 0 0 1 5 5v3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isMine ? 'text-white/70' : 'text-[#6E6E73]'}`}>
                  Réponse
                </span>
              </div>
              <p
                className={`text-[12px] leading-snug line-clamp-2 ${isMine ? 'text-white/90' : 'text-[#1C1C1E]'}`}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {cleanReplyPreview(m.reply_to_content)}
              </p>
            </div>

            {/* Compartiment inférieur : message envoyé */}
            <div className="px-4 py-2.5">
              <p
                style={{
                  color: isMine ? '#FFFFFF' : '#0D0D0D',
                  fontSize: '15px',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {m.content}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="max-w-[82%] sm:max-w-[75%] px-4 py-2.5 shadow-sm transition-all"
            style={{
              background: isMine
                ? 'linear-gradient(145deg, #000000 0%, #303030 100%)'
                : '#F2F2F4',
              borderRadius: bubbleRadius,
            }}
          >
            <p
              style={{
                color: isMine ? '#FFFFFF' : '#0D0D0D',
                fontSize: '15px',
                lineHeight: '1.45',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {m.content}
            </p>
          </div>
        )
      ) : null}

      {/* Message status (time, read, sent) */}
      {(!isNextSame || isLastMine) && (
        <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-[#A0A0A5]">{formatMessageTime(m.created_at)}</span>
          {isMine && m.id === lastReadSentId && (
            <span className="text-[10px] text-[#2AC642] font-medium">{t.read || 'Lu'}</span>
          )}
          {isMine && m.id !== lastReadSentId && isLastMine && (
            <span className="text-[10px] text-[#A0A0A5]">{t.sent || 'Envoyé'}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function ChatPage({ onUnreadChange }: { onUnreadChange?: (has: boolean) => void }) {
  const { t } = useTranslation()
  const [convs, setConvs]           = useState<Conversation[]>([])
  const [loading, setLoading]       = useState(true)
  const [myUserId, setMyUserId]     = useState<string | null>(null)
  const myUserIdRef                 = useRef<string | null>(null)
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

  // Rename modal & options menu
  const [renameConvId, setRenameConvId]   = useState<string | null>(null)
  const [renameValue, setRenameValue]     = useState('')
  const [showMenu, setShowMenu]           = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reply state
  const [replyingTo, setReplyingTo]       = useState<ConvMsg | null>(null)

  // Typing indicator
  const [peerTyping, setPeerTyping]       = useState(false)
  const peerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const myTypingTimeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingBroadcasted  = useRef(false)

  // Auto-expanding textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInput(val)
    adjustTextareaHeight()

    if (channelRef.current && myUserId) {
      if (!isTypingBroadcasted.current) {
        isTypingBroadcasted.current = true
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { isTyping: true, userId: myUserId },
        }).catch(() => {})
      }
      if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current)
      myTypingTimeoutRef.current = setTimeout(() => {
        isTypingBroadcasted.current = false
        channelRef.current?.send({
          type: 'broadcast',
          event: 'typing',
          payload: { isTyping: false, userId: myUserId },
        }).catch(() => {})
      }, 2000)
    }
  }

  const clearTyping = () => {
    if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current)
    if (isTypingBroadcasted.current && channelRef.current && myUserId) {
      isTypingBroadcasted.current = false
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { isTyping: false, userId: myUserId },
      }).catch(() => {})
    }
  }

  const bottomRef    = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    if (!messagesContainerRef.current) return
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [])
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
      const uid = d.userId ?? null
      setMyUserId(uid)
      myUserIdRef.current = uid
      return list
    } catch { return [] }
  }, [])

  const checkUnread = useCallback((list: Conversation[], seen: Record<string, number>, currentUserId?: string | null) => {
    const uid = currentUserId ?? myUserIdRef.current
    const hasAny = list.some(c => {
      if (!c.last_message_at) return false
      // L'utilisateur ne doit pas recevoir de notification s'il a envoyé le dernier message
      if (uid && c.last_sender_id === uid) return false
      const t = new Date(c.last_message_at).getTime()
      return t > (seen[c.id] ?? 0)
    })
    onUnreadChange?.(hasAny)
  }, [onUnreadChange])

  useEffect(() => {
    fetchConvs().then(list => {
      setLoading(false)
      // Check unread after initial load
      checkUnread(list, loadLastSeen(), myUserIdRef.current)
    })

    // Poll conversation list to detect new messages
    listPollRef.current = setInterval(() => {
      fetchConvs().then(list => {
        checkUnread(list, loadLastSeen(), myUserIdRef.current)
      })
    }, 3000)

    return () => {
      if (listPollRef.current) clearInterval(listPollRef.current)
    }
  }, [fetchConvs, checkUnread])

  // Re-check unread whenever convs, lastSeenAt, or myUserId change
  useEffect(() => {
    checkUnread(convs, lastSeenAt, myUserId)
  }, [convs, lastSeenAt, myUserId, checkUnread])

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
    setTimeout(() => scrollToBottom(false), 50)

    // Mark incoming messages as read
    apiFetch(`/api/conversations/${conv.id}/read`, { method: 'POST' }).catch(() => {})

    // Realtime subscription (Broadcast + Postgres Changes)
    const ch = supabaseClient.channel(`conv-${conv.id}`, {
      config: { broadcast: { self: false } },
    })

    // 1. Instant WebSocket broadcast for new messages (< 50ms)
    ch.on('broadcast', { event: 'new_message' }, payload => {
      const rawMsg = payload.payload?.message as any
      if (!rawMsg) return
      const parsedPhotos = extractPhotoUrls(rawMsg.photos, rawMsg.image_url)
      const newMsg: ConvMsg = {
        ...rawMsg,
        photos: parsedPhotos,
        image_url: rawMsg.image_url || (parsedPhotos.length > 0 ? parsedPhotos[0] : null),
      }
      setMsgs(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev
        setAnimatingIds(ids => {
          const next = new Set(ids)
          next.add(newMsg.id)
          setTimeout(() => setAnimatingIds(cur => { const s = new Set(cur); s.delete(newMsg.id); return s }), 800)
          return next
        })
        return [...prev, newMsg]
      })
      setPeerTyping(false)
      setTimeout(() => scrollToBottom(true), 50)
      setMyUserId(uid => {
        if (uid && newMsg.sender_id !== uid) {
          apiFetch(`/api/conversations/${conv.id}/read`, { method: 'POST' }).catch(() => {})
        }
        return uid
      })
    })

    // 2. Instant WebSocket broadcast for typing indicator
    ch.on('broadcast', { event: 'typing' }, payload => {
      const { isTyping, userId } = payload.payload || {}
      setMyUserId(uid => {
        if (userId && userId !== uid) {
          setPeerTyping(!!isTyping)
          if (peerTypingTimeoutRef.current) clearTimeout(peerTypingTimeoutRef.current)
          if (isTyping) {
            setTimeout(() => scrollToBottom(true), 50)
            peerTypingTimeoutRef.current = setTimeout(() => {
              setPeerTyping(false)
            }, 4000)
          }
        }
        return uid
      })
    })

    // 3. Postgres changes (database truth)
    ch
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conv.id}`,
      }, payload => {
        const rawMsg = payload.new as any
        const parsedPhotos = extractPhotoUrls(rawMsg.photos, rawMsg.image_url)
        const newMsg: ConvMsg = {
          ...rawMsg,
          photos: parsedPhotos,
          image_url: rawMsg.image_url || (parsedPhotos.length > 0 ? parsedPhotos[0] : null),
        }
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
        setPeerTyping(false)
        setTimeout(() => scrollToBottom(true), 50)
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
        const fetched: ConvMsg[] = (data.messages ?? []).map((m: any) => {
          const parsedPhotos = extractPhotoUrls(m.photos, m.image_url)
          return {
            ...m,
            photos: parsedPhotos,
            image_url: m.image_url || (parsedPhotos.length > 0 ? parsedPhotos[0] : null),
          }
        })
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
          setTimeout(() => scrollToBottom(true), 50)
          return [...prev, ...newOnes]
        })
      } catch {}
    }, 1000)
  }

  const closeConv = () => {
    clearTyping()
    if (peerTypingTimeoutRef.current) clearTimeout(peerTypingTimeoutRef.current)
    setPeerTyping(false)
    setReplyingTo(null)
    if (channelRef.current) { supabaseClient.removeChannel(channelRef.current).catch(() => {}); channelRef.current = null }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    selectedRef.current = null
    setSelected(null)
    setMsgs([])
    setShowGifPicker(false)
    setShowMenu(false)
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
    const text = input.trim()
    const currentReply = replyingTo
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setReplyingTo(null)
    clearTyping()

    try {
      const r = await apiFetch(`/api/conversations/${selected.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: text,
          reply_to_id: currentReply?.id || null,
          reply_to_content: currentReply ? (currentReply.content || (currentReply.photos?.length ? 'Photo' : currentReply.gif_url ? 'GIF' : 'Message')) : null,
        }),
      })
      const { message } = await r.json()
      if (message) {
        const now = Date.now()
        setMsgs(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
        setConvs(prev => prev.map(c => c.id === selected.id
          ? { ...c, last_message: text || 'Message', last_message_at: new Date().toISOString(), last_sender_id: myUserId }
          : c))
        setLastSeenAt(prev => {
          const next = { ...prev, [selected.id]: now }
          saveLastSeen(next)
          return next
        })
        setTimeout(() => scrollToBottom(true), 50)
        channelRef.current?.send({
          type: 'broadcast',
          event: 'new_message',
          payload: { message },
        }).catch(() => {})
      }
    } catch {}
    setSending(false)
  }

  const sendGif = async (gif: GifResult) => {
    if (!selected || sending) return
    setSending(true)
    const currentReply = replyingTo
    setShowGifPicker(false)
    setReplyingTo(null)
    clearTyping()

    try {
      const r = await apiFetch(`/api/conversations/${selected.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          gif_url: gif.url,
          reply_to_id: currentReply?.id || null,
          reply_to_content: currentReply ? (currentReply.content || (currentReply.photos?.length ? 'Photo' : currentReply.gif_url ? 'GIF' : 'Message')) : null,
        }),
      })
      const { message } = await r.json()
      if (message) {
        const now = Date.now()
        setMsgs(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
        setConvs(prev => prev.map(c => c.id === selected.id
          ? { ...c, last_message: 'GIF', last_message_at: new Date().toISOString(), last_sender_id: myUserId }
          : c))
        setLastSeenAt(prev => {
          const next = { ...prev, [selected.id]: now }
          saveLastSeen(next)
          return next
        })
        setTimeout(() => scrollToBottom(true), 50)
        channelRef.current?.send({
          type: 'broadcast',
          event: 'new_message',
          payload: { message },
        }).catch(() => {})
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
    const currentReply = replyingTo
    setReplyingTo(null)
    clearTyping()

    try {
      const imageUrl = await uploadImage(selectedImage)
      if (!imageUrl) {
        alert('Failed to upload image')
        setSending(false)
        return
      }

      const text = input.trim()
      setInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'

      const r = await apiFetch(`/api/conversations/${selected.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: text || '',
          image_url: imageUrl,
          photos: [imageUrl],
          reply_to_id: currentReply?.id || null,
          reply_to_content: currentReply ? (currentReply.content || (currentReply.photos?.length ? 'Photo' : currentReply.gif_url ? 'GIF' : 'Message')) : null,
        }),
      })
      const { message } = await r.json()
      if (message) {
        const parsedPhotos = extractPhotoUrls(message.photos, message.image_url)
        const normalizedMessage: ConvMsg = {
          ...message,
          photos: parsedPhotos,
          image_url: message.image_url || (parsedPhotos.length > 0 ? parsedPhotos[0] : null),
        }
        const now = Date.now()
        setMsgs(prev => prev.find(m => m.id === normalizedMessage.id) ? prev : [...prev, normalizedMessage])
        setConvs(prev => prev.map(c => c.id === selected.id
          ? { ...c, last_message: 'Photo', last_message_at: new Date().toISOString(), last_sender_id: myUserId }
          : c))
        setLastSeenAt(prev => {
          const next = { ...prev, [selected.id]: now }
          saveLastSeen(next)
          return next
        })
        setTimeout(() => scrollToBottom(true), 50)
        channelRef.current?.send({
          type: 'broadcast',
          event: 'new_message',
          payload: { message: normalizedMessage },
        }).catch(() => {})
      }

      setSelectedImage(null)
      setImagePreview(null)
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
          const isMineLast = myUserId && conv.last_sender_id === myUserId
          const isUnread = !isMineLast && (lastMsgTs > seenTs)

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
              className="w-full text-left flex items-center gap-3 px-5 py-[14px] active:bg-[#F2F2F7] active:scale-[0.985] transition-all duration-150 ease-out select-none cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/ChatHeart.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain pointer-events-none"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <p className={`text-[15px] truncate ${isUnread ? 'font-bold text-[#0D0D0D]' : 'font-semibold text-[#0D0D0D]'}`}>
                    {convDisplayName(conv)}
                  </p>
                </div>
                <p className={`text-[12px] truncate ${isUnread ? 'text-[#555]' : 'text-[#ADADAD]'}`}>
                  {conv.last_message ?? (t.noMessagesYet || 'Pas encore de messages')}
                </p>
              </div>

              {/* Right side: time + favorite heart */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {conv.last_message_at && (
                  <p className={`text-[11px] ${isUnread ? 'text-[#FF3B30] font-semibold' : 'text-[#ADADAD]'}`}>
                    {timeAgo(conv.last_message_at)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={e => toggleFavorite(conv.id, e)}
                  aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-out active:scale-125 hover:scale-110 active:rotate-[-8deg] ${
                    isFav 
                      ? 'bg-[#FF3358]/10 hover:bg-[#FF3358]/15' 
                      : 'hover:bg-[#F2F2F7] active:bg-[#EBEBEF]'
                  }`}
                  style={{
                    filter: isFav ? 'drop-shadow(0 2px 6px rgba(255, 75, 100, 0.35))' : 'none'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" className="transition-transform duration-200">
                    <defs>
                      <linearGradient id={`fav-gradient-${conv.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B7A" />
                        <stop offset="100%" stopColor="#FF3358" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      fill={isFav ? `url(#fav-gradient-${conv.id})` : 'none'}
                      stroke={isFav ? `url(#fav-gradient-${conv.id})` : '#C7C7CC'}
                      strokeWidth={isFav ? '1.8' : '2'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
        <div className="absolute inset-0 z-50 overflow-hidden bg-white" style={{ borderRadius: '32px 32px 0 0' }}>
          {/* Layer 2: Fixed Top Bar (Header) */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-5 pt-5 pb-3 border-b border-[#F2F2F2]/90 bg-white/92 backdrop-blur-md">
            <button onClick={closeConv} className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#0D0D0D] truncate">{convDisplayName(selected)}</p>
              <p className="text-[11px] text-[#ADADAD] truncate">{t.endToEndPrivate || 'Conversation privée de bout en bout'}</p>
            </div>
            {/* 3-dots Options Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(p => !p)}
                className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EBEBEB] flex items-center justify-center active:scale-90 transition-transform"
                title="Options"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="1.75" fill="#444" />
                  <circle cx="18" cy="12" r="1.75" fill="#444" />
                  <circle cx="6" cy="12" r="1.75" fill="#444" />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-10 z-50 w-52 rounded-[18px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-[#EFEFEF] py-1.5 overflow-hidden">
                    <button
                      onClick={() => { setShowMenu(false); openRename(selected); }}
                      className="w-full px-4 py-3 text-left text-[14px] font-medium text-[#1C1C1E] hover:bg-[#F7F7F8] active:bg-[#EEEEF0] flex items-center gap-2.5 transition-colors"
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t.renameConversation || 'Renommer la conversation'}
                    </button>
                    <div className="h-[1px] bg-[#F2F2F4] mx-3" />
                    <button
                      onClick={() => { setShowMenu(false); deleteConversation(selected.id); }}
                      className="w-full px-4 py-3 text-left text-[14px] font-medium text-[#FF3B30] hover:bg-[#FFF2F2] active:bg-[#FFE5E5] flex items-center gap-2.5 transition-colors"
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#FF3B30" strokeWidth="2">
                        <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Supprimer la conversation
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Layer 1: Messages Stream (Full Screen Scrollable Area) */}
          <div ref={messagesContainerRef} className="absolute inset-0 z-10 overflow-y-auto px-4 pt-20 pb-28 flex flex-col">
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
                <div key={group.key} className="flex flex-col">
                  {group.label && (
                    <div className="mx-auto my-3.5 text-[11px] font-semibold text-[#8E8E93] tracking-wide uppercase select-none text-center">
                      {group.label}
                    </div>
                  )}
                  {group.items.map((m, i) => {
                    const isMine = m.sender_id === myUserId
                    const prevMsg = group.items[i - 1]
                    const nextMsg = group.items[i + 1]
                    const isPrevSame = prevMsg && prevMsg.sender_id === m.sender_id
                    const isNextSame = nextMsg && nextMsg.sender_id === m.sender_id
                    const isLastMine = isMine && group.items.slice(i + 1).every(n => n.sender_id !== myUserId)
                    const photoUrls = extractPhotoUrls(m.photos, m.image_url)

                    const bubbleRadius = isMine
                      ? !isPrevSame && !isNextSame
                        ? '20px 20px 4px 20px'
                        : !isPrevSame && isNextSame
                          ? '20px 20px 6px 20px'
                          : isPrevSame && isNextSame
                            ? '20px 6px 6px 20px'
                            : '20px 6px 4px 20px'
                      : !isPrevSame && !isNextSame
                        ? '20px 20px 20px 4px'
                        : !isPrevSame && isNextSame
                          ? '20px 20px 20px 6px'
                          : isPrevSame && isNextSame
                            ? '6px 20px 20px 6px'
                            : '6px 20px 20px 4px'

                    return (
                      <MessageBubbleRow
                        key={m.id}
                        m={m}
                        isMine={isMine}
                        isPrevSame={!!isPrevSame}
                        isNextSame={!!isNextSame}
                        isLastMine={!!isLastMine}
                        bubbleRadius={bubbleRadius}
                        lastReadSentId={lastReadSentId}
                        onReply={(msg) => {
                          setReplyingTo(msg)
                          textareaRef.current?.focus()
                        }}
                        onOpenFull={openFullImage}
                        isAnimated={animatingIds.has(m.id)}
                        t={t}
                      />
                    )
                  })}
                </div>
              ))
            )}
            {/* Typing indicator bubble */}
            {peerTyping && (
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[18px] bg-[#F2F2F4] w-fit mt-2 animate-pulse shadow-sm self-start">
                <span className="w-2 h-2 rounded-full bg-[#8E8E93] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#8E8E93] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#8E8E93] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
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

          {/* Layer 3: Floating Input Pill Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none bg-gradient-to-t from-white via-white/85 to-transparent pt-6 pb-6 px-4">
            {showGifPicker && (
              <div className="relative h-0 mb-[316px] pointer-events-auto">
                <GifPicker
                  onSelect={gif => sendGif(gif)}
                  onClose={() => setShowGifPicker(false)}
                />
              </div>
            )}
            
            {/* Image preview */}
            {imagePreview && (
              <div className="mb-3 relative pointer-events-auto max-w-sm mx-auto">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[160px] object-contain rounded-[18px] bg-black/5"
                  onClick={() => setShowImageEditor(true)}
                />
                <button
                  onClick={() => { setSelectedImage(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Reply preview */}
            {replyingTo && (
              <div className="mb-2 relative pointer-events-auto flex items-center justify-between rounded-[18px] bg-white/95 backdrop-blur-md px-3.5 py-2 border border-[#E8E8EC] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-1 h-8 rounded-full bg-[#0D0D0D] flex-shrink-0" />
                  <div className="min-w-0 flex-1 text-[13px]">
                    <p className="font-semibold text-[#0D0D0D] flex items-center gap-1.5 text-[12px]">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 14l-5-5 5-5M4 9h10a5 5 0 0 1 5 5v3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Réponse à {replyingTo.sender_id === myUserId ? 'vous-même' : 'ce message'}
                    </p>
                    <p className="text-[#8E8E93] truncate">
                      {replyingTo.content || (replyingTo.photos?.length ? 'Photo' : replyingTo.gif_url ? 'GIF' : 'Message')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#8E8E93] hover:text-[#0D0D0D] transition-colors flex-shrink-0 ml-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
            
            {/* The Unified Pill Bar with Auto-expanding Textarea */}
            <div className="pointer-events-auto flex items-end rounded-[24px] bg-[#F2F2F5] px-2 py-1.5 gap-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#E8E8EC]">
              {/* Photo / Camera button */}
              <label
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer flex-shrink-0 hover:bg-black/[0.04] mb-0.5"
                title={t.photo || 'Photo'}
              >
                <img src="/assets/camera.svg" alt="Photo" className="w-5 h-5 opacity-70" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              {/* GIF button */}
              <button
                type="button"
                onClick={() => setShowGifPicker(p => !p)}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 hover:bg-black/[0.04] mb-0.5"
                title="GIF"
                style={{ background: showGifPicker ? '#0D0D0D' : 'transparent' }}
              >
                <img
                  src="/assets/image.svg"
                  alt="GIF"
                  className={`w-5 h-5 ${showGifPicker ? 'invert brightness-0' : 'opacity-70'}`}
                />
              </button>

              {/* Auto-expanding Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                onChange={handleInputChange}
                onKeyDown={e => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault() 
                    if (imagePreview) {
                      sendImage()
                    } else if (input.trim()) {
                      send()
                    }
                  } 
                }}
                placeholder={t.messagePlaceholder || 'Message…'}
                maxLength={1000}
                className="flex-1 bg-transparent px-2.5 py-2 text-[15px] text-[#0D0D0D] placeholder-[#8E8E93] outline-none min-w-0 resize-none overflow-y-auto leading-[20px] max-h-[120px]"
                style={{ fontFamily: 'inherit' }}
              />

              {/* Send button */}
              <button
                type="button"
                onClick={() => {
                  if (imagePreview) {
                    sendImage()
                  } else if (input.trim()) {
                    send()
                  }
                }}
                disabled={sending || (!input.trim() && !imagePreview)}
                className="w-9 h-9 rounded-full bg-[#0D0D0D] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-20 flex-shrink-0 mb-0.5"
                title="Envoyer"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <img src="/assets/send.svg" alt="Send" className="w-4 h-4 invert ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </>
  )
}