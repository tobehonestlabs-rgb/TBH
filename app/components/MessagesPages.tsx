'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    return 'now'
  } catch { return 'now' }
}

export default function MessagesPage({ onUnreadChange }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;
    let channelInstance: ReturnType<typeof supabaseClient.channel> | null = null;

    const setup = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session || !mounted) return;

      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('to_user', session.user.id)
        .order('created_at', { ascending: false });

      if (mounted) {
        if (error) {
          console.error("Error fetching messages:", error);
        } else if (data) {
          setMessages(data);
          onUnreadChange(data.some(m => !m.isOpened));
        }
        setLoading(false);
      }

      const channelName = `messages-inbox-${session.user.id}`;
      channelInstance = supabaseClient.channel(channelName);

      channelInstance
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_user=eq.${session.user.id}`,
        }, (payload) => {
          if (mounted) {
            setMessages(prev => [payload.new as Message, ...prev]);
            onUnreadChange(true);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && !mounted && channelInstance) {
            supabaseClient.removeChannel(channelInstance);
          }
        });
    };

    setup();

    return () => {
      mounted = false;
      if (channelInstance) {
        const isConnected = supabaseClient.realtime.isConnected();
        if (isConnected) {
          supabaseClient.removeChannel(channelInstance).catch(() => {});
        }
      }
    };
  }, [onUnreadChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMessageClick = async (msg: Message) => {
    if (!msg.isOpened) {
      await supabaseClient
        .from('messages')
        .update({ isOpened: true })
        .eq('message_id', msg.message_id)
      setMessages(prev =>
        prev.map(m => m.message_id === msg.message_id ? { ...m, isOpened: true } : m)
      )
    }
    router.push(`/message/${msg.message_id}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-[76px] rounded-[20px] bg-[#F5F5F5] animate-pulse" />
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-24 gap-3">
        <span className="text-5xl">📩</span>
        <p className="text-[18px] font-bold text-[#888]">No messages yet</p>
        <p className="text-[13px] text-[#AAA]">Share your link to receive some!</p>
      </div>
    )
  }

  return (
    // ── CHANGE 1: contained scrollable box, transparent scrollbar ──
    <div className="relative flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div
        className="flex-1 overflow-y-auto pt-2 pb-28"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {messages.map(msg => {
          const isImage = msg.content?.startsWith('[IMAGE](')
          const imageUrl = isImage
            ? msg.content.match(/\[IMAGE\]\(([^)]+)\)/)?.[1] ?? null
            : null
          const preview = isImage
            ? msg.content.substring(msg.content.indexOf(')') + 2)
            : msg.content ?? ''

          return (
            <button
              key={msg.message_id}
              onClick={() => handleMessageClick(msg)}
              className="relative w-full text-left mx-4 my-[5px] rounded-[20px] bg-white active:scale-[0.97] transition-transform"
              style={{
                width: 'calc(100% - 32px)',
                boxShadow: msg.isOpened
                  ? '0 2px 8px rgba(0,0,0,0.06)'
                  : '0 6px 20px rgba(0,0,0,0.10)',
              }}
            >
              <div className="flex items-center gap-3 p-[14px]">

                {/* Left icon — CHANGE 2: gradient bg for unread, SVG icon */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: msg.isOpened
                      ? '#E5E5E5'
                      : 'linear-gradient(135deg, #FF6B6B, #4D96FF)',
                  }}
                >
                  <img
                    src="/assets/Love_Letter.svg"
                    className="w-6 h-6 object-contain"
                    style={{ filter: msg.isOpened ? 'none' : 'brightness(0) invert(1)' }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {!msg.isOpened ? (
                    <>
                      <p className="text-[16px] font-bold" style={{
                        background: 'linear-gradient(90deg, #FF6B6B, #4D96FF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>New message</p>
                      <p className="text-[12px] text-[#888]">
                        {isImage ? '📷 Photo' : 'Tap to read'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-medium text-[#0D0D0D] truncate">{preview}</p>
                      <p className="text-[11px] text-[#AAA]">{timeAgo(msg.created_at)}</p>
                    </>
                  )}
                </div>

                {/* Right: image thumb or chevron */}
                {isImage && imageUrl ? (
                  <div className="w-[52px] h-[52px] rounded-[12px] overflow-hidden bg-[#EEE] flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ filter: msg.isOpened ? 'none' : 'blur(10px)' }}
                    />
                  </div>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" stroke="#CCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {/* CHANGE 3: accent bar removed — was causing the rainbow line */}
            </button>
          )
        })}
      </div>

      {/* Reveal CTA — pinned at bottom */}
      
    </div>
  )
}