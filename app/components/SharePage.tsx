'use client'

import { useState, useEffect, useRef } from 'react'
import { UserProfile } from '@/app/home/page'

type Props = { profile: UserProfile | null }

type CardType = {
  id: string
  emoji: string
  title: string
  subtitle: string
  description: string
  promptOverride: string | null
}

const ALL_CARD_TYPES: CardType[] = [
  {
    id: 'confession', emoji: '🤫', title: 'CONFESSION',
    subtitle: "Tell me something you don't dare say out loud",
    description: 'Anonymous confessions',
    promptOverride: 'Send me an anonymous confession 🤫'
  },
  {
    id: 'be_honest', emoji: '👀', title: 'BE HONEST',
    subtitle: 'Be honest with me, even if it hurts',
    description: 'Be honest with me',
    promptOverride: "Be honest with me 👀 Tell me what you really think"
  },
  {
    id: 'birthday', emoji: '🎊', title: "IT'S MY BIRTHDAY",
    subtitle: 'Wish me or tell me something sincere',
    description: "It's my birthday!",
    promptOverride: "It's my birthday 🎊 Send me a message!"
  },
  {
    id: 'show_room', emoji: '🛋️', title: 'SHOW YOUR ROOM',
    subtitle: 'Show me your favorite spot or your decor',
    description: 'Show your room',
    promptOverride: null
  },
  {
    id: 'guess', emoji: '🎯', title: 'GUESS SOMETHING',
    subtitle: 'Guess something about me',
    description: 'Guess something about me',
    promptOverride: 'Guess something about me 🎯'
  },
]

const PHRASES = [
  'Share your link to receive honest reviews on you.',
  'Check what kind of things people can send you.',
  'Is there someone who can send you a pic?',
  'You might discover something in a picture, send your link.',
  'What kind of things people can show in pictures.',
]

const CARD_COLORS = [
  { id: 'default',  label: 'Dark',    stops: ['#1a1a2e', '#16213e'],         ring: ['#FF6B6B','#FFE66D','#4D96FF'] },
  { id: 'sunset',   label: 'Sunset',  stops: ['#FF6B6B', '#FF8E53'],         ring: ['#FF6B6B','#FFE66D','#FF8E53'] },
  { id: 'ocean',    label: 'Ocean',   stops: ['#1CB5E0', '#000046'],         ring: ['#1CB5E0','#00C9FF','#4D96FF'] },
  { id: 'purple',   label: 'Purple',  stops: ['#6A0572', '#ab17a8'],         ring: ['#ab17a8','#D768D7','#6A0572'] },
  { id: 'forest',   label: 'Forest',  stops: ['#134E5E', '#71B280'],         ring: ['#71B280','#134E5E','#6BCB77'] },
  { id: 'gold',     label: 'Gold',    stops: ['#F7971E', '#FFD200'],         ring: ['#FFD200','#F7971E','#FFE66D'] },
  { id: 'rose',     label: 'Rose',    stops: ['#F953C6', '#B91D73'],         ring: ['#F953C6','#B91D73','#FF6B6B'] },
  { id: 'midnight', label: 'Night',   stops: ['#0F0C29', '#302b63'],         ring: ['#302b63','#4D96FF','#0F0C29'] },
]

// ── Share card generation using HTML5 Canvas ──────────────────────────────────
async function generateShareCard(
  profile: UserProfile,
  promptText: string,
  cardType: CardType,
  logoUrl: string,
  colorStops: string[] = ['#1a1a2e', '#16213e'],
  ringColors: string[] = ['#FF6B6B','#FFE66D','#4D96FF'],
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const W = 1080, H = 1920
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    // 1. Load profile pic
    let pfpImg: HTMLImageElement | null = null
    if (profile.pfp) {
      pfpImg = await loadImage(profile.pfp).catch(() => null)
    }

    // 2. Background — color gradient always, pfp blurred on top
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, colorStops[0])
    bgGrad.addColorStop(1, colorStops[colorStops.length - 1])
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    if (pfpImg) {
      ctx.save()
      ctx.filter = 'blur(40px) brightness(0.25)'
      ctx.drawImage(pfpImg, -60, -60, W + 120, H + 120)
      ctx.filter = 'none'
      ctx.restore()
    }
    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, W, H)

    // Vignette tinted to color
    const vignette = ctx.createLinearGradient(0, H * 0.5, 0, H)
    vignette.addColorStop(0, 'transparent')
    vignette.addColorStop(1, colorStops[colorStops.length - 1] + '55')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, W, H)

    // 3. Logo
    const logo = await loadImage(logoUrl).catch(() => null)
    if (logo) {
      const lw = 200, lh = lw * logo.height / logo.width
      ctx.drawImage(logo, (W - lw) / 2, 80, lw, lh)
    }

    // 4. Card type title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 110px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 20
    const titleLines = cardType.title.split('\n')
    titleLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, 340 + i * 130)
    })
    ctx.shadowBlur = 0

    // 5. Gradient ring + profile pic
    const ringY = 340 + titleLines.length * 130 + 60
    const ringR = 210
    const cx = W / 2, cy = ringY + ringR

    const ringGrad = ctx.createLinearGradient(0, 0, W, H)
    ringColors.forEach((c, i) => ringGrad.addColorStop(i / Math.max(ringColors.length - 1, 1), c))
    ctx.beginPath()
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
    ctx.strokeStyle = ringGrad
    ctx.lineWidth = 22
    ctx.stroke()

    if (pfpImg) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, ringR - 14, 0, Math.PI * 2)
      ctx.clip()
      const pfpS = (ringR - 14) * 2
      ctx.drawImage(pfpImg, cx - pfpS / 2, cy - pfpS / 2, pfpS, pfpS)
      ctx.restore()
    }

    // 6. Username
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 12
    ctx.fillText(`@${profile.username ?? ''}`, W / 2, cy + ringR + 90)
    ctx.shadowBlur = 0

    // 7. Prompt pill
    const prompt = cardType.promptOverride ?? promptText
    ctx.font = '52px -apple-system, BlinkMacSystemFont, sans-serif'
    const pillPadX = 48, pillPadY = 28
    const maxPillW = W * 0.78
    const wrappedPrompt = wrapCanvasText(ctx, prompt, maxPillW - pillPadX * 2)
    const lineH = 64
    const pillH = wrappedPrompt.length * lineH + pillPadY * 2
    const pillW = maxPillW
    const pillX = (W - pillW) / 2
    const pillY = cy + ringR + 120

    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    roundRect(ctx, pillX, pillY, pillW, pillH, 28)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    wrappedPrompt.forEach((line, i) => {
      ctx.fillText(line, W / 2, pillY + pillPadY + lineH * i + 44)
    })

    // 8. Link
    const linkY = pillY + pillH + 60
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`tbhonest.net/send/${profile.slug}`, W / 2, linkY + 40)

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width <= maxW) { current = test }
    else { if (current) lines.push(current); current = word }
  }
  if (current) lines.push(current)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SharePage({ profile }: Props) {
  const [copied, setCopied] = useState(false)
  const [promptText, setPromptText] = useState('Send me an anonymous message')
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [tempPrompt, setTempPrompt] = useState(promptText)
  const [shareProgress] = useState(0)
  // Card picker disabled — kept for future use
  const [showCardPicker, setShowCardPicker] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType>(ALL_CARD_TYPES[0])
  const [generating, setGenerating] = useState(false)
  const [sharedPlatforms, setSharedPlatforms] = useState<string[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0])
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [phraseVisible, setPhraseVisible] = useState(true)

  const shareLink = profile?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://tbhonest.net'}/send/${profile.slug}`
    : ''

  // Phrase rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseVisible(false)
      setTimeout(() => { setPhraseIndex(i => (i + 1) % PHRASES.length); setPhraseVisible(true) }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleCopy = async () => {
    if (!shareLink) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareLink)
      } else {
        const el = document.createElement('textarea')
        el.value = shareLink
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) { console.error('Copy failed', e) }
  }

  const handleShareCard = async (cardType: CardType) => {
    if (!profile) return
    setGenerating(true)
    setShowCardPicker(false)
    try {
      const logoUrl = `${window.location.origin}/assets/TBH_Title_Logo.svg`
      const blob = await generateShareCard(profile, promptText, cardType, logoUrl, selectedColor.stops, selectedColor.ring)
      const file = new File([blob], 'tbh-share.png', { type: 'image/png' })

      // Try native share sheet first (works on Android Chrome + Safari iOS with HTTPS)
      const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] })
      if (navigator.share && canShareFiles) {
        try {
          await navigator.share({ title: 'TBH', text: shareLink, files: [file] })
          return
        } catch (e: any) {
          // User cancelled or share failed — fall through to object URL approach
          if (e?.name === 'AbortError') return
        }
      }

      // Fallback: open image in new tab so user can long-press save + share manually
      // This works on localhost where navigator.share is blocked
      const url = URL.createObjectURL(blob)
      const w = window.open(url, '_blank')
      if (!w) {
        // If popup blocked, download instead
        const a = document.createElement('a')
        a.href = url
        a.download = 'tbh-share.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (e) { console.error('Share failed', e) }
    finally { setGenerating(false) }
  }

  const handlePlatformShare = async (platformId: string) => {
    if (!profile || generating) return
    setGenerating(true)
    try {
      const logoUrl = `${window.location.origin}/assets/TBH_Title_Logo.svg`
      const blob = await generateShareCard(profile, promptText, selectedCard, logoUrl, selectedColor.stops, selectedColor.ring)
      const file = new File([blob], 'tbh-share.png', { type: 'image/png' })

      // Try native share with files (opens IG/Snap/WA on Android/iOS with HTTPS)
      const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] })
      if (navigator.share && canShareFiles) {
        try {
          await navigator.share({ title: 'TBH', text: shareLink, files: [file] })
          setSharedPlatforms(prev => prev.includes(platformId) ? prev : [...prev, platformId])
          return
        } catch (e: any) {
          if (e?.name === 'AbortError') return
        }
      }

      // Fallback: deep link to app with text, open card in new tab
      const encodedLink = encodeURIComponent(shareLink)
      if (platformId === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodedLink}`, '_blank')
      } else if (platformId === 'instagram') {
        window.open('https://www.instagram.com/', '_blank')
      } else if (platformId === 'snapchat') {
        window.open('https://www.snapchat.com/', '_blank')
      }
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 15000)
      setSharedPlatforms(prev => prev.includes(platformId) ? prev : [...prev, platformId])
    } catch (e) { console.error('Platform share failed', e) }
    finally { setGenerating(false) }
  }

  return (
    <div className="flex flex-col items-center px-7 pt-3 pb-10 gap-4 relative min-h-screen">

      {/* ── Profile Card with proper blur ── */}
      <div className="w-full rounded-[28px] overflow-hidden relative" style={{ height: '240px' }}>
        {/* Blurred background layer */}
        {profile?.pfp && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${profile.pfp})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.15)',
            }}
          />
        )}
        {!profile?.pfp && (
          <div className="absolute inset-0 bg-gray-800" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />
{/* Edit button — top right */}
        <a
          href="/edit"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </a>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 px-4">
          <div className="relative w-[72px] h-[72px]">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                padding: '3px',
                background: 'linear-gradient(135deg, #FF6B6B, #FFE66D, #6BCB77, #4D96FF)',
                borderRadius: '50%',
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-700">
                {profile?.pfp ? (
                  <img src={profile.pfp} alt="pfp" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-2xl">
                    {profile?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {profile?.username && (
            <span className="text-white font-bold text-[18px]">@{profile.username}</span>
          )}

          <button
            onClick={() => { setTempPrompt(promptText); setEditingPrompt(true) }}
            className="px-3 py-1.5 rounded-[10px] text-white text-[15px] font-medium text-center max-w-full"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
          >
            {promptText}
          </button>
        </div>
      </div>

      {/* ── Share progress ── */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-[90px] h-[90px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#E8E8E8" strokeWidth="8" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#pg)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - shareProgress)}`}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <defs>
              <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B6B" /><stop offset="100%" stopColor="#4D96FF" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-[20px] font-bold text-[#0D0D0D]">{Math.round(shareProgress * 100)}%</span>
            <span className="text-[10px] text-[#888]">shared</span>
          </div>
        </div>
        <p className="text-[11px] text-[#888] text-center px-8">
          {shareProgress === 0 ? 'Share your link to unlock your viral potential 🚀' : '🎉 Viral mode!'}
        </p>
      </div>

      {/* ── Copy button ── */}
      <button
        onClick={handleCopy}
        className="w-full py-[14px] rounded-[32px] flex items-center justify-center gap-2 font-bold text-[17px] text-white"
        style={{
          background: copied ? 'linear-gradient(135deg, #FF6B6B, #4D96FF)' : '#0D0D0D',
          animation: 'liftShake 3s ease-in-out infinite',
          transition: 'background 0.3s ease',
        }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {copied ? 'Copied!' : 'Copy my link'}
      </button>

      {/* ── Share button → opens color picker ── */}
      <button
        onClick={() => setShowColorPicker(true)}
        disabled={generating}
        className="w-full py-[14px] rounded-[32px] flex items-center justify-center gap-2 font-bold text-[17px] text-white disabled:opacity-60"
        style={{
          background: `linear-gradient(135deg, ${selectedColor.stops[0]}, ${selectedColor.stops[selectedColor.stops.length-1]})`,
          animation: 'liftShake 3s ease-in-out 0.5s infinite',
        }}
      >
        {generating ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Share my link
          </>
        )}
      </button>

      {/* ── Platform quick-share row ── */}
      <div className="w-full flex gap-3">
        {[
          { id: 'instagram', label: 'Instagram', icon: '/assets/social_media_icons/IG_icon.svg', pkg: 'instagram' },
          { id: 'snapchat',  label: 'Snapchat',  icon: '/assets/social_media_icons/snapshat_icon.svg', pkg: 'snapchat' },
          { id: 'whatsapp',  label: 'WhatsApp',  icon: '/assets/social_media_icons/Platform=WhatsApp, Color=Original.svg', pkg: 'whatsapp' },
        ].map(platform => (
          <button
            key={platform.id}
            onClick={() => handlePlatformShare(platform.id)}
            disabled={generating}
            className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[20px] active:scale-95 transition-transform relative disabled:opacity-50"
            style={{
              background: sharedPlatforms.includes(platform.id) ? '#0D0D0D' : '#F2F2F2',
            }}
          >
            <img
              src={platform.icon}
              alt={platform.label}
              className="w-6 h-6 object-contain"
            />
            <span className="text-[11px] font-semibold" style={{ color: sharedPlatforms.includes(platform.id) ? '#FFF' : '#0D0D0D' }}>
              {platform.label}
            </span>
            {sharedPlatforms.includes(platform.id) && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#34C759] flex items-center justify-center">
                <svg width="8" height="8" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Animated phrase box ── */}
      <div className="w-full px-2 text-center">
        <p style={{
          fontSize: '15px', fontWeight: 700, color: '#0D0D0D', lineHeight: '1.5',
          transition: 'opacity 0.6s ease', opacity: phraseVisible ? 1 : 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          letterSpacing: '-0.2px',
        }}>
          {PHRASES[phraseIndex]}
        </p>
      </div>

      {/* ── Color picker bottom sheet ── */}
      {showColorPicker && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowColorPicker(false)} />
          <div className="relative bg-[#111] rounded-t-[28px] z-10 pb-10">
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-11 h-[5px] rounded-full bg-[#444]" />
            </div>
            <p className="text-white text-center text-[20px] font-extrabold px-6">Card Color</p>
            <p className="text-[#888] text-center text-[12px] mt-1 mb-5 px-6">Pick a style for your share card</p>

            {/* Card preview */}
            <div className="flex justify-center mb-5 px-5">
              <div
                className="rounded-[20px] overflow-hidden relative"
                style={{
                  width: '140px', height: '248px',
                  background: `linear-gradient(160deg, ${selectedColor.stops[0]}, ${selectedColor.stops[selectedColor.stops.length-1]})`,
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))' }} />
                <div className="absolute top-3 left-0 right-0 flex justify-center">
                  <div className="h-[5px] w-[40px] rounded-full bg-white/40" />
                </div>
                <div className="absolute left-0 right-0 flex justify-center" style={{ top: '60px' }}>
                  <div
                    className="w-[56px] h-[56px] rounded-full overflow-hidden"
                    style={{ border: `3px solid ${selectedColor.ring[0]}` }}
                  >
                    {profile?.pfp
                      ? <img src={profile.pfp} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold">
                          {profile?.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                    }
                  </div>
                </div>
                <div className="absolute left-0 right-0 text-center" style={{ top: '126px' }}>
                  <p className="text-white font-bold text-[11px]">@{profile?.username ?? 'you'}</p>
                </div>
                <div className="absolute bottom-8 left-3 right-3">
                  <div className="rounded-[6px] bg-white/15 px-2 py-1.5">
                    <p className="text-white/80 text-center text-[7px]">Send me an anonymous message</p>
                  </div>
                </div>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="h-[4px] w-[12px] rounded-[2px]"
                      style={{ background: `linear-gradient(90deg, ${selectedColor.ring[0]}, ${selectedColor.ring[selectedColor.ring.length-1]})` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Color swatches */}
            <div className="flex flex-wrap gap-3 px-5 justify-center mb-5">
              {CARD_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                >
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${color.stops[0]}, ${color.stops[color.stops.length-1]})`,
                      border: selectedColor.id === color.id ? '3px solid #FFF' : '3px solid transparent',
                      boxShadow: selectedColor.id === color.id ? '0 0 0 2px #FF6B6B' : 'none',
                    }}
                  />
                  <span className="text-[10px] font-semibold"
                    style={{ color: selectedColor.id === color.id ? '#FFF' : '#888' }}>
                    {color.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Share button */}
            <div className="px-5">
              <button
                onClick={() => { setShowColorPicker(false); handleShareCard(selectedCard) }}
                className="w-full py-4 rounded-[24px] text-white font-bold text-[16px] active:scale-95 transition-transform flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${selectedColor.stops[0]}, ${selectedColor.stops[selectedColor.stops.length-1]})` }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Share this card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit prompt dialog — top aligned, fixed width ── */}
      {editingPrompt && (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-black/40 px-6 pt-32">
          <div className="w-[300px] bg-white rounded-[20px] p-5 flex flex-col gap-3">
            <p className="text-center text-[13px] text-[#888]">Edit message</p>
            <textarea
              value={tempPrompt}
              onChange={e => setTempPrompt(e.target.value)}
              rows={3}
              className="w-full bg-[#F2F2F2] rounded-[12px] px-4 py-3 text-[15px] text-[#0D0D0D] text-center outline-none resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setEditingPrompt(false)}
                className="flex-1 h-[40px] rounded-[10px] border border-[#DDD] text-[#888] text-[13px]">
                Cancel
              </button>
              <button onClick={() => { setPromptText(tempPrompt); setEditingPrompt(false) }}
                className="flex-1 h-[40px] rounded-[10px] bg-[#0D0D0D] text-white text-[13px] font-medium">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Card type picker bottom sheet ── */}
      {showCardPicker && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCardPicker(false)} />
          <div className="relative bg-[#111] rounded-t-[28px] z-10 pb-10" style={{ maxHeight: '75vh' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-11 h-[5px] rounded-full bg-[#444]" />
            </div>

            <p className="text-white text-center text-[20px] font-extrabold px-6">Card Type</p>
            <p className="text-[#888] text-center text-[12px] mt-1 mb-5 px-6">Choose how you want to present yourself</p>

            {/* Horizontal carousel of card previews */}
            <div className="flex gap-4 px-5 overflow-x-auto pb-4" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
              {ALL_CARD_TYPES.map(card => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="flex-shrink-0 transition-transform active:scale-95"
                  style={{ scrollSnapAlign: 'center', width: '120px' }}
                >
                  {/* Mini card preview 9:16 */}
                  <div
                    className="w-full rounded-[16px] overflow-hidden relative mb-2"
                    style={{
                      height: '213px',
                      background: 'linear-gradient(160deg, #1a1a2e, #16213e)',
                      border: selectedCard.id === card.id ? '2px solid #FF6B6B' : '2px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Bottom gradient */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(77,150,255,0.35))' }} />
                    {/* Logo bar */}
                    <div className="absolute top-3 left-0 right-0 flex justify-center">
                      <div className="h-[5px] w-[36px] rounded-full bg-white/40" />
                    </div>
                    {/* Emoji */}
                    <div className="absolute top-9 left-0 right-0 flex justify-center text-[26px]">{card.emoji}</div>
                    {/* Title */}
                    <div className="absolute top-[68px] left-0 right-0 px-2 text-center">
                      <p className="text-white font-extrabold" style={{ fontSize: '10px', lineHeight: '12px' }}>{card.title}</p>
                    </div>
                    {/* Profile pic */}
                    <div className="absolute left-0 right-0 flex justify-center" style={{ top: '108px' }}>
                      <div className="w-[34px] h-[34px] rounded-full overflow-hidden" style={{ border: '2px solid #FF6B6B' }}>
                        {profile?.pfp
                          ? <img src={profile.pfp} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white" style={{ fontSize: '10px' }}>{profile?.username?.[0]?.toUpperCase() ?? '?'}</div>
                        }
                      </div>
                    </div>
                    {/* Prompt pill */}
                    <div className="absolute bottom-7 left-2 right-2">
                      <div className="rounded-[5px] bg-white/10 px-1 py-1">
                        <p className="text-white/70 text-center" style={{ fontSize: '6px', lineHeight: '8px' }}>
                          {(card.promptOverride ?? 'Send me a message').slice(0, 35)}
                        </p>
                      </div>
                    </div>
                    {/* Arrow dots */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="h-[4px] w-[10px] rounded-[2px]" style={{ background: 'linear-gradient(90deg, #FF6B6B, #4D96FF)' }} />
                      ))}
                    </div>
                    {/* Selected badge */}
                    {selectedCard.id === card.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B6B, #4D96FF)' }}>
                        <svg width="9" height="9" fill="none" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Label */}
                  <p className="text-center font-semibold truncate" style={{ fontSize: '10px', color: selectedCard.id === card.id ? '#FF6B6B' : '#888' }}>
                    {card.emoji} {card.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Selected card info */}
            <div className="px-5 mt-1 mb-4">
              <p className="text-white text-center text-[14px] font-semibold">{selectedCard.emoji} {selectedCard.description}</p>
              <p className="text-[#888] text-center text-[12px] mt-1">"{selectedCard.subtitle}"</p>
            </div>

            {/* Use this card */}
            <div className="px-5">
              <button
                onClick={() => handleShareCard(selectedCard)}
                className="w-full py-4 rounded-[24px] text-white font-bold text-[16px] active:scale-95 transition-transform flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFE66D, #4D96FF)' }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Use this card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Copied toast ── */}
      {copied && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-[20px] px-8 py-6 shadow-2xl flex flex-col items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EAFAF1] flex items-center justify-center">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="#27AE60" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-[15px] font-medium text-[#0D0D0D]">Link copied</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes liftShake {
          0%   { transform: translateY(0px)  rotate(0deg);    }
          8%   { transform: translateY(-7px) rotate(-1.5deg); }
          16%  { transform: translateY(-7px) rotate(1.5deg);  }
          24%  { transform: translateY(-7px) rotate(-1.5deg); }
          32%  { transform: translateY(0px)  rotate(0deg);    }
          100% { transform: translateY(0px)  rotate(0deg);    }
        }
      `}</style>
    </div>
  )
}