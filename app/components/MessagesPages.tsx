'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'

type Message = {
  message_id: string
  content: string | null
  media_url: string | null
  isOpened: boolean
  created_at: string
  contains_media: boolean
  ip_address?: string | null
  country?: string | null
  city?: string | null
  region?: string | null
  latitude?: string | null
  longitude?: string | null
  browser_name?: string | null
  device_fingerprint?: string | null
}

type Props = {
  onUnreadChange: (hasUnread: boolean) => void
  isActive: boolean
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const s = Math.floor(diff / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 30) return `${Math.floor(d / 30)}mo`
    if (d > 6)  return `${Math.floor(d / 7)}w`
    if (d > 0)  return `${d}d`
    if (h > 0)  return `${h}h`
    if (m > 0)  return `${m}m`
    return 'just now'
  } catch { return 'now' }
}

type ConvMsg = { id: string; sender_id: string; content: string; created_at: string }

export default function MessagesPage({ onUnreadChange, isActive }: Props) {
  const [messages, setMessages]         = useState<Message[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedMsg, setSelectedMsg]   = useState<Message | null>(null)
  const [sheetClosing, setSheetClosing] = useState(false)
  const [imageBlurred, setImageBlurred] = useState(true)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showReply, setShowReply]       = useState(false)
  const [replyText, setReplyText]       = useState('')
  const [showInsights, setShowInsights] = useState(false)
  const [senderCount, setSenderCount]   = useState<number | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const userIdRef = useRef<string | null>(null)

  // Conversation
  const [convId, setConvId]           = useState<string | null>(null)
  const [showConv, setShowConv]       = useState(false)
  const [convMsgs, setConvMsgs]       = useState<ConvMsg[]>([])
  const [convInput, setConvInput]     = useState('')
  const [convSending, setConvSending] = useState(false)
  const convBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setPortalTarget(document.getElementById('app-shell')) }, [])

  useEffect(() => {
    if (!isActive && selectedMsg) {
      setSelectedMsg(null); setSheetClosing(false); setShowReply(false)
      setReplyText(''); setShowFullscreen(false); setShowInsights(false)
      setSenderCount(null); setShowConv(false); setConvId(null)
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let mounted = true
    let ch: ReturnType<typeof supabaseClient.channel> | null = null
    const setup = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session || !mounted) return
      userIdRef.current = session.user.id

      const { data, error } = await supabaseClient
        .from('messages').select('*')
        .eq('to_user', session.user.id)
        .order('created_at', { ascending: false })

      if (mounted) {
        if (!error && data) { setMessages(data); onUnreadChange(data.some((m: Message) => !m.isOpened)) }
        setLoading(false)
      }

      ch = supabaseClient.channel(`inbox-${session.user.id}`)
      ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user=eq.${session.user.id}` }, (payload) => {
        if (mounted) { setMessages(prev => [payload.new as Message, ...prev]); onUnreadChange(true) }
      }).subscribe()
    }
    setup()
    return () => { mounted = false; if (ch) supabaseClient.removeChannel(ch).catch(() => {}) }
  }, [onUnreadChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const openSheet = async (msg: Message) => {
    if (!msg.isOpened) {
      // Use server-side admin route to bypass RLS
      fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msg.message_id }),
      }).catch(() => {})
      setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, isOpened: true } : m))
      onUnreadChange(messages.filter(m => !m.isOpened && m.message_id !== msg.message_id).length > 0)
    }
    setSelectedMsg(msg); setSheetClosing(false); setImageBlurred(true)
    setShowFullscreen(false); setShowReply(false); setReplyText('')
    setShowInsights(false); setSenderCount(null); setShowConv(false); setConvId(null)
  }

  const closeSheet = () => {
    setSheetClosing(true); setShowFullscreen(false); setShowConv(false)
    setTimeout(() => {
      setSelectedMsg(null); setSheetClosing(false); setShowReply(false)
      setReplyText(''); setShowInsights(false); setSenderCount(null); setConvId(null)
    }, 300)
  }

  const loadInsights = async () => {
    if (!selectedMsg) return
    setShowInsights(true)
    if (selectedMsg.ip_address && userIdRef.current && senderCount === null) {
      setLoadingInsights(true)
      const { count } = await supabaseClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', selectedMsg.ip_address)
        .eq('to_user', userIdRef.current)
      setSenderCount(count ?? 0)
      setLoadingInsights(false)
    }
  }

  const startConversation = async () => {
    if (!selectedMsg) return
    if (convId) { setShowConv(true); return }
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_message_id: selectedMsg.message_id,
          sender_ip: selectedMsg.ip_address ?? null,
        }),
      })
      const { conversation } = await res.json()
      if (!conversation) return
      setConvId(conversation.id)
      const mRes = await fetch(`/api/conversations/${conversation.id}/messages`)
      const { messages: ms } = await mRes.json()
      setConvMsgs(ms ?? [])
      setShowConv(true)
      setTimeout(() => convBottomRef.current?.scrollIntoView(), 50)
    } catch {}
  }

  const sendConvMsg = async () => {
    if (!convInput.trim() || !convId || convSending) return
    setConvSending(true)
    const text = convInput.trim(); setConvInput('')
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const { message } = await res.json()
      if (message) {
        setConvMsgs(prev => [...prev, message])
        setTimeout(() => convBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch {}
    setConvSending(false)
  }

  const handleReport = async () => {
    if (!selectedMsg) return
    try { await supabaseClient.from('messages').update({ reported: true } as any).eq('message_id', selectedMsg.message_id) } catch {}
    closeSheet()
  }

  const handleShare = async () => {
    if (!selectedMsg) return
    const text = selectedMsg.content || ''
    try {
      if (navigator.share) await navigator.share({ text })
      else await navigator.clipboard.writeText(text)
    } catch {}
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    try { if (navigator.share) await navigator.share({ text: replyText.trim() }) } catch {}
    setShowReply(false); setReplyText('')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-3">
        {[1, 2, 3].map(i => <div key={i} className="h-[76px] rounded-[20px] bg-[#F5F5F5] animate-pulse" />)}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <img src="/assets/BrokenHeart.svg" alt="" style={{ width: '56px', height: '56px' }} />
        <p className="text-[18px] font-bold text-[#888]">No messages yet</p>
        <p className="text-[13px] text-[#AAA]">Share your link to receive some!</p>
      </div>
    )
  }

  const isImageMessage = selectedMsg ? (selectedMsg.contains_media || !!selectedMsg.media_url) : false
  const imageUrl       = selectedMsg?.media_url  || null
  const textContent    = selectedMsg?.content    || null

  const mapUrl = selectedMsg?.latitude && selectedMsg?.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${+selectedMsg.longitude - 0.06}%2C${+selectedMsg.latitude - 0.06}%2C${+selectedMsg.longitude + 0.06}%2C${+selectedMsg.latitude + 0.06}&layer=mapnik&marker=${selectedMsg.latitude}%2C${selectedMsg.longitude}`
    : null

  return (
    <>
      {/* ── Message list ── */}
      <div className="flex flex-col pt-2 pb-10">
        {messages.map(msg => {
          const hasImage = msg.contains_media || !!msg.media_url
          const preview  = msg.content ?? ''
          return (
            <button
              key={msg.message_id}
              onClick={() => openSheet(msg)}
              className="relative w-full text-left mx-4 my-[5px] rounded-[20px] bg-white active:scale-[0.97] transition-transform"
              style={{ width: 'calc(100% - 32px)', boxShadow: msg.isOpened ? '0 2px 8px rgba(0,0,0,0.06)' : '0 6px 20px rgba(0,0,0,0.10)' }}
            >
              <div className="flex items-center gap-3 p-[14px]">
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: msg.isOpened ? '#E5E5E5' : 'linear-gradient(135deg, #cf5454, #ff4da6)' }}>
                  <img src={msg.isOpened ? '/assets/Love_Letter.svg' : '/assets/R.svg'} className="w-6 h-6 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  {!msg.isOpened ? (
                    <>
                      <p className="text-[16px] font-bold" style={{ background: 'linear-gradient(90deg, #FF6B6B, #4D96FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>New message</p>
                      <p className="text-[12px] text-[#888]">{hasImage ? 'Photo' : 'Tap to read'}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-medium text-[#0D0D0D] truncate">{preview}</p>
                      <p className="text-[11px] text-[#AAA]">{timeAgo(msg.created_at)}</p>
                    </>
                  )}
                </div>
                {hasImage && msg.media_url ? (
                  <div className="w-[52px] h-[52px] rounded-[12px] overflow-hidden bg-[#EEE] flex-shrink-0">
                    <img src={msg.media_url} alt="" className="w-full h-full object-cover" style={{ filter: msg.isOpened ? 'none' : 'blur(10px)' }} />
                  </div>
                ) : (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" stroke="#D0D0D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Full-screen message sheet (portaled out of slide transform) ── */}
      {selectedMsg && portalTarget && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col">
          <div
            className={`flex-1 ${sheetClosing ? 'sheet-exit' : 'sheet-enter'} bg-white flex flex-col overflow-hidden`}
            style={{ borderRadius: '32px 32px 0 0' }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
              <button onClick={handleReport} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: '#FFF0EE' }} title="Report">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="4" y1="22" x2="4" y2="15" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="w-10 h-[5px] rounded-full bg-[#E8E8E8]" />
              <button onClick={closeSheet} className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition-transform">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" stroke="#888" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Main message view ── */}
              {!showInsights && !showConv && (
                <div className="px-5 pt-3 pb-4 slide-from-left">
                  {!showReply ? (
                    <>
                      {/* Image row */}
                      {isImageMessage && imageUrl && (
                        <>
                          <button onClick={() => setShowFullscreen(true)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[22px] active:scale-[0.98] transition-transform mb-4" style={{ background: '#F7F7F9' }}>
                            <div className="w-14 h-14 rounded-[14px] overflow-hidden bg-[#E8E8E8] flex-shrink-0">
                              <img src={imageUrl} alt="" className="w-full h-full object-cover" style={{ filter: imageBlurred ? 'blur(10px)' : 'none', transition: 'filter 0.3s' }} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-semibold text-[15px] text-[#0D0D0D]">Photo</p>
                              <p className="text-[12px] text-[#ADADAD]">Tap to view fullscreen</p>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); setImageBlurred(b => !b) }}
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                              style={{ background: imageBlurred ? '#0D0D0D' : '#EBEBEB' }}
                            >
                              {imageBlurred ? (
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/></svg>
                              ) : (
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/></svg>
                              )}
                            </button>
                          </button>
                          {textContent && <div className="h-px bg-[#F0F0F0] mb-4" />}
                        </>
                      )}

                      {/* Message bubble */}
                      {textContent && (
                        <div className="w-full rounded-[28px] px-6 py-7 mb-3 flex items-center justify-center" style={{ background: '#F7F7F9', minHeight: 120 }}>
                          <p className="text-[#0D0D0D] font-semibold text-center leading-snug"
                            style={{ fontSize: textContent.length > 100 ? '18px' : textContent.length > 50 ? '22px' : '28px' }}>
                            {textContent}
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] text-[#C8C8C8] text-center mb-5">{timeAgo(selectedMsg.created_at)}</p>

                      {/* Insight hint */}
                      <button onClick={loadInsights} className="w-full flex items-center justify-between px-4 py-3.5 rounded-[22px] mb-3 active:scale-[0.98] transition-transform" style={{ background: '#F7F7F9' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EBEBEB] flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <circle cx="11" cy="11" r="8" stroke="#555" strokeWidth="2"/>
                              <path d="m21 21-4.35-4.35" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-[14px] font-semibold text-[#0D0D0D]">Who sent this?</p>
                            <p className="text-[11px] text-[#ADADAD]">View sender insights</p>
                          </div>
                        </div>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="#D0D0D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>

                      {/* Start conversation */}
                      <button onClick={startConversation} className="w-full flex items-center justify-between px-4 py-3.5 rounded-[22px] mb-5 active:scale-[0.98] transition-transform" style={{ background: '#0D0D0D' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-[14px] font-semibold text-white">Start a conversation</p>
                            <p className="text-[11px] text-white/50">Reply privately</p>
                          </div>
                        </div>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </>
                  ) : (
                    /* Reply view */
                    <>
                      <button onClick={() => setShowReply(false)} className="flex items-center gap-1.5 text-[#ADADAD] text-[13px] mb-4 active:opacity-60">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Back
                      </button>
                      {textContent && (
                        <div className="w-full rounded-[20px] px-4 py-3.5 mb-4" style={{ background: '#F7F7F9' }}>
                          <p className="text-[#888] text-[14px] leading-snug line-clamp-3">{textContent}</p>
                        </div>
                      )}
                      <textarea
                        value={replyText} onChange={e => setReplyText(e.target.value)}
                        placeholder="Write your reply…" autoFocus rows={4}
                        className="w-full rounded-[20px] bg-[#F7F7F9] px-4 py-3.5 text-[16px] text-[#0D0D0D] outline-none resize-none mb-4"
                        style={{ fontFamily: 'inherit' }}
                      />
                      <button onClick={handleSendReply} disabled={!replyText.trim()}
                        className="w-full py-[15px] rounded-full bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform disabled:opacity-40">
                        Send Reply
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ── Insights panel ── */}
              {showInsights && !showConv && (
                <div className="px-5 pt-3 pb-6 slide-from-right">
                  <button onClick={() => setShowInsights(false)} className="flex items-center gap-1.5 text-[#ADADAD] text-[13px] mb-5 active:opacity-60">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Back to message
                  </button>

                  <p className="text-[21px] font-extrabold text-[#0D0D0D] tracking-tight mb-1">Sender Insights</p>
                  <p className="text-[13px] text-[#ADADAD] mb-5">Approximate information based on network data</p>

                  <div className="flex flex-col gap-2.5 mb-4">
                    {/* Location */}
                    <div className="rounded-[22px] px-4 py-4" style={{ background: '#F7F7F9' }}>
                      <p className="text-[10px] font-semibold text-[#ADADAD] uppercase tracking-widest mb-2">Location</p>
                      <p className="text-[17px] font-bold text-[#0D0D0D]">
                        {[selectedMsg.city, selectedMsg.country].filter(Boolean).join(', ') || 'Unknown'}
                      </p>
                      {selectedMsg.region && <p className="text-[12px] text-[#ADADAD] mt-0.5">{selectedMsg.region}</p>}
                    </div>

                    {/* IP */}
                    <div className="rounded-[22px] px-4 py-4" style={{ background: '#F7F7F9' }}>
                      <p className="text-[10px] font-semibold text-[#ADADAD] uppercase tracking-widest mb-1.5">IP Address</p>
                      <p className="text-[16px] font-mono font-bold text-[#0D0D0D]">
                        {selectedMsg.ip_address
                          ? selectedMsg.ip_address.split('.').slice(0, 3).join('.') + '.*'
                          : 'Not available'}
                      </p>
                    </div>

                    {/* Browser */}
                    {selectedMsg.browser_name && (
                      <div className="rounded-[22px] px-4 py-4" style={{ background: '#F7F7F9' }}>
                        <p className="text-[10px] font-semibold text-[#ADADAD] uppercase tracking-widest mb-1.5">Browser</p>
                        <p className="text-[16px] font-bold text-[#0D0D0D]">{selectedMsg.browser_name}</p>
                      </div>
                    )}

                    {/* Message count */}
                    <div className="rounded-[22px] px-4 py-4" style={{ background: '#F7F7F9' }}>
                      <p className="text-[10px] font-semibold text-[#ADADAD] uppercase tracking-widest mb-1.5">Messages from this sender</p>
                      <p className="text-[26px] font-extrabold text-[#0D0D0D]">
                        {loadingInsights ? '—' : senderCount !== null ? senderCount : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Map */}
                  {mapUrl ? (
                    <div className="w-full rounded-[22px] overflow-hidden mb-5" style={{ height: 170 }}>
                      <iframe src={mapUrl} className="w-full h-full border-0" title="Approximate sender location" />
                    </div>
                  ) : (
                    <div className="w-full rounded-[22px] mb-5 flex items-center justify-center border border-[#EBEBEB]" style={{ height: 80 }}>
                      <p className="text-[13px] text-[#ADADAD]">Location map not available</p>
                    </div>
                  )}

                  <button onClick={startConversation} className="w-full py-[15px] rounded-full bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform">
                    Start a conversation
                  </button>
                </div>
              )}

              {/* ── Conversation thread ── */}
              {showConv && (
                <div className="flex flex-col h-full slide-from-right">
                  <div className="px-5 pt-2 pb-3 border-b border-[#F0F0F0] flex-shrink-0">
                    <button onClick={() => setShowConv(false)} className="flex items-center gap-1.5 text-[#ADADAD] text-[13px] py-1 active:opacity-60 mb-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Back
                    </button>
                    <p className="text-[16px] font-bold text-[#0D0D0D]">Anonymous sender</p>
                    <p className="text-[11px] text-[#ADADAD]">They'll see your messages if they sign up</p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5" style={{ minHeight: 200 }}>
                    {convMsgs.length === 0 && (
                      <p className="text-[14px] text-[#ADADAD] text-center mt-8">Start the conversation</p>
                    )}
                    {convMsgs.map(m => (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[78%] px-4 py-3 rounded-[18px] rounded-br-[6px]" style={{ background: '#0D0D0D' }}>
                          <p className="text-white text-[15px] leading-snug">{m.content}</p>
                          <p className="text-white/40 text-[10px] mt-1 text-right">{timeAgo(m.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={convBottomRef} />
                  </div>
                  <div className="px-4 pb-6 pt-2 border-t border-[#F0F0F0] flex gap-2 flex-shrink-0">
                    <input
                      value={convInput} onChange={e => setConvInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendConvMsg() } }}
                      placeholder="Message…" maxLength={500}
                      className="flex-1 rounded-full bg-[#F5F5F5] px-4 py-3 text-[15px] text-[#0D0D0D] outline-none"
                    />
                    <button onClick={sendConvMsg} disabled={!convInput.trim() || convSending} className="w-10 h-10 rounded-full bg-[#0D0D0D] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 flex-shrink-0">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom buttons — main view only */}
            {!showInsights && !showConv && !showReply && (
              <div className="px-5 pb-8 pt-2.5 flex gap-3 border-t border-[#F0F0F0] flex-shrink-0">
                <button onClick={() => setShowReply(true)} className="flex-1 py-[15px] rounded-full bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform">Reply</button>
                <button onClick={handleShare} className="flex-1 py-[15px] rounded-full font-bold text-[15px] active:scale-95 transition-transform" style={{ background: '#F2F2F2', color: '#0D0D0D' }}>Share</button>
              </div>
            )}
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Fullscreen image viewer ── */}
      {showFullscreen && imageUrl && portalTarget && createPortal(
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 pt-12 pb-4">
            <button onClick={() => setShowFullscreen(false)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.14)' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <img src="/assets/TBH_Title_Logo.svg" alt="TBH" className="h-6 invert" />
            <div className="w-10" />
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" style={{ touchAction: 'pinch-zoom' }} />
          </div>
          {textContent && (
            <div className="px-5 pb-10">
              <div className="rounded-[20px] px-5 py-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p className="text-white text-center text-[16px] font-medium">{textContent}</p>
              </div>
            </div>
          )}
        </div>,
        portalTarget
      )}
    </>
  )
}
