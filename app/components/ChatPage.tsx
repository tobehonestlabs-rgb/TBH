'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'

type Conversation = {
  id: string
  created_at: string
  last_message_at: string | null
  last_message: string | null
  original_message_id: string | null
  participant_1: string | null
  participant_2: string | null
}

type ConvMsg = {
  id: string
  sender_id: string
  content: string
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

export default function ChatPage() {
  const [convs, setConvs]       = useState<Conversation[]>([])
  const [loading, setLoading]   = useState(true)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [msgs, setMsgs]         = useState<ConvMsg[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const channelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null)

  useEffect(() => { setPortalTarget(document.getElementById('app-shell')) }, [])

  useEffect(() => {
    fetch('/api/conversations')
      .then(r => r.json())
      .then(d => { setConvs(d.conversations ?? []); setMyUserId(d.userId ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openConv = async (conv: Conversation) => {
    // Tear down previous subscription
    if (channelRef.current) { supabaseClient.removeChannel(channelRef.current).catch(() => {}); channelRef.current = null }

    setSelected(conv); setMsgs([])

    const r = await fetch(`/api/conversations/${conv.id}/messages`)
    const d = await r.json()
    const loaded: ConvMsg[] = d.messages ?? []
    setMsgs(loaded)
    setTimeout(() => bottomRef.current?.scrollIntoView(), 50)

    // Mark incoming messages as read
    fetch(`/api/conversations/${conv.id}/read`, { method: 'POST' }).catch(() => {})

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
          return [...prev, newMsg]
        })
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        // Auto-mark as read if it's from the other side
        setMyUserId(uid => {
          if (uid && newMsg.sender_id !== uid) {
            fetch(`/api/conversations/${conv.id}/read`, { method: 'POST' }).catch(() => {})
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
  }

  const closeConv = () => {
    if (channelRef.current) { supabaseClient.removeChannel(channelRef.current).catch(() => {}); channelRef.current = null }
    setSelected(null); setMsgs([])
  }

  useEffect(() => () => {
    if (channelRef.current) supabaseClient.removeChannel(channelRef.current).catch(() => {})
  }, [])

  const send = async () => {
    if (!input.trim() || !selected || sending) return
    setSending(true)
    const text = input.trim(); setInput('')
    try {
      const r = await fetch(`/api/conversations/${selected.id}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const { message } = await r.json()
      if (message) {
        setMsgs(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
        setConvs(prev => prev.map(c => c.id === selected.id
          ? { ...c, last_message: text, last_message_at: new Date().toISOString() }
          : c))
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch {}
    setSending(false)
  }

  // Last sent message that's been read
  const lastReadSentId = [...msgs].reverse().find(m => m.sender_id === myUserId && m.is_read)?.id

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-3">
        {[1, 2].map(i => <div key={i} className="h-[72px] rounded-[20px] bg-[#F5F5F5] animate-pulse" />)}
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
        <p className="text-[18px] font-bold text-[#0D0D0D]">No conversations yet</p>
        <p className="text-[14px] text-[#888] leading-relaxed max-w-[260px]">
          Open a message and tap "Start a conversation" to reply privately
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col pt-2 pb-10">
        {convs.map(conv => {
          const isParticipant2 = conv.participant_2 === myUserId
          return (
            <button
              key={conv.id}
              onClick={() => openConv(conv)}
              className="w-full text-left mx-4 my-[5px] rounded-[20px] bg-white active:scale-[0.97] transition-transform"
              style={{ width: 'calc(100% - 32px)', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            >
              <div className="flex items-center gap-3 p-[14px]">
                <div className="w-11 h-11 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="#888" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#0D0D0D]">
                    {isParticipant2 ? 'Someone started a chat' : 'Anonymous sender'}
                  </p>
                  <p className="text-[12px] text-[#ADADAD] truncate">{conv.last_message ?? 'No messages yet'}</p>
                </div>
                {conv.last_message_at && <p className="text-[11px] text-[#CCC] flex-shrink-0">{timeAgo(conv.last_message_at)}</p>}
              </div>
            </button>
          )
        })}
      </div>

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
              <p className="text-[16px] font-bold text-[#0D0D0D]">Anonymous sender</p>
              <p className="text-[11px] text-[#ADADAD]">End-to-end private conversation</p>
            </div>
            {/* Online indicator */}
            <div className="w-2 h-2 rounded-full bg-[#2AC642] flex-shrink-0" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1.5">
            {msgs.length === 0 && (
              <div className="flex-1 flex items-center justify-center pt-16">
                <p className="text-[14px] text-[#ADADAD] text-center">Send the first message</p>
              </div>
            )}
            {msgs.map((m, i) => {
              const isMine = m.sender_id === myUserId
              const isLastMine = isMine && msgs.slice(i + 1).every(n => n.sender_id !== myUserId)
              return (
                <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div
                    className="max-w-[78%] px-4 py-3"
                    style={{
                      background: isMine ? '#0D0D0D' : '#F2F2F2',
                      borderRadius: isMine ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                    }}
                  >
                    <p style={{ color: isMine ? '#FFFFFF' : '#0D0D0D', fontSize: '15px', lineHeight: '1.4' }}>{m.content}</p>
                  </div>
                  {/* Time + read receipt under last message from this sender */}
                  {(isLastMine || (i === msgs.length - 1 && !isMine)) && (
                    <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-[#C8C8C8]">{timeAgo(m.created_at)}</span>
                      {isMine && m.id === lastReadSentId && (
                        <span className="text-[10px] text-[#2AC642] font-medium">Read</span>
                      )}
                      {isMine && m.id !== lastReadSentId && isLastMine && (
                        <span className="text-[10px] text-[#C8C8C8]">Sent</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-8 pt-3 border-t border-[#F2F2F2] flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
              placeholder="Message…"
              maxLength={500}
              className="flex-1 rounded-full bg-[#F5F5F5] px-4 py-3 text-[15px] text-[#0D0D0D] outline-none"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-full bg-[#0D0D0D] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 flex-shrink-0"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>,
        portalTarget
      )}
    </>
  )
}
