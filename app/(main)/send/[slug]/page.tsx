'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import InAppBrowserBanner from '@/app/components/InAppBrowserBanner'
import ImageEditor from '@/app/components/ImageEditor'
import { getStoredLocale, getT, useTranslation, type T } from '@/lib/i18n'

const SUGGESTIONS_MAP: Record<string, string[]> = {
  fr: [
    "Tu mérites un bisou 😘",
    "Je t'aime vraiment bien",
    "Tu es quelqu'un de spécial pour moi",
    "J'adore ta façon de parler",
    "Tu illumines ma journée juste en existant ✨",
    "Impossible de te sortir de ma tête",
    "Tu es tellement plus beau/belle que tu ne le penses 🌹",
    "J'aimerais pouvoir te le dire en vrai",
    "Tu n'imagines pas à quel point tu comptes pour moi 💫",
    "Je pourrais te parler pendant des heures",
  ],
  es: [
    "Te mereces un beso 😘",
    "Me gustas de verdad",
    "Eres alguien especial para mí",
    "Me encanta tu forma de hablar",
    "Haces que mi día sea mejor solo por existir ✨",
    "No puedo sacarte de mi cabeza",
    "Eres mucho más increíble de lo que crees 🌹",
    "Ojalá pudiera decírtelo en persona",
    "No te imaginas lo mucho que importas para mí 💫",
    "Podría hablar contigo durante horas",
  ],
  pt: [
    "Você merece um beijo 😘",
    "Eu gosto muito de você",
    "Você é alguém muito especial para mim",
    "Adoro o jeito que você fala",
    "Você melhora o meu dia só por existir ✨",
    "Não consigo tirar você da minha cabeça",
    "Você é muito mais incrível do que pensa 🌹",
    "Queria poder te dizer isso pessoalmente",
    "Você não tem ideia do quanto importa para mim 💫",
    "Poderia conversar com você por horas",
  ],
  de: [
    "Du verdienst einen Kuss 😘",
    "Ich mag dich wirklich sehr",
    "Du bist etwas ganz Besonderes für mich",
    "Ich liebe die Art, wie du sprichst",
    "Du machst meinen Tag besser, einfach indem du da bist ✨",
    "Ich kriege dich nicht mehr aus dem Kopf",
    "Du bist so viel schöner als du denkst 🌹",
    "Ich wünschte, ich könnte dir das persönlich sagen",
    "Du hast keine Ahnung, wie viel du mir bedeutest 💫",
    "Ich könnte stundenlang mit dir reden",
  ],
  it: [
    "Ti meriti un bacio 😘",
    "Mi piaci davvero tanto",
    "Sei una persona speciale per me",
    "Adoro il modo in cui parli",
    "Rendi la mia giornata migliore solo esistendo ✨",
    "Non riesco a toglierti dalla testa",
    "Sei molto più bello/a di quanto pensi 🌹",
    "Vorrei potertelo dire di persona",
    "Non hai idea di quanto vali per me 💫",
    "Potrei parlare con te per ore",
  ],
  en: [
    "You deserve a kiss 😘",
    "I really like you",
    "You're someone special, you know",
    "I love the way you speak",
    "You make my day better just by existing ✨",
    "There's something about you I can't get out of my head",
    "You're way more beautiful than you think 🌹",
    "I wish I could tell you this in person",
    "You have no idea how much you mean to me 💫",
    "I could talk to you forever and never get tired",
  ],
}

const GLOBAL_STYLES = `
  .ios-arc {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top: 2.5px solid #FFF;
    animation: ios-spin 0.75s linear infinite;
    flex-shrink: 0;
  }
  @keyframes ios-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes send-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .send-btn-loading {
    background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 40%, #1a1a1a 60%, #111 100%) !important;
    background-size: 200% auto !important;
    animation: send-shimmer 1.4s linear infinite !important;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes rotationDance {
    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
    5%       { transform: translateY(-4px) rotate(-6deg) scale(1.04); }
    10%      { transform: translateY(-6px) rotate(6deg) scale(1.04); }
    15%      { transform: translateY(-4px) rotate(-5deg) scale(1.03); }
    20%      { transform: translateY(-2px) rotate(5deg) scale(1.03); }
    25%      { transform: translateY(0) rotate(-2deg) scale(1.01); }
    30%      { transform: translateY(0) rotate(0deg) scale(1); }
  }
  .rotation-dance {
    animation: rotationDance 2.6s ease-in-out infinite;
    transform-origin: center center;
    will-change: transform;
  }
  .rotation-dance:active {
    animation: none;
    transform: scale(0.96) !important;
  }
  @keyframes countpop {
    0%   { transform: scale(1);    opacity: 1; }
    30%  { transform: scale(1.18); opacity: 0; }
    31%  { transform: scale(0.85); opacity: 0; }
    60%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1);    opacity: 1; }
  }
  .countpop  { animation: countpop 0.5s ease forwards; }
  textarea::placeholder { color: rgba(255,255,255,0.2); }
  * { -webkit-tap-highlight-color: transparent; }
`

type RecipientProfile = {
  user_id?: string
  username: string
  pfp: string | null
}

export default function SendMessagePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const { t, locale } = useTranslation()
  const suggestions = SUGGESTIONS_MAP[locale] || SUGGESTIONS_MAP.en
  const [recipient, setRecipient] = useState<RecipientProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [suggIndex, setSuggIndex] = useState(0)
  const [suggVisible, setSuggVisible] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editorSrc, setEditorSrc] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [liveCount, setLiveCount] = useState(() => Math.floor(Math.random() * 3000) + 4000)
  const [countAnimKey, setCountAnimKey] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const editedBlobRef = useRef<Blob | null>(null)
  const ipRef          = useRef<string | null>(null)
  const countryRef     = useRef<string | null>(null)
  const cityRef        = useRef<string | null>(null)
  const regionRef      = useRef<string | null>(null)
  const latRef         = useRef<string | null>(null)
  const lonRef         = useRef<string | null>(null)
  const browserRef     = useRef<string | null>(null)
  const fingerprintRef = useRef<string | null>(null)
  const phoneTypeRef   = useRef<string | null>(null)

  const themeGradient = 'linear-gradient(180deg, #000000 0%, #09090B 50%, #0D0D0D 100%)'
  const accentColor = '#FFFFFF'
  const font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

  const btnPress   = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) =>
    ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)')
  const btnRelease = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) =>
    ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')

  // Fetch IP and country eagerly on mount
  useEffect(() => {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 6000)
    // Browser name from userAgent
    const ua = navigator.userAgent
    browserRef.current = ua.includes('Firefox') ? 'Firefox'
      : ua.includes('SamsungBrowser') ? 'Samsung Internet'
      : (ua.includes('Opera') || ua.includes('OPR')) ? 'Opera'
      : (ua.includes('Edge') || ua.includes('Edg')) ? 'Edge'
      : ua.includes('Chrome') ? 'Chrome'
      : ua.includes('Safari') ? 'Safari'
      : 'Unknown'

    // Phone type from userAgent
    phoneTypeRef.current = /iPhone/.test(ua) ? 'iPhone'
      : /iPad/.test(ua) ? 'iPad'
      : /Android/.test(ua) ? 'Android'
      : 'Desktop'

    // Simple canvas-based fingerprint (no external lib)
    try {
      const fp = [navigator.userAgent, navigator.language, screen.width + 'x' + screen.height, new Date().getTimezoneOffset(), navigator.hardwareConcurrency ?? 0].join('|')
      fingerprintRef.current = btoa(unescape(encodeURIComponent(fp))).slice(0, 32)
    } catch { fingerprintRef.current = null }

    Promise.all([
      fetch('/api/ip',  { signal: ctrl.signal }).then(r => r.json()).catch(() => ({})),
      fetch('/api/geo', { signal: ctrl.signal }).then(r => r.json()).catch(() => ({})),
    ]).then(([ipData, geoData]) => {
      ipRef.current      = ipData.ip        ?? null
      countryRef.current = geoData.country  ?? null
      cityRef.current    = geoData.city     ?? null
      regionRef.current  = geoData.region   ?? null
      latRef.current     = geoData.latitude ?? null
      lonRef.current     = geoData.longitude ?? null
    }).finally(() => clearTimeout(t))
  }, [])

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUser(session.user)
    })
  }, [])

  useEffect(() => {
    if (!slug) return
    const cleanSlug = decodeURIComponent(slug as string).trim()
    supabaseClient
      .from('users_table').select('user_id, username, pfp').eq('slug', cleanSlug).maybeSingle()
      .then(({ data }) => { if (data) setRecipient(data) })
  }, [slug])

  const handleStartConversation = async () => {
    if (isStartingChat) return
    setIsStartingChat(true)
    setError(null)

    const cleanSlug = decodeURIComponent(slug as string).trim()
    const targetId = recipient?.user_id

    // 1. If user is already authenticated
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (session?.user) {
      try {
        const res = await fetch('/api/user/ghost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            target_slug: cleanSlug,
            target_user_id: targetId || undefined,
            draft_message: message.trim() || undefined,
          }),
        })

        const data = await res.json()
        const convId = data?.conversation_id

        router.push(convId ? `/chat?c=${convId}` : '/chat')
        return
      } catch (e) {
        console.error('[send-start-chat] error:', e)
        setIsStartingChat(false)
        setError('Could not start conversation')
        return
      }
    }

    // 2. Not authenticated -> store intent in localStorage, sessionStorage AND URL query params!
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tbh_is_ghost_auth', 'true')
        localStorage.setItem('tbh_ghost_chat_target_slug', cleanSlug)
        if (targetId) localStorage.setItem('tbh_ghost_chat_target_id', targetId)
        if (message.trim()) localStorage.setItem('tbh_ghost_draft_msg', message.trim())

        sessionStorage.setItem('tbh_is_ghost_auth', 'true')
        sessionStorage.setItem('tbh_ghost_chat_target_slug', cleanSlug)
        if (targetId) sessionStorage.setItem('tbh_ghost_chat_target_id', targetId)
        if (message.trim()) sessionStorage.setItem('tbh_ghost_draft_msg', message.trim())
      }

      const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
      callbackUrl.searchParams.set('ghost', '1')
      callbackUrl.searchParams.set('slug', cleanSlug)
      if (targetId) callbackUrl.searchParams.set('target', targetId)

      await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })
    } catch (err: any) {
      console.error('[send-start-chat] oauth error:', err)
      setIsStartingChat(false)
      setError('Failed to connect with Google')
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggVisible(false)
      setTimeout(() => { setSuggIndex(i => (i + 1) % suggestions.length); setSuggVisible(true) }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [suggestions.length])

  // Live count ticker on success screen
  useEffect(() => {
    if (!success) return
    const interval = setInterval(() => {
      setLiveCount(Math.floor(Math.random() * 3000) + 4000)
      setCountAnimKey(k => k + 1)
    }, 3500)
    return () => clearInterval(interval)
  }, [success])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditorSrc(URL.createObjectURL(file))
    setShowEditor(true)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleEditorDone = (blob: Blob, dataUrl: string) => {
    editedBlobRef.current = blob
    setImagePreview(dataUrl)
    setShowEditor(false)
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
  }

  const handleReEdit = () => {
    if (!imagePreview) return
    setEditorSrc(imagePreview)
    setShowEditor(true)
  }

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (!message.trim() || isSubmitting) return
  setIsSubmitting(true)
  setError(null)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const formData = new FormData()
    formData.append('message', message)
    formData.append('slug', slug as string)
    if (editedBlobRef.current) formData.append('image', editedBlobRef.current, 'image.jpg')
    if (ipRef.current)          formData.append('ip_address',         ipRef.current)
    if (countryRef.current)     formData.append('country',            countryRef.current)
    if (cityRef.current)        formData.append('city',               cityRef.current)
    if (regionRef.current)      formData.append('region',             regionRef.current)
    if (latRef.current)         formData.append('latitude',           latRef.current)
    if (lonRef.current)         formData.append('longitude',          lonRef.current)
    if (browserRef.current)     formData.append('browser_name',       browserRef.current)
    if (fingerprintRef.current) formData.append('device_fingerprint', fingerprintRef.current)
    if (phoneTypeRef.current)   formData.append('phone_type',         phoneTypeRef.current)

    const response = await fetch('/api/messages', { method: 'POST', body: formData, signal: controller.signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const detail = body?.error || body?.details || ''
      const err: any = new Error(detail || `HTTP ${response.status}`)
      err.status = response.status
      err.detail = detail
      throw err
    }
    setSuccess(true)
    setMessage('')
    setImagePreview(null)
    editedBlobRef.current = null
  } catch (err: any) {
    console.error('[send] failed:', err)
    if (err?.name === 'AbortError') {
      setError(t.requestTimeout)
    } else if (err?.status === 413) {
      setError(t.imageTooLarge)
    } else if (err?.status >= 500) {
      setError(`${t.serverError} (${err.status})`)
    } else if (err?.status) {
      setError(`${t.failedToSend} (${err.status})${err.detail ? ': ' + err.detail : ''}`)
    } else {
      setError(t.failedToSend)
    }
  } finally {
    clearTimeout(timeout)
    setIsSubmitting(false)
  }
}
  // ── Success screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <main style={{
        height: '100%', overflowY: 'auto', background: themeGradient,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '32px 24px', fontFamily: font, gap: '24px',
        position: 'relative',
      }}>
        <style>{GLOBAL_STYLES}</style>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>

          <img src="/assets/TBH_Title_Logo.svg" alt="TBH" style={{ height: '48px', filter: 'invert(1)' }} />

          {/* Sent card */}
          <div style={{
            width: '100%', maxWidth: '360px',
            background: 'rgba(18,18,20,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            borderRadius: '32px', padding: '36px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            animation: 'fadeUp 0.5s ease',
          }}>
            {recipient?.pfp && (
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentColor}`, marginBottom: '8px' }}>
                <img src={recipient.pfp} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
           <img src="/assets/Party.svg" alt="" style={{ width: '56px', height: '56px' }} />
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '4px 0 0' }}>{t.delivered}</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 }}>
              {t.deliveredTo}{' '}
              <span style={{ color: accentColor, fontWeight: '700' }}>@{recipient?.username ?? slug}</span>{' '}
              {t.deliveredSuffix || (locale === 'fr' ? 'a été envoyé.' : 'was delivered.')}
            </p>

            {/* Live count */}
           <div style={{ marginTop: '16px', textAlign: 'center' }}>
  <p style={{ 
    fontSize: '14px', 
    color: 'rgba(255,255,255,0.6)', // Subtle white for the main text
    margin: 0,
    letterSpacing: '-0.01em'
  }}>
    <span
      key={countAnimKey}
      className="countpop"
      style={{ 
        fontWeight: '800', 
        color: '#FFFFFF', // Pure white and bold for the number
        display: 'inline-block' 
      }}
    >
      {liveCount.toLocaleString()}
    </span>
    {' '} {t.peopleReceiving}
  </p>

  <style>{`
    .countpop {
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }
  `}</style>
</div>
          </div>

          {/* Buttons */}
          <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setSuccess(false)}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              style={{
                width: '100%', padding: '18px', borderRadius: '99px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', transition: 'transform 0.12s ease', fontFamily: font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t.sendAnother}
            </button>

            <button
              onClick={handleStartConversation}
              disabled={isStartingChat}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              style={{
                width: '100%', padding: '18px', borderRadius: '99px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '16px', fontWeight: '800',
                cursor: isStartingChat ? 'not-allowed' : 'pointer', transition: 'transform 0.12s ease', fontFamily: font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {isStartingChat ? (
                <>
                  <div className="ios-arc" />
                  <span>{locale === 'fr' ? 'Connexion...' : 'Connecting...'}</span>
                </>
              ) : (
                <>
                  <span>💬</span>
                  <span>{t.startConversation || (locale === 'fr' ? 'Discuter en direct' : 'Chat in direct')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => router.push('/')}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              className="rotation-dance"
              style={{
                width: '100%', padding: '18px', borderRadius: '99px', border: 'none',
                background: '#FFFFFF', color: '#000000', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', fontFamily: font,
                boxShadow: '0 8px 30px rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {t.getMyLink}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Main send screen ─────────────────────────────────────────────────────────
  return (
    <>
    {showEditor && editorSrc && (
      <ImageEditor
        src={editorSrc}
        onDone={handleEditorDone}
        onCancel={handleEditorCancel}
        accentColor={accentColor}
        font={font}
      />
    )}
    <main style={{
      height: '100%', overflowY: 'auto', background: themeGradient,
      fontFamily: font, display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '0 20px 48px',
      position: 'relative',
    }}>
      <InAppBrowserBanner />
      <style>{GLOBAL_STYLES}</style>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Header */}
        <div style={{ paddingTop: '56px', paddingBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <img src="/assets/TBH_Simple_Logo.svg" alt="TBH" style={{ height: '44px', filter: 'invert(1)' }} />
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.55)', margin: 0 }}>{t.anonymousMessaging}</p>
          {currentUser && (
            <button
              type="button"
              onClick={() => router.push('/chat')}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              style={{
                marginTop: '6px',
                padding: '8px 16px',
                borderRadius: '99px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'transform 0.12s ease',
                fontFamily: font,
              }}
            >
              <span>💬</span>
              <span>{locale === 'fr' ? 'Mes conversations' : 'My conversations'}</span>
            </button>
          )}
        </div>

        {/* Message card */}
        <form
          id="message-form"
          onSubmit={handleSubmit}
          style={{
            width: '100%', maxWidth: '400px',
            background: 'rgba(18,18,20,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)',
            borderRadius: '32px', padding: '24px',
            boxShadow: '0 32px 100px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}
        >
          {/* Recipient row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              overflow: 'hidden', border: `2.5px solid ${accentColor}`,
              background: '#333', flexShrink: 0,
            }}>
              {recipient?.pfp
                ? <img src={recipient.pfp} alt={recipient.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '800' }}>
                    {(recipient?.username ?? slug as string)?.[0]?.toUpperCase() ?? '?'}
                  </div>
              }
            </div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
              {t.messageFor} <span style={{ color: accentColor }}>@{recipient?.username ?? slug}</span>
            </p>
          </div>

          {/* Suggestion */}
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.3)',
            minHeight: '38px', margin: 0,
            transition: 'opacity 0.4s ease', opacity: suggVisible ? 1 : 0,
          }}>
            {suggestions[suggIndex % suggestions.length]}
          </p>

          {/* Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              required rows={5} maxLength={1000}
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder={t.writePlaceholder}
              style={{
                width: '100%', padding: '4px 4px 40px',
                fontSize: '18px', fontWeight: '600', color: '#FFF',
                background: 'transparent', border: 'none', outline: 'none',
                resize: 'none', lineHeight: '1.5', fontFamily: font, boxSizing: 'border-box',
              }}
            />
            <p style={{
              position: 'absolute', bottom: '0', left: '4px', fontSize: '12px', margin: 0,
              color: message.length > 900 ? accentColor : 'rgba(255,255,255,0.25)',
            }}>
              {message.length}/1000
            </p>
          </div>

          {/* Image picker */}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          {imagePreview ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.06)',
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={imagePreview} alt="" style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: 'blur(4px)', transform: 'scale(1.15)',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{t.photo || 'Photo'}</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{t.readyToSend || (locale === 'fr' ? 'Prête à envoyer' : 'Ready to send')}</p>
              </div>
              <button
                type="button"
                onClick={handleReEdit}
                style={{
                  position: 'absolute', top: '12px', left: '12px',
                  padding: '6px 12px', borderRadius: '99px',
                  background: 'rgba(0,0,0,0.65)', border: 'none', color: 'white',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '5px', fontFamily: font,
                }}
              >✏️ {t.edit || (locale === 'fr' ? 'Modifier' : 'Edit')}</button>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => { setImagePreview(null); editedBlobRef.current = null }}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button" onClick={() => fileRef.current?.click()}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              style={{
                padding: '14px 16px', borderRadius: '16px', border: 'none',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontFamily: font, transition: 'transform 0.12s ease',
              }}
            >
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {t.addPhoto}
            </button>
          )}

          {error && <p style={{ color: '#F87171', fontSize: '13px', margin: 0 }}>{error}</p>}
        </form>

        {/* Buttons section */}
        <div style={{ width: '100%', maxWidth: '400px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="submit" form="message-form"
            disabled={isSubmitting || !message.trim()}
            onMouseDown={e => { if (message.trim() && !isSubmitting) btnPress(e) }}
            onMouseUp={btnRelease}
            onTouchStart={e => { if (message.trim() && !isSubmitting) btnPress(e) }}
            onTouchEnd={btnRelease}
            className={isSubmitting ? 'send-btn-loading' : ''}
            style={{
              width: '100%', padding: '20px', borderRadius: '99px', border: 'none',
              background: message.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
              color: message.trim() ? '#000000' : 'rgba(255,255,255,0.3)',
              boxShadow: message.trim() ? '0 10px 30px rgba(255,255,255,0.15)' : 'none',
              fontSize: '18px', fontWeight: '800',
              transition: 'transform 0.12s ease, background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              cursor: isSubmitting ? 'not-allowed' : message.trim() ? 'pointer' : 'default',
              fontFamily: font,
            }}
          >
            {isSubmitting ? (
              <>
                <div className="ios-arc" />
                <span style={{ fontSize: '16px', fontWeight: '700', opacity: 0.9 }}>{t.sending}</span>
              </>
            ) : t.sendAnonymously}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: '600', textTransform: 'uppercase' }}>
              {locale === 'fr' ? 'ou' : 'or'}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* 1-on-1 Chat button */}
          <button
            type="button"
            onClick={handleStartConversation}
            disabled={isStartingChat}
            onMouseDown={btnPress} onMouseUp={btnRelease}
            onTouchStart={btnPress} onTouchEnd={btnRelease}
            style={{
              width: '100%', padding: '16px 20px', borderRadius: '99px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.06)',
              color: '#FFFFFF', fontSize: '15px', fontWeight: '700',
              cursor: isStartingChat ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              backdropFilter: 'blur(20px)',
              transition: 'transform 0.12s ease, background 0.2s ease, border-color 0.2s ease',
              fontFamily: font,
            }}
          >
            {isStartingChat ? (
              <>
                <div className="ios-arc" />
                <span style={{ fontSize: '14px', fontWeight: '700', opacity: 0.9 }}>
                  {locale === 'fr' ? 'Connexion...' : 'Connecting...'}
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '16px' }}>💬</span>
                <span>
                  {t.startConversation || (locale === 'fr' ? 'Commencer une conversation' : 'Start a conversation')}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </main>
    </>
  )
}