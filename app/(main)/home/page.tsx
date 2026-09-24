'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import { apiFetch } from '@/lib/api'
import SharePage from '@/app/components/SharePage'
import MessagesPage from '@/app/components/MessagesPages'
import ChatPage from '@/app/components/ChatPage'
import NotificationSetup from '@/app/components/NotificationSetup'
import { UserProfile } from '@/types'
import { useTranslation } from '@/lib/i18n'
 
export default function HomePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [hasUnread, setHasUnread] = useState(false)
  const [hasUnreadChat, setHasUnreadChat] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
 
  const tabs = [t.tabPlay || 'Partager', t.tabMessages || 'Messages', t.tabChat || 'Chat']
 
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) { router.push('/'); return }
 
      const { data } = await supabaseClient
        .from('users_table')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()
 
      if (!data) { router.push('/onboarding'); return }
      setProfile(data)

      // Register user's IP for sender identification
      apiFetch('/api/user/register-ip', { method: 'POST' }).catch(() => {})
 
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
      className="h-full bg-white flex flex-col overflow-hidden"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <NotificationSetup />

      {/* ── Blurred header — shows all three tabs at once ── */}
      {/* ── Top Bar with Tabs ── */}
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center px-4 pt-12 pb-3">

          {/* Tab names — equal-width, all visible */}
          <div className="flex flex-1 relative items-center">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => switchTab(i)}
                className="flex-1 text-center py-1 relative active:opacity-50 transition-opacity"
              >
                <span
                  className="transition-all duration-200"
                  style={{
                    fontSize: '16px',
                    fontWeight: activeTab === i ? 800 : 500,
                    color: activeTab === i ? '#0D0D0D' : '#8E8E93',
                    letterSpacing: activeTab === i ? '-0.4px' : '-0.2px',
                  }}
                >
                  {tab}
                </span>
                {i === 1 && hasUnread && (
                  <div
                    className="absolute top-1 w-[7px] h-[7px] bg-red-500 rounded-full"
                    style={{ right: 'calc(50% - 20px)' }}
                  />
                )}
                {i === 2 && hasUnreadChat && (
                  <div
                    className="absolute top-1 w-[7px] h-[7px] bg-red-500 rounded-full"
                    style={{ right: 'calc(50% - 16px)' }}
                  />
                )}
              </button>
            ))}
          </div>

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
              <MessagesPage onUnreadChange={setHasUnread} isActive={activeTab === 1} profile={profile} />
            </div>
          </div>
          <div className="relative overflow-hidden" style={{ width: '33.333%', flexShrink: 0, height: '100%' }}>
            <div className="h-full overflow-y-auto">
              <ChatPage onUnreadChange={setHasUnreadChat} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
 