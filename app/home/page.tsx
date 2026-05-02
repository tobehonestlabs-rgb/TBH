'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import SharePage from '@/app/components/SharePage'
import MessagesPage from '@/app/components/MessagesPages'
import ChatPage from '@/app/components/ChatPage'
import NotificationSetup from '@/app/components/NotificationSetup'


export type UserProfile = {
  user_id: string
  username: string | null
  slug: string | null
  pfp: string | null
  birthdate: number | null
}
 
export default function HomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [hasUnread, setHasUnread] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
 
  const tabs = ['Share', 'Messages', 'Chat']
 
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) { router.push('/'); return }
 
      const { data } = await supabaseClient
        .from('users_table')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
 
      if (!data) { router.push('/onboarding'); return }
      setProfile(data)
 
      // Check unread messages
      const { data: msgs } = await supabaseClient
        .from('messages')
        .select('isOpened')
        .eq('to_user', session.user.id)
        .eq('isOpened', false)
 
      setHasUnread((msgs?.length ?? 0) > 0)
    }
 
    loadProfile()
  }, [router])
 
  // Swipe gesture support
  const touchStartX = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      if (diff > 0 && activeTab < 2) switchTab(activeTab + 1)
      if (diff < 0 && activeTab > 0) switchTab(activeTab - 1)
    }
  }

  const switchTab = (index: number) => {
    setActiveTab(index)
  }
 
  return (
    <main
      className="min-h-screen bg-white flex flex-col overflow-hidden"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <NotificationSetup />

      {/* ── Blurred header — shows all three tabs at once ── */}
      <div
        className="sticky top-0 z-20 border-b border-black/[0.06]"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">

          {/* Tab names — equal-width, all visible */}
          <div className="flex flex-1 relative pb-[10px]">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => switchTab(i)}
                className="flex-1 text-center py-0.5 relative active:opacity-50 transition-opacity"
              >
                <span
                  className="transition-all duration-200"
                  style={{
                    fontSize: '16px',
                    fontWeight: activeTab === i ? 800 : 500,
                    color: activeTab === i ? '#0D0D0D' : '#ADADAD',
                    letterSpacing: activeTab === i ? '-0.4px' : '-0.2px',
                  }}
                >
                  {tab}
                </span>
                {i === 1 && hasUnread && (
                  <div
                    className="absolute top-0 w-[7px] h-[7px] bg-red-500 rounded-full"
                    style={{ right: 'calc(50% - 20px)' }}
                  />
                )}
              </button>
            ))}

            {/* Sliding underline */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#EBEBEB] rounded-full">
              <div
                className="absolute top-0 h-full rounded-full bg-[#0D0D0D] transition-all duration-300 ease-in-out"
                style={{ width: '33.33%', left: `${activeTab * 33.33}%` }}
              />
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => window.location.reload()}
            className="w-9 h-9 rounded-full border border-[#E8E8E8] flex items-center justify-center active:scale-90 active:bg-[#F2F2F2] transition-all flex-shrink-0"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M1 4v6h6" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      </div>
 
      {/* ── Swipeable Pages ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${activeTab * 33.33}%)`, width: '300%' }}
        >
          <div className="relative overflow-hidden" style={{ width: '33.333%', flexShrink: 0, height: '100%' }}>
            <div className="h-full overflow-y-auto">
              <SharePage profile={profile} />
            </div>
          </div>
          <div className="relative overflow-hidden" style={{ width: '33.333%', flexShrink: 0, height: '100%' }}>
            <div className="h-full overflow-y-auto">
              <MessagesPage onUnreadChange={setHasUnread} />
            </div>
          </div>
          <div className="relative overflow-hidden" style={{ width: '33.333%', flexShrink: 0, height: '100%' }}>
            <div className="h-full overflow-y-auto">
              <ChatPage/>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
 