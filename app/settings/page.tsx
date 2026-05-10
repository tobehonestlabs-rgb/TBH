'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function SettingsPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [pfp, setPfp] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data } = await supabaseClient
        .from('users_table')
        .select('username, pfp, slug')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (data) {
        setUsername(data.username ?? '')
        setPfp(data.pfp ?? null)
        setSlug(data.slug ?? null)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'POST' })
      if (!res.ok) { setDeleting(false); return }
      await supabaseClient.auth.signOut()
      router.push('/')
    } catch { setDeleting(false) }
  }

  const font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

  return (
    <main
      className="min-h-screen bg-[#F5F5F7] flex flex-col"
      style={{ fontFamily: font }}
    >
      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-10 flex items-center px-5 pt-14 pb-3"
        style={{ background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform mr-3"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#0D0D0D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[22px] font-extrabold text-[#0D0D0D] tracking-tight">Settings</h1>
      </div>

      <div className="flex flex-col px-5 gap-7 pb-16 pt-2">

        {/* ── Hero profile card ── */}
        <div className="rounded-[24px] overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 60%, #2A1A1F 100%)' }}>
          <div
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.18), transparent 70%)' }}
          />
          <div className="relative p-5 flex items-center gap-4">
            {loading ? (
              <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
            ) : (
              <div
                className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
                style={{
                  border: '2.5px solid transparent',
                  background: 'linear-gradient(#1A1A1A,#1A1A1A) padding-box, linear-gradient(135deg, #FF6B6B, #FFE66D, #4D96FF) border-box',
                }}
              >
                {pfp
                  ? <img src={pfp} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white/60 text-2xl font-bold">
                      {username[0]?.toUpperCase() ?? '?'}
                    </div>
                }
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-white truncate">@{username || '...'}</p>
              {slug && (
                <p className="text-[12px] text-white/40 truncate mt-0.5">tbhonest.net/send/{slug}</p>
              )}
            </div>
            <button
              onClick={() => router.push('/edit')}
              className="px-4 py-2 rounded-full bg-white text-[#0D0D0D] text-[13px] font-bold active:scale-95 transition-transform flex-shrink-0"
            >
              Edit
            </button>
          </div>
        </div>

        {/* ── Account section ── */}
        <Section label="Account">
          <SettingsRow
            icon={
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M12 20h9" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            label="Edit profile"
            sublabel="Change your username and photo"
            onClick={() => router.push('/edit')}
          />
        </Section>

        {/* ── Resources section ── */}
        <Section label="Resources">
          <SettingsRow
            icon={
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#0D0D0D" strokeWidth="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
            label="How to share"
            sublabel="Learn how to post your link"
            onClick={() => router.push('/guide')}
            divider
          />
          <SettingsRow
            icon={<img src="/assets/social_media_icons/X.svg" className="w-[18px] h-[18px] object-contain" alt="" />}
            label="Follow us on X"
            sublabel="@tbh_studio"
            onClick={() => window.open('https://x.com/tbh_studio', '_blank')}
            external
          />
        </Section>

        {/* ── Danger section ── */}
        <Section>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-[#FFF5F5] transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#FFF0F0] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11v6M14 11v6" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-[#FF3B30]">Delete account</span>
          </button>
        </Section>

        <p className="text-center text-[11px] text-[#BBB] tracking-wide">TBH · v1.0.0</p>
      </div>

      {/* ── Delete account confirm sheet ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 backdrop-enter"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />
          <div className="relative sheet-enter bg-white rounded-t-[28px] z-10 pb-10 px-5 pt-3">
            <div className="flex justify-center mb-5">
              <div className="w-10 h-1 rounded-full bg-[#DDD]" />
            </div>
            <div className="w-12 h-12 rounded-full bg-[#FFF0F0] flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M12 9v4M12 17h.01" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[22px] font-extrabold text-[#0D0D0D] text-center mb-1">Delete account?</p>
            <p className="text-[14px] text-[#888] text-center mb-6 leading-relaxed">
              This will permanently delete your profile, messages, and all your data. This cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full py-4 rounded-[16px] bg-[#FF3B30] text-white font-bold text-[16px] active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting…</>
                  : 'Yes, delete everything'
                }
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="w-full py-4 rounded-[16px] bg-[#F2F2F7] text-[#0D0D0D] font-semibold text-[16px] active:scale-95 transition-transform disabled:opacity-40"
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

function Section({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wider px-1 mb-2">{label}</p>
      )}
      <div className="bg-white rounded-[18px] overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        {children}
      </div>
    </div>
  )
}

function SettingsRow({
  icon, label, sublabel, onClick, divider = false, external = false,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick: () => void
  divider?: boolean
  external?: boolean
}) {
  return (
    <>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-[#F5F5F7] transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-[10px] bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#0D0D0D] leading-tight">{label}</p>
          {sublabel && <p className="text-[12px] text-[#888] mt-0.5">{sublabel}</p>}
        </div>
        {external ? (
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M7 17L17 7M17 7H8M17 7v9" stroke="#CCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" stroke="#CCC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      {divider && <div className="h-[1px] bg-[#F0F0F0] mx-4" />}
    </>
  )
}
