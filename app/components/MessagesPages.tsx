'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'

type Message = {
  message_id: string
  content: string
  media_url: string
  isOpened: boolean
  created_at: string
  contains_media: boolean
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

export default function MessagesPage({ onUnreadChange, isActive }: Props) {
  const [messages, setMessages]       = useState<Message[]>([])
  const [loading, setLoading]         = useState(true)
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
  const [sheetClosing, setSheetClosing] = useState(false)
  const [imageBlurred, setImageBlurred] = useState(true)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showReply, setShowReply]     = useState(false)
  const [replyText, setReplyText]     = useState('')
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalTarget(document.getElementById('app-shell'))
  }, [])

  // Close sheet when navigating away from Messages tab
  useEffect(() => {
    if (!isActive && selectedMsg) {
      setSelectedMsg(null)
      setSheetClosing(false)
      setShowReply(false)
      setReplyText('')
      setShowFullscreen(false)
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let mounted = true
    let channelInstance: ReturnType<typeof supabaseClient.channel> | null = null

    const setup = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session || !mounted) return

      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('to_user', session.user.id)
        .order('created_at', { ascending: false })

      if (mounted) {
        if (!error && data) {
          setMessages(data)
          onUnreadChange(data.some(m => !m.isOpened))
        }
        setLoading(false)
      }

      const channelName = `messages-inbox-${session.user.id}`
      channelInstance = supabaseClient.channel(channelName)
      channelInstance
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user=eq.${session.user.id}` }, (payload) => {
          if (mounted) { setMessages(prev => [payload.new as Message, ...prev]); onUnreadChange(true) }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && !mounted && channelInstance) supabaseClient.removeChannel(channelInstance)
        })
    }

    setup()
    return () => {
      mounted = false
      if (channelInstance) supabaseClient.removeChannel(channelInstance).catch(() => {})
    }
  }, [onUnreadChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const openSheet = async (msg: Message) => {
    if (!msg.isOpened) {
      supabaseClient.from('messages').update({ isOpened: true }).eq('message_id', msg.message_id).then(() => {})
      setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, isOpened: true } : m))
      onUnreadChange(messages.filter(m => !m.isOpened && m.message_id !== msg.message_id).length > 0)
    }
    setSelectedMsg(msg)
    setSheetClosing(false)
    setImageBlurred(true)
    setShowFullscreen(false)
    setShowReply(false)
    setReplyText('')
  }

  const closeSheet = () => {
    setSheetClosing(true)
    setShowFullscreen(false)
    setTimeout(() => {
      setSelectedMsg(null)
      setSheetClosing(false)
      setShowReply(false)
      setReplyText('')
    }, 300)
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
    try {
      if (navigator.share) await navigator.share({ text: replyText.trim() })
    } catch {}
    setShowReply(false)
    setReplyText('')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[76px] rounded-[20px] bg-[#F5F5F5] animate-pulse" />
        ))}
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
  const imageUrl       = selectedMsg?.media_url || null
  const textContent    = selectedMsg?.content   || null

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
              style={{
                width: 'calc(100% - 32px)',
                boxShadow: msg.isOpened ? '0 2px 8px rgba(0,0,0,0.06)' : '0 6px 20px rgba(0,0,0,0.10)',
              }}
            >
              <div className="flex items-center gap-3 p-[14px]">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: msg.isOpened ? '#E5E5E5' : 'linear-gradient(135deg, #cf5454, #ff4da6)' }}
                >
                  <img
                    src={msg.isOpened ? '/assets/Love_Letter.svg' : '/assets/R.svg'}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {!msg.isOpened ? (
                    <>
                      <p className="text-[16px] font-bold" style={{ background: 'linear-gradient(90deg, #FF6B6B, #4D96FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        New message
                      </p>
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
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" stroke="#CCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Full-screen message sheet (portaled to #app-shell to escape slide transform) ── */}
      {selectedMsg && portalTarget && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Full-screen white panel slides up */}
          <div
            className={`flex-1 ${sheetClosing ? 'sheet-exit' : 'sheet-enter'} bg-white flex flex-col overflow-hidden`}
            style={{ borderRadius: '28px 28px 0 0' }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <button
                onClick={handleReport}
                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: '#FFF0EE' }}
                title="Report"
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="4" y1="22" x2="4" y2="15" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              {/* drag pill */}
              <div className="w-10 h-[5px] rounded-full bg-[#E0E0E0]" />
              <button
                onClick={closeSheet}
                className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition-transform"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
              {!showReply ? (
                <>
                  {/* Image row */}
                  {isImageMessage && imageUrl && (
                    <>
                      <button
                        onClick={() => setShowFullscreen(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-[18px] active:scale-[0.98] transition-transform mb-4"
                        style={{ background: '#F7F7F9' }}
                      >
                        {/* Blurred thumbnail */}
                        <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-[#E8E8E8] flex-shrink-0">
                          <img
                            src={imageUrl} alt=""
                            className="w-full h-full object-cover"
                            style={{ filter: imageBlurred ? 'blur(10px)' : 'none', transition: 'filter 0.3s' }}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-[15px] text-[#0D0D0D]">Photo</p>
                          <p className="text-[12px] text-[#ADADAD]">Tap to view fullscreen</p>
                        </div>
                        {/* Blur toggle */}
                        <button
                          onClick={e => { e.stopPropagation(); setImageBlurred(b => !b) }}
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                          style={{ background: imageBlurred ? '#0D0D0D' : '#E8E8E8' }}
                        >
                          {imageBlurred ? (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2"/>
                              <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
                              <line x1="1" y1="1" x2="23" y2="23" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          )}
                        </button>
                      </button>
                      {textContent && <div className="w-full h-[1px] bg-[#F0F0F0] mb-4" />}
                    </>
                  )}

                  {/* Message text */}
                  {textContent && (
                    <div
                      className="w-full rounded-[24px] p-6 mb-4 flex items-center justify-center"
                      style={{ background: '#F7F7F9', minHeight: 120 }}
                    >
                      <p
                        className="text-[#0D0D0D] font-semibold text-center leading-snug"
                        style={{ fontSize: textContent.length > 100 ? '18px' : textContent.length > 50 ? '22px' : '28px' }}
                      >
                        {textContent}
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-[#ADADAD] text-center mb-6">{timeAgo(selectedMsg.created_at)}</p>
                </>
              ) : (
                <>
                  {/* Reply view */}
                  <button
                    onClick={() => setShowReply(false)}
                    className="flex items-center gap-1.5 text-[#888] text-[13px] mb-4 active:opacity-60"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <path d="M19 12H5M12 5l-7 7 7 7" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </button>

                  {textContent && (
                    <div className="w-full rounded-[16px] px-4 py-3 mb-4" style={{ background: '#F7F7F9' }}>
                      <p className="text-[#555] text-[14px] leading-snug line-clamp-3">{textContent}</p>
                    </div>
                  )}

                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    autoFocus
                    rows={4}
                    className="w-full rounded-[16px] bg-[#F7F7F9] px-4 py-3 text-[16px] text-[#0D0D0D] outline-none resize-none mb-4"
                    style={{ fontFamily: 'inherit' }}
                  />

                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="w-full py-[15px] rounded-full bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform disabled:opacity-40"
                  >
                    Send Reply
                  </button>
                </>
              )}
            </div>

            {/* Bottom action buttons (only on main view) */}
            {!showReply && (
              <div className="px-5 pb-8 pt-2 flex gap-3 border-t border-[#F0F0F0]">
                <button
                  onClick={() => setShowReply(true)}
                  className="flex-1 py-[15px] rounded-full bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform"
                >
                  Reply
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-[15px] rounded-full font-bold text-[15px] active:scale-95 transition-transform"
                  style={{ background: '#F2F2F2', color: '#0D0D0D' }}
                >
                  Share
                </button>
              </div>
            )}
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Fullscreen image viewer (also portaled) ── */}
      {showFullscreen && imageUrl && portalTarget && createPortal(
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-12 pb-4">
            <button
              onClick={() => setShowFullscreen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.14)' }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <img src="/assets/TBH_Title_Logo.svg" alt="TBH" className="h-6 invert" />
            <div className="w-10" />
          </div>
          {/* Full image */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={imageUrl} alt=""
              className="max-w-full max-h-full object-contain"
              style={{ touchAction: 'pinch-zoom' }}
            />
          </div>
          {/* Text beneath */}
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
