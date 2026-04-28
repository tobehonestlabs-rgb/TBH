'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
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

      // Upload new profile picture if selected
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

      // Update username and pfp
      const { error: updateError } = await supabaseClient
        .from('users_table')
        .update({
          username: username.trim(),
          ...(pfpUrl !== currentPfp ? { pfp: pfpUrl } : {}),
        })
        .eq('user_id', userId)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => router.push('/home'), 1200)
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main
      className="min-h-screen bg-white flex flex-col"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center px-5 pt-14 pb-4 border-b border-[#F0F0F0]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition-transform mr-4"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[20px] font-bold text-[#0D0D0D]">Edit Profile</h1>
      </div>

      <div className="flex flex-col px-6 pt-8 gap-8 flex-1">

        {/* ── Profile picture ── */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative active:scale-95 transition-transform"
          >
            {/* Avatar */}
            <div
              className="w-[110px] h-[110px] rounded-full overflow-hidden"
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
                <div className="w-full h-full bg-[#EEE] flex items-center justify-center text-[#AAA] text-4xl font-bold">
                  {username[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            {/* Camera badge */}
            <div
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#0D0D0D' }}
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
          <label className="text-[13px] font-semibold text-[#888] uppercase tracking-wider px-1">
            Username
          </label>
          <div className="flex items-center h-[60px] bg-[#F5F5F5] rounded-[16px] px-4 gap-2">
            <span className="text-[#0D0D0D] font-bold text-[18px]">@</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              placeholder="username"
              maxLength={30}
              className="flex-1 bg-transparent text-[#0D0D0D] font-semibold text-[18px] outline-none placeholder:text-[#AAAAAA]"
            />
          </div>
          <p className="text-[11px] text-[#AAA] px-1">
            This is how people see you on TBH.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[#FD2A1C] text-[13px] text-center">{error}</p>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-[14px] bg-[#EAFAF1]">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#27AE60" strokeWidth="2"/>
            </svg>
            <span className="text-[#27AE60] font-semibold text-[14px]">Saved! Redirecting...</span>
          </div>
        )}
      </div>

      {/* ── Save button ── */}
      <div className="px-6 pb-12 pt-4">
        <button
          onClick={handleSave}
          disabled={saving || username.trim().length < 2}
          className="w-full h-[56px] rounded-[32px] text-white font-bold text-[18px] disabled:bg-[#D8D8D8] active:scale-95 transition-transform flex items-center justify-center"
          style={{ background: saving || username.trim().length < 2 ? '#D8D8D8' : '#0D0D0D' }}
        >
          {saving ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : 'Save changes'}
        </button>
      </div>
    </main>
  )
}