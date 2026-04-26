'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'profile' | 'photo'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateSlug(username: string): string {
  const rand = Math.random().toString(36).substring(2, 7)
  return `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}${rand}`
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('profile')

  // Step 1 state
  const [username, setUsername] = useState('')
  const [birthYear, setBirthYear] = useState<number | null>(null)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [tempYear, setTempYear] = useState(2000)

  // Step 2 state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Shared state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const years = Array.from({ length: 86 }, (_, i) => 2015 - i) // 2015 down to 1930

  // ── Step 1: Save profile info ──────────────────────────────────────────────
  const handleProfileNext = () => {
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters.')
      return
    }
    if (!birthYear) {
      setError('Please select your birth year.')
      return
    }
    setError(null)
    setStep('photo')
  }

  // ── Step 2: Upload photo + finalize profile ────────────────────────────────
  const handleFinish = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let pfpUrl = ''

      // Upload profile picture if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}_pfp.${fileExt}`
        const { error: uploadError } = await supabaseClient.storage
          .from('avatars') // your bucket name
          .upload(fileName, imageFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabaseClient.storage
          .from('avatars')
          .getPublicUrl(fileName)

        pfpUrl = urlData.publicUrl
      }

      const slug = generateSlug(username.trim())
      const now = new Date().toISOString()

      // Insert into users table
      const { error: insertError } = await supabaseClient.from('users_table').insert({
        user_id: user.id,
        username: username.trim(),
        email: user.email,
        slug,
        birthdate: birthYear,
        pfp: pfpUrl || null,
        created_at: now,
        active_subscription: false,
      })

      if (insertError) throw insertError

      // Insert into links table
      await supabaseClient.from('links').insert({
        user_id: user.id,
        dynamic_link: `tbhonest.net/send/${slug}`,
        created_at: now,
      })

      router.push('/home')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // ── Image picker ───────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── STEP 1: Username + Birth Year ── */}
      {step === 'profile' && (
        <div className="flex flex-col flex-1 px-7 pt-14 pb-8">
          <div className="flex-1">
            <h1 className="text-[28px] font-bold text-[#0D0D0D]">Almost there 👋</h1>
            <p className="text-sm text-[#888] mt-1 mb-9">Pick a username and your birth year.</p>

            {/* Username input */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D0D0D] font-bold text-lg">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                maxLength={30}
                className="w-full h-[60px] pl-9 pr-4 bg-[#F5F5F5] rounded-2xl text-[#0D0D0D] font-semibold text-lg placeholder:text-[#AAAAAA] outline-none focus:ring-2 focus:ring-[#0D0D0D] transition"
              />
            </div>

            {/* Birth year picker trigger */}
            <button
              onClick={() => { setTempYear(birthYear ?? 2000); setShowYearPicker(true) }}
              className="w-full h-[60px] bg-[#F5F5F5] rounded-2xl flex items-center justify-center font-semibold text-lg transition"
              style={{ color: birthYear ? '#0D0D0D' : '#AAAAAA' }}
            >
              {birthYear ? birthYear : 'Birth year'}
            </button>

            {error && <p className="text-[#FD2A1C] text-sm mt-3 text-center">{error}</p>}
          </div>

          {/* Next button */}
          <button
            onClick={handleProfileNext}
            disabled={username.trim().length < 2 || !birthYear}
            className="w-full h-[56px] rounded-[32px] bg-[#0D0D0D] text-white font-semibold text-xl disabled:bg-[#D8D8D8] transition active:scale-95"
          >
            Next
          </button>
        </div>
      )}

      {/* ── STEP 2: Profile Picture ── */}
      {step === 'photo' && (
        <div className="flex flex-col flex-1 px-7 pt-14 pb-8 items-center">
          <div className="flex flex-col items-center flex-1 w-full">

            {/* Avatar preview */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-[110px] h-[110px] rounded-full bg-[#EEEEEE] overflow-hidden flex items-center justify-center mb-5 active:scale-95 transition"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z" fill="#AAAAAA"/>
                </svg>
              )}
            </button>

            <h1 className="text-[22px] font-bold text-[#0D0D0D]">Choose a photo</h1>
            <p className="text-sm text-[#888] mt-1 mb-6">This is what people will see.</p>

            {/* Tap to choose */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 rounded-2xl bg-[#F5F5F5] text-[#0D0D0D] font-medium text-sm active:scale-95 transition"
            >
              {imagePreview ? 'Change photo' : 'Choose from gallery'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {error && <p className="text-[#FD2A1C] text-sm mt-4 text-center">{error}</p>}
          </div>

          {/* Finish button */}
          <button
            onClick={handleFinish}
            disabled={!imageFile || loading}
            className="w-full h-[56px] rounded-[32px] bg-[#0D0D0D] text-white font-semibold text-xl disabled:bg-[#D8D8D8] transition active:scale-95 flex items-center justify-center"
          >
            {loading
              ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Finish'
            }
          </button>

          {/* Skip photo */}
          <button
            onClick={handleFinish}
            disabled={loading}
            className="mt-3 text-sm text-[#AAAAAA] underline"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* ── Year Picker Bottom Sheet ── */}
      {showYearPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowYearPicker(false)} />

          {/* Sheet */}
          <div className="relative bg-[#1A1A1A] rounded-t-3xl z-10 pb-8">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-11 h-[5px] rounded-full bg-[#555]" />
            </div>

            <p className="text-white text-center text-[22px] font-bold py-4">Birth Year</p>

            {/* Scrollable years */}
            <div className="h-[220px] overflow-y-auto">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setTempYear(year)}
                  className="w-full py-2 transition"
                  style={{
                    fontSize: year === tempYear ? '30px' : '20px',
                    fontWeight: year === tempYear ? 700 : 400,
                    color: year === tempYear ? '#FFFFFF' : '#888888',
                  }}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Confirm */}
            <div className="px-6 pt-4">
              <button
                onClick={() => { setBirthYear(tempYear); setShowYearPicker(false) }}
                className="w-full h-[56px] rounded-2xl bg-white text-black font-bold text-lg active:scale-95 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}