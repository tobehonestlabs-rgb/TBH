'use client'
 
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import SharePage from '@/app/components/SharePage'
import MessagesPage from '@/app/components/MessagesPages'
import ChatPage from '@/app/components/ChatPage'
import ShareModal from '@/app/components/ShareModal'
 
 
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
  const [showHelpModal, setShowHelpModal] = useState(false)
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
      if (diff > 0 && activeTab < 2) setActiveTab(activeTab + 1)
      if (diff < 0 && activeTab > 0) setActiveTab(activeTab - 1)
    }
  }
 
  const tabLabel = tabs[activeTab]
 
  return (
    <main
      className="min-h-screen bg-white flex flex-col overflow-hidden"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      
      <div className="flex items-center justify-start px-4 pt-12 pb-3 bg-white sticky top-0 z-20">
 
        {/* Left: spacer */}
        <div className="flex-1 flex justify-start">
          <div className="w-9 h-9" />
        </div>
 
        {/* Center: label + indicator — clickable to cycle tabs */}
        <div
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => setActiveTab((activeTab + 1) % 3)}
        >
          <span className="text-[26px] font-extrabold text-[#0D0D0D] tracking-tight">
            {tabLabel}
          </span>
          <div className="relative w-[170px] h-[14px] bg-[#E0E0E0] rounded-full overflow-hidden">
            <div
              className="absolute top-0 h-full bg-[#0D0D0D] rounded-full transition-all duration-300 ease-in-out"
              style={{ width: '33.33%', left: `${activeTab * 33.33}%` }}
            />
            {hasUnread && (
              <div
                className="absolute top-[-2px] w-[10px] h-[10px] bg-red-500 rounded-full z-10"
                style={{ left: `calc(33.33% + 2px)` }}
              />
            )}
          </div>
        </div>
 
        {/* Right: refresh button */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => window.location.reload()}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition-transform"
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
              <SharePage profile={profile} onShowHelp={() => setShowHelpModal(true)} />
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
 
      {/* ── ShareModal — rendered at root level so it centers over the full viewport ── */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setShowHelpModal(false)}
        >
          {/* Stop click propagation so tapping the modal itself doesn't close it */}
          <div onClick={e => e.stopPropagation()}>
            <ShareModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
          </div>
        </div>
      )}
 
    </main>
  )
}
 
