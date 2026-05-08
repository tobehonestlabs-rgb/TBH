'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type Conversation = {
  id: string
  created_at: string
  last_message_at: string | null
  last_message: string | null
  original_message_id: string | null
}

type ConvMsg = { id: string; sender_id: string; content: string; created_at: string }

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
  const [convs, setConvs]     = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [msgs, setMsgs]       = useState<ConvMsg[]>([])
  const [input, setInput]     = useState('')
  const [sending, setSending] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setPortalTarget(document.getElementById('app-shell')) }, [])

  useEffect(() => {
    fetch('/api/conversations')
      .then(r => r.json())
      .then(d => { setConvs(d.conversations ?? []); setMyUserId(d.userId ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openConv = async (conv: Conversation) => {
    setSelected(conv)
    const r = await fetch(`/api/conversations/${conv.id}/messages`)
    const d = await r.json()
    setMsgs(d.messages ?? [])
    setTimeout(() => bottomRef.current?.scrollIntoView(), 50)
  }

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
        setMsgs(prev => [...prev, message])
        setConvs(prev => prev.map(c => c.id === selected.id ? { ...c, last_message: text, last_message_at: new Date().toISOString() } : c))
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch {}
    setSending(false)
  }

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
        <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[28px]">💬</div>
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
        {convs.map(conv => (
          <button
            key={conv.id}
            onClick={() => openConv(conv)}
            className="w-full text-left mx-4 my-[5px] rounded-[20px] bg-white active:scale-[0.97] transition-transform"
            style={{ width: 'calc(100% - 32px)', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
          >
            <div className="flex items-center gap-3 p-[14px]">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-[20px]" style={{ background: '#F5F5F5' }}>
                🕵️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#0D0D0D]">Anonymous sender</p>
                <p className="text-[12px] text-[#ADADAD] truncate">{conv.last_message ?? 'No messages yet'}</p>
              </div>
              {conv.last_message_at && <p className="text-[11px] text-[#CCC] flex-shrink-0">{timeAgo(conv.last_message_at)}</p>}
            </div>
          </button>
        ))}
      </div>

      {/* Conversation thread — portaled to escape slide transform */}
      {selected && portalTarget && createPortal(
        <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ borderRadius: '28px 28px 0 0' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-[#F0F0F0]">
            <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition-transform">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-[#0D0D0D]">Anonymous sender</p>
              <p className="text-[11px] text-[#ADADAD]">They'll see this if they sign up</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {msgs.length === 0 && (
              <div className="flex-1 flex items-center justify-center pt-20">
                <p className="text-[14px] text-[#ADADAD]">Send the first message</p>
              </div>
            )}
            {msgs.map(m => (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[75%] px-4 py-3 rounded-[18px] rounded-br-[6px]" style={{ background: '#0D0D0D' }}>
                  <p className="text-white text-[15px] leading-snug">{m.content}</p>
                  <p className="text-white/40 text-[10px] mt-1 text-right">{timeAgo(m.created_at)}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-8 pt-2 border-t border-[#F0F0F0] flex gap-2">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
              placeholder="Message…" maxLength={500}
              className="flex-1 rounded-full bg-[#F5F5F5] px-4 py-3 text-[15px] text-[#0D0D0D] outline-none"
            />
            <button onClick={send} disabled={!input.trim() || sending} className="w-10 h-10 rounded-full bg-[#0D0D0D] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 flex-shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
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
