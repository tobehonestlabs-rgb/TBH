'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function SettingsPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [pfp, setPfp] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data } = await supabaseClient
        .from('users_table')
        .select('username, pfp')
        .eq('user_id', session.user.id)
        .single()

      if (data) {
        setUsername(data.username ?? '')
        setPfp(data.pfp ?? null)
      }
    }
    load()
  }, [router])

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/')
  }

  const font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

  return (
    <main
      className="min-h-screen bg-[#F2F2F7] flex flex-col"
      style={{ fontFamily: font }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center px-5 pt-14 pb-4 bg-[#F2F2F7]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform mr-4 shadow-sm"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[20px] font-bold text-[#0D0D0D]">Settings</h1>
      </div>

      <div className="flex flex-col px-5 gap-6 pb-16">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#EEE] flex-shrink-0"
            style={{ border: '2.5px solid transparent', background: 'linear-gradient(white,white) padding-box, linear-gradient(135deg,#FF6B6B,#4D96FF) border-box' }}
          >
            {pfp
              ? <img src={pfp} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[#AAA] text-2xl font-bold bg-[#EEE]">
                  {username[0]?.toUpperCase() ?? '?'}
                </div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-bold text-[#0D0D0D] truncate">@{username}</p>
            <p className="text-[13px] text-[#888]">TBH Member</p>
          </div>
          <button
            onClick={() => router.push('/edit')}
            className="px-4 py-2 rounded-[12px] bg-[#0D0D0D] text-white text-[13px] font-semibold active:scale-95 transition-transform"
          >
            Edit
          </button>
        </div>

        {/* ── Account section ── */}
        <div>
          <p className="text-[12px] font-semibold text-[#888] uppercase tracking-wider px-1 mb-2">Account</p>
          <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
            <SettingsRow
              icon={
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              }
              label="Edit Profile"
              sublabel="Change username or photo"
              onClick={() => router.push('/edit')}
            />
          </div>
        </div>

        {/* ── Community section ── */}
        <div>
          <p className="text-[12px] font-semibold text-[#888] uppercase tracking-wider px-1 mb-2">Community</p>
          <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
           
           
          </div>
        </div>

        {/* ── Social section ── */}
        <div>
          <p className="text-[12px] font-semibold text-[#888] uppercase tracking-wider px-1 mb-2">Follow Us</p>
          <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
            <SettingsRow
              icon={<img src="/assets/social_media_icons/X.svg" className="w-5 h-5 object-contain" />}
              label="X"
              sublabel="@tbhonest"
              onClick={() => window.open('https://instagram.com/tbhonest', '_blank')}
              divider
            />
          </div>
        </div>

        {/* ── Danger section ── */}
        <div>
          <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-4 px-4 py-4 active:bg-[#FFF5F5] transition-colors"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#FFF0F0] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16 17 21 12 16 7" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[16px] font-semibold text-[#FF3B30]">Log out</span>
            </button>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-[12px] text-[#BBBBBB]">TBH v1.0.0 — Made with ❤️</p>
      </div>

      {/* ── Logout confirm sheet ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-t-[28px] z-10 pb-10 px-5 pt-6">
            <div className="flex justify-center mb-5">
              <div className="w-10 h-[4px] rounded-full bg-[#DDD]" />
            </div>
            <p className="text-[20px] font-bold text-[#0D0D0D] text-center mb-2">Log out?</p>
            <p className="text-[14px] text-[#888] text-center mb-6">You'll need to sign in again to access your messages.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-[16px] bg-[#FF3B30] text-white font-bold text-[16px] active:scale-95 transition-transform"
              >
                Yes, log out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 rounded-[16px] bg-[#F2F2F7] text-[#0D0D0D] font-semibold text-[16px] active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

// ── Reusable row component ────────────────────────────────────────────────────
function SettingsRow({
  icon, label, sublabel, onClick, divider = false
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick: () => void
  divider?: boolean
}) {
  return (
    <>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-4 active:bg-[#F5F5F5] transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-[10px] bg-[#F2F2F7] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#0D0D0D]">{label}</p>
          {sublabel && <p className="text-[12px] text-[#888]">{sublabel}</p>}
        </div>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" stroke="#CCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {divider && <div className="h-[1px] bg-[#F0F0F0] mx-4" />}
    </>
  )
}