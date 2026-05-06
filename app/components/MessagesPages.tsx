'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabaseClient'

type Message = {
  message_id: string
  content: string
  media_url: string
  isOpened: boolean
  created_at: string
  contains_media: boolean
}

type Props = { onUnreadChange: (hasUnread: boolean) => void }

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

export default function MessagesPage({ onUnreadChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
  const [sheetClosing, setSheetClosing] = useState(false)
  const [imageBlurred, setImageBlurred] = useState(true)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')

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
    setImageBlurred(true)
    setShowReply(false)
    setReplyText('')
  }

  const closeSheet = () => {
    setSheetClosing(true)
    setTimeout(() => { setSelectedMsg(null); setSheetClosing(false); setShowReply(false); setReplyText('') }, 300)
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

  const isImage = selectedMsg ? (selectedMsg.contains_media || !!selectedMsg.media_url) : false
  const imageUrl = selectedMsg?.media_url || null

  return (
    <>
      {/* ── Message list ── */}
      <div className="flex flex-col pt-2 pb-10">
        {messages.map(msg => {
          const hasImage = msg.contains_media || !!msg.media_url
          const preview = msg.content ?? ''
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

      {/* ── Message sheet ── */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 ${sheetClosing ? 'backdrop-exit' : 'backdrop-enter'}`}
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={closeSheet}
          />

          {/* Sheet panel */}
          <div
            className={`relative ${sheetClosing ? 'sheet-exit' : 'sheet-enter'} rounded-t-[32px] bg-white z-10`}
            style={{ boxShadow: '0 -8px 48px rgba(0,0,0,0.18), 0 -1px 0 rgba(0,0,0,0.04)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E0E0E0]" />
            </div>

            {/* Top bar: Report + Close */}
            <div className="flex items-center justify-between px-5 py-2">
              <button
                onClick={handleReport}
                className="text-[#FF3B30] text-[13px] font-semibold active:opacity-60 transition-opacity"
              >
                Report
              </button>
              <button
                onClick={closeSheet}
                className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition-transform"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Message content */}
            <div className="px-5 pt-2 pb-4">
              {!showReply ? (
                <>
                  {/* Message bubble */}
                  <div
                    className="w-full rounded-[24px] p-5 mb-3"
                    style={{ background: '#F7F7F9' }}
                  >
                    {isImage && imageUrl && (
                      <div className="mb-4">
                        <div className="relative w-full rounded-[16px] overflow-hidden bg-[#EEE]" style={{ aspectRatio: '4/3' }}>
                          <img src={imageUrl} alt="" className="w-full h-full object-cover" style={{ filter: imageBlurred ? 'blur(16px)' : 'none', transition: 'filter 0.3s ease' }} />
                          {imageBlurred && (
                            <button
                              onClick={() => setImageBlurred(false)}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <div className="bg-black/60 rounded-full px-4 py-2">
                                <span className="text-white text-[13px] font-semibold">Tap to reveal</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedMsg.content ? (
                      <p
                        className="text-[#0D0D0D] font-semibold text-center leading-snug"
                        style={{ fontSize: selectedMsg.content.length > 100 ? '18px' : selectedMsg.content.length > 50 ? '22px' : '26px' }}
                      >
                        {selectedMsg.content}
                      </p>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-[#ADADAD] text-center mb-4">{timeAgo(selectedMsg.created_at)}</p>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReply(true)}
                      className="flex-1 py-[15px] rounded-[16px] bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform"
                    >
                      Reply
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 py-[15px] rounded-[16px] font-bold text-[15px] active:scale-95 transition-transform"
                      style={{ background: '#F2F2F2', color: '#0D0D0D' }}
                    >
                      Share
                    </button>
                  </div>
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

                  {/* Their message, compact */}
                  <div className="w-full rounded-[16px] px-4 py-3 mb-3" style={{ background: '#F7F7F9' }}>
                    <p className="text-[#555] text-[14px] leading-snug line-clamp-2">{selectedMsg.content}</p>
                  </div>

                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    autoFocus
                    rows={3}
                    className="w-full rounded-[16px] bg-[#F7F7F9] px-4 py-3 text-[16px] text-[#0D0D0D] outline-none resize-none mb-3"
                    style={{ fontFamily: 'inherit' }}
                  />

                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="w-full py-[15px] rounded-[16px] bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform disabled:opacity-40"
                  >
                    Send Reply
                  </button>
                </>
              )}
            </div>

            {/* Safe area padding */}
            <div className="h-6" />
          </div>
        </div>
      )}
    </>
  )
}
