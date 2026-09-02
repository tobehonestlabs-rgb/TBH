'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [currentPfp, setCurrentPfp] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) { router.push('/'); return }
      setUserId(session.user.id)
      const { data } = await supabaseClient
        .from('users_table')
        .select('username, pfp')
        .eq('user_id', session.user.id)
        .single()
      if (data) {
        setUsername(data.username ?? '')
        setOriginalUsername(data.username ?? '')
        setCurrentPfp(data.pfp ?? null)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (username.trim().length < 2) { setError('Username must be at least 2 characters.'); return }
    setError(null)
    setSaving(true)
    try {
      let pfpUrl = currentPfp
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `${userId}_${Date.now()}_pfp.${ext}`
        const { error: uploadError } = await supabaseClient.storage
          .from('avatars').upload(fileName, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabaseClient.storage.from('avatars').getPublicUrl(fileName)
        pfpUrl = urlData.publicUrl
      }
      const { error: updateError } = await supabaseClient
        .from('users_table')
        .update({ username: username.trim(), ...(pfpUrl !== currentPfp ? { pfp: pfpUrl } : {}) })
        .eq('user_id', userId)
      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => router.push('/home'), 1100)
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = username.trim() !== originalUsername || imageFile !== null
  const canSave = username.trim().length >= 2 && hasChanges && !saving
  const displayPfp = imagePreview ?? currentPfp

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] flex flex-col" style={{ fontFamily: font }}>
      {/* ── Frosted header ── */}
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
        <h1 className="text-[22px] font-extrabold text-[#0D0D0D] tracking-tight">Edit profile</h1>
      </div>

      <div className="flex flex-col px-5 gap-4 pb-16 pt-3">

        {/* ── Dark hero card ── */}
        <div
          className="rounded-[24px] overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 60%, #2A1A1F 100%)' }}
        >
          <div
            className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.15), transparent 70%)' }}
          />
          <div className="relative p-5 flex items-center gap-4">
            {/* Avatar with tap-to-change */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative active:scale-95 transition-transform flex-shrink-0"
            >
              <div
                className="w-[72px] h-[72px] rounded-full overflow-hidden"
                style={{
                  border: '2.5px solid transparent',
                  background: displayPfp
                    ? `url(${displayPfp}) center/cover`
                    : 'linear-gradient(135deg, #333, #222)',
                  backgroundClip: 'padding-box',
                  boxShadow: '0 0 0 2.5px rgba(255,107,107,0.6)',
                }}
              >
                {!displayPfp && (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black">
                    {username[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                {displayPfp && <img src={displayPfp} alt="pfp" className="w-full h-full object-cover" />}
              </div>
              <div
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: '#FF6B6B', border: '2px solid #0D0D0D' }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-[18px] tracking-tight truncate">
                @{username || '...'}
              </p>
              <p className="text-white/40 text-[12px] mt-0.5">Tap photo to change</p>
              <div
                className="mt-2 self-start inline-block px-3 py-1 rounded-full text-[11px] font-semibold text-white/60"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                tbhonest.net/send/{username || '...'}
              </div>
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

        {/* ── Username field ── */}
        <div className="bg-white rounded-[20px] px-4 py-1" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
            <span className="text-[12px] font-semibold text-[#AAA] uppercase tracking-wider">Username</span>
            <span className={`text-[11px] font-medium ${username.length > 25 ? 'text-[#FF3B30]' : 'text-[#CCC]'}`}>
              {username.length}/30
            </span>
          </div>
          <div className="flex items-center gap-2 py-3">
            <span className="text-[#0D0D0D] font-bold text-[18px]">@</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              placeholder="username"
              maxLength={30}
              className="flex-1 bg-transparent text-[#0D0D0D] font-semibold text-[18px] outline-none placeholder:text-[#DDD]"
            />
            {username !== originalUsername && username.length >= 2 && (
              <span className="text-[11px] font-bold text-[#22C55E] flex items-center gap-1">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                NEW
              </span>
            )}
          </div>
        </div>

        {/* ── Save button placed right after username ── */}
        <div className="pt-2 pb-0">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full h-[56px] rounded-full text-white font-bold text-[17px] active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{
              background: canSave
                ? 'linear-gradient(135deg, #0D0D0D, #2A2A2A)'
                : '#DEDEDE',
              opacity: canSave ? 1 : 0.7,
            }}
          >
            {saving ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : hasChanges ? 'Save changes' : 'No changes to save'}
          </button>
        </div>

        {/* ── Error / success banners ── */}
        {error && (
          <div className="flex items-center gap-2 py-3 px-4 rounded-[16px] bg-[#FFF0F0]">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#FF3B30" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[#FF3B30] text-[13px] font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 py-3 px-4 rounded-[16px] bg-[#EAFAF1]">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth="2"/>
            </svg>
            <span className="text-[#22C55E] font-semibold text-[14px]">Saved! Redirecting…</span>
          </div>
        )}
      </div>
    </main>
  )
}