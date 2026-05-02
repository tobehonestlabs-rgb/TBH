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
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters.')
      return
    }
    setError(null)
    setSaving(true)

    try {
      let pfpUrl = currentPfp

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `${userId}_${Date.now()}_pfp.${ext}`
        const { error: uploadError } = await supabaseClient.storage
          .from('avatars')
          .upload(fileName, imageFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabaseClient.storage
          .from('avatars')
          .getPublicUrl(fileName)

        pfpUrl = urlData.publicUrl
      }

      const { error: updateError } = await supabaseClient
        .from('users_table')
        .update({
          username: username.trim(),
          ...(pfpUrl !== currentPfp ? { pfp: pfpUrl } : {}),
        })
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

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"

  return (
    <main className="min-h-screen bg-white flex flex-col" style={{ fontFamily: font }}>
      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-10 flex items-center px-5 pt-14 pb-3 border-b border-[#F0F0F0]"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center active:scale-90 transition-transform mr-3"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#0D0D0D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[20px] font-extrabold text-[#0D0D0D] tracking-tight flex-1">Edit profile</h1>
      </div>

      <div className="flex flex-col px-6 pt-10 gap-9 flex-1">

        {/* ── Profile picture ── */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative active:scale-95 transition-transform"
          >
            <div
              className="w-[120px] h-[120px] rounded-full overflow-hidden"
              style={{
                border: '3px solid transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFE66D, #4D96FF) border-box',
              }}
            >
              {imagePreview || currentPfp ? (
                <img
                  src={imagePreview ?? currentPfp!}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F5F5F7] flex items-center justify-center text-[#AAA] text-4xl font-bold">
                  {username[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            {/* Camera badge */}
            <div
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: '#0D0D0D', border: '2.5px solid white' }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
          </button>

          <p className="text-[13px] text-[#888]">Tap to change photo</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* ── Username ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[12px] font-semibold text-[#888] uppercase tracking-wider">
              Username
            </label>
            <span className={`text-[11px] font-medium ${username.length > 25 ? 'text-[#FF3B30]' : 'text-[#BBB]'}`}>
              {username.length}/30
            </span>
          </div>
          <div className="flex items-center h-[60px] bg-[#F5F5F7] rounded-[16px] px-4 gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0D0D0D] transition-all">
            <span className="text-[#0D0D0D] font-bold text-[18px]">@</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              placeholder="username"
              maxLength={30}
              className="flex-1 bg-transparent text-[#0D0D0D] font-semibold text-[18px] outline-none placeholder:text-[#AAA]"
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
          <p className="text-[11px] text-[#AAA] px-1">
            Your link: <span className="font-semibold text-[#666]">tbhonest.net/send/{username || '...'}</span>
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-[14px] bg-[#FFF0F0]">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#FF3B30" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[#FF3B30] text-[13px] font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-[14px] bg-[#EAFAF1]">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth="2"/>
            </svg>
            <span className="text-[#22C55E] font-semibold text-[14px]">Saved! Redirecting…</span>
          </div>
        )}
      </div>

      {/* ── Save button ── */}
      <div className="px-6 pb-12 pt-4">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full h-[56px] rounded-[28px] text-white font-bold text-[17px] active:scale-95 transition-all flex items-center justify-center"
          style={{
            background: canSave ? '#0D0D0D' : '#D8D8D8',
            opacity: canSave ? 1 : 0.7,
          }}
        >
          {saving ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : hasChanges ? 'Save changes' : 'No changes to save'}
        </button>
      </div>
    </main>
  )
}
