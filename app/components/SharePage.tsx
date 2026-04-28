'use client'

import { useState, useEffect, useRef } from 'react'
import { UserProfile } from '@/app/home/page'
import ShareModal from '@/app/components/ShareModal'

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
    id: 'confession', emoji: '🤫', title: 'BLOW ME UP',
    subtitle: "Tell me something you don't dare say out loud",
    description: 'Anonymous confessions',
    promptOverride: 'Send me an anonymous Photo/message 🤫'
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
  'Ask people to send you a pic of their room', 
  'try to know how '
]

const CARD_COLORS = [
  // Deep, aggressive red-orange (matches your new theme)
  { id: 'magma', label: 'Magma', stops: ['#FF411D', '#550B00'], ring: ['#FF411D', '#FF8F1D', '#FFBF00'] },
  
  // High-end Cyberpunk Pink/Purple
  { id: 'neon', label: 'Vibe', stops: ['#8A2BE2', '#000814'], ring: ['#8A2BE2', '#E0B0FF', '#4D96FF'] },
  
  // Tropical Electric Blue
  { id: 'azure', label: 'Azure', stops: ['#00D2FF', '#000046'], ring: ['#00D2FF', '#3A7BD5', '#00F2FE'] },
  
  // Luxury Emerald/Gold
  { id: 'emerald', label: 'Jungle', stops: ['#00B09B', '#111111'], ring: ['#00B09B', '#96C93D', '#00FF87'] },
  
  // Clean, Minimal Silver/Graphite
  { id: 'titanium', label: 'Chrome', stops: ['#757F9A', '#1C1C1C'], ring: ['#FFFFFF', '#D7DDE8', '#757F9A'] },
  
  // Brightest "Viral" Yellow
  { id: 'hyper', label: 'Volt', stops: ['#F7971E', '#FFD200'], ring: ['#FFD200', '#FFFFFF', '#FF8C00'] },
  
  // Soft Rose/Champagne
  { id: 'bloom', label: 'Blush', stops: ['#F953C6', '#2A0845'], ring: ['#F953C6', '#FF9A9E', '#B91D73'] },
  
  // Deep Space Blue
  { id: 'nebula', label: 'Cosmos', stops: ['#4facfe', '#000000'], ring: ['#4facfe', '#00f2fe', '#FFFFFF'] },
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
  const [promptText, setPromptText] = useState('Send me an anonymous photo/message')
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [tempPrompt, setTempPrompt] = useState(promptText)
  // Card picker disabled — kept for future use
  const [showCardPicker, setShowCardPicker] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType>(ALL_CARD_TYPES[0])
  const [generating, setGenerating] = useState(false)
  const [sharedPlatforms, setSharedPlatforms] = useState<string[]>([])
  const shareProgress = sharedPlatforms.length / 3
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0])
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [phraseVisible, setPhraseVisible] = useState(true)
const [showHelpModal, setShowHelpModal] = useState(false)
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
  setShowColorPicker(false)
  
  try {
    const logoUrl = `${window.location.origin}/assets/TBH_Title_Logo.svg`
    const blob = await generateShareCard(profile, promptText, cardType, logoUrl, selectedColor.stops, selectedColor.ring)
    const file = new File([blob], 'tbh-share.png', { type: 'image/png' })

    // THE FIX: We also include text/url in the general "Share" button 
    // because many users select WhatsApp from the generic OS picker too.
    const shareData = {
      files: [file],
      title: "TBH",
      text: `Send me an anonymous message! 🤫🔥\n\n${shareLink}`,
      url: shareLink // Added as a secondary catch for Android
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (e: any) {
        if (e?.name === 'AbortError') return
      }
    }

    // Desktop/Fallback
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tbh-share.png'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
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
    
    const shareTitle = "TBH: Anonymous"
    const shareText = `Send me an anonymous photo/message! 🤫🔥\n\n${shareLink}`

    // 1. CLIPBOARD BACKUP (The "Safety Net")
    // If WhatsApp drops the caption, the link is already in their hand to Paste
    try {
      await navigator.clipboard.writeText(shareLink)
    } catch (err) {
      console.warn("Clipboard backup failed")
    }

    // 2. UNIVERSAL NATIVE SHARE
    const shareData = {
      files: [file],
      title: shareTitle,
      text: shareText,
      url: shareLink // Critical for WhatsApp on some Android builds
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        setSharedPlatforms(prev => prev.includes(platformId) ? prev : [...prev, platformId])
        return 
      } catch (e: any) {
        if (e?.name === 'AbortError') return
      }
    }

    // 3. HARD FALLBACKS (If Native Share fails or user is on Desktop)
    if (platformId === 'instagram') {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'tbh-share.png'
      a.click()
      setTimeout(() => { 
        URL.revokeObjectURL(url)
        window.open('instagram://camera', '_blank') 
      }, 800)

    } else if (platformId === 'snapchat') {
      const snapUrl = `snapchat://creativekit/preview?attachmentUrl=${encodeURIComponent(shareLink)}`
      window.open(snapUrl, '_blank')

    } else if (platformId === 'whatsapp') {
      // Direct text fallback - guaranteed to send the link
      const encodedText = encodeURIComponent(shareText)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }

    setSharedPlatforms(prev => prev.includes(platformId) ? prev : [...prev, platformId])
  } catch (e) { 
    console.error('Platform share failed', e) 
  } finally { 
    setGenerating(false) 
  }
}

  return (
    <div className="flex flex-col items-center px-7 pt-3 pb-10 gap-4 relative min-h-screen">

      {/* ── Profile Card — shimmer while loading ── */}
      {!profile ? (
        <div className="w-full rounded-[28px] overflow-hidden relative" style={{ height: '160px' }}>
          <div className="absolute inset-0 bg-[#E8E8E8] rounded-[28px]" style={{ animation: 'shimmer 1.5s infinite linear', background: 'linear-gradient(90deg, #E8E8E8 25%, #F5F5F5 50%, #E8E8E8 75%)', backgroundSize: '200% 100%' }} />
          <div className="relative z-10 flex flex-col justify-center h-full px-5 gap-3">
            <div className="flex items-center gap-4">
              <div className="w-[58px] h-[58px] rounded-full bg-[#D0D0D0]" style={{ animation: 'shimmer 1.5s infinite linear', background: 'linear-gradient(90deg, #D0D0D0 25%, #E0E0E0 50%, #D0D0D0 75%)', backgroundSize: '200% 100%' }} />
              <div className="h-5 w-32 rounded-full bg-[#D0D0D0]" style={{ animation: 'shimmer 1.5s infinite linear', background: 'linear-gradient(90deg, #D0D0D0 25%, #E0E0E0 50%, #D0D0D0 75%)', backgroundSize: '200% 100%' }} />
            </div>
            <div className="h-8 w-56 rounded-[10px] bg-[#D0D0D0]" style={{ animation: 'shimmer 1.5s infinite linear', background: 'linear-gradient(90deg, #D0D0D0 25%, #E0E0E0 50%, #D0D0D0 75%)', backgroundSize: '200% 100%' }} />
          </div>
        </div>
      ) : (
      <div className="w-full rounded-[28px] overflow-hidden relative" style={{ height: '160px' }}>
        {/* Blurred background */}
        {profile?.pfp && (
          <div className="absolute inset-0 w-full h-full" style={{
            backgroundImage: `url(${profile.pfp})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(20px)', transform: 'scale(1.15)',
          }} />
        )}
        {!profile?.pfp && <div className="absolute inset-0 bg-gray-800" />}
        <div className="absolute inset-0 bg-black/55" />

        {/* Settings button — top right */}
        <a
          href="/settings"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="white" strokeWidth="2"/>
          </svg>
        </a>

        {/* Content — horizontal layout */}
        <div className="relative z-10 flex flex-col justify-center h-full px-5 gap-3">
          {/* Row: pfp + username */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative w-[58px] h-[58px] flex-shrink-0">
              <div className="absolute inset-0 rounded-full" style={{
                padding: '2.5px',
                background: 'linear-gradient(135deg, #FF6B6B, #FFE66D, #6BCB77, #4D96FF)',
                borderRadius: '50%',
              }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-700">
                  {profile?.pfp
                    ? <img src={profile.pfp} alt="pfp" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-xl font-bold">
                        {profile?.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                  }
                </div>
              </div>
            </div>
            {/* Username */}
            {profile?.username && (
              <span className="text-white font-bold text-[20px] tracking-tight">@{profile.username}</span>
            )}
          </div>

          {/* Prompt button — below the row */}
          <button
            onClick={() => { setTempPrompt(promptText); setEditingPrompt(true) }}
            className="self-start px-4 py-2 rounded-[10px] text-white text-[14px] font-medium text-left"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', maxWidth: '85%' }}
          >
            {promptText}
          </button>

        </div>
        {/* NEW: Help Link */}
   
      </div>
      )}
 <button 
      onClick={() => setShowHelpModal(true)}
      className="self-center flex items-center gap-1.5 py-1 text-[13px] font-bold text-gray-400 hover:text-black active:scale-95 transition-all"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      How to post my link?
    </button>
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
                className="rounded-[20px] overflow-hidden relative shadow-2xl"
                style={{ width: '140px', height: '248px' }}
              >
                {/* Blurred pfp background */}
                {profile?.pfp && (
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url(${profile.pfp})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'blur(12px) brightness(0.35)', transform: 'scale(1.1)',
                  }} />
                )}
                {/* Color gradient overlay — reduced opacity so bg shows */}
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(160deg, ${selectedColor.stops[0]}cc, ${selectedColor.stops[selectedColor.stops.length-1]}cc)`,
                }} />
                {/* Bottom fade */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5))' }} />

                {/* Logo bar */}
                <div className="absolute top-3 left-0 right-0 flex justify-center">
                  <div className="h-[4px] w-[36px] rounded-full bg-white/50" />
                </div>

                {/* Profile pic */}
                <div className="absolute left-0 right-0 flex justify-center" style={{ top: '40px' }}>
                  <div className="w-[52px] h-[52px] rounded-full overflow-hidden"
                    style={{ border: `2.5px solid ${selectedColor.ring[0]}`, boxShadow: `0 0 12px ${selectedColor.ring[0]}66` }}>
                    {profile?.pfp
                      ? <img src={profile.pfp} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
                          {profile?.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                    }
                  </div>
                </div>

                {/* Username */}
                <div className="absolute left-0 right-0 text-center" style={{ top: '102px' }}>
                  <p className="text-white font-bold text-[10px] tracking-wide">@{profile?.username ?? 'you'}</p>
                </div>

                {/* Prompt pill */}
                <div className="absolute left-2 right-2" style={{ top: '120px' }}>
                  <div className="rounded-[5px] bg-white/12 px-2 py-1">
                    <p className="text-white/75 text-center" style={{ fontSize: '6px', lineHeight: '9px' }}>
                      Send me an anonymous message
                    </p>
                  </div>
                </div>

                {/* Arrows SVG */}
                <div className="absolute left-0 right-0 flex justify-center" style={{ bottom: '20px' }}>
                  <img src="/assets/arrows.svg" alt="" className="w-10 h-4 object-contain" style={{ filter: 'brightness(0) invert(1) opacity(0.7)' }} />
                </div>

                {/* Link */}
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <p className="text-white/50" style={{ fontSize: '5px' }}>tbhonest.net/send/{profile?.slug}</p>
                </div>
              </div>
            </div>

            {/* Color swatches — horizontal scroll, large gradient circles */}
            <div className="flex gap-4 px-5 mb-5 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              {CARD_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 active:scale-90 transition-transform"
                >
                  {/* Large gradient circle */}
                  <div
                    className="w-14 h-14 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${color.stops[0]}, ${color.stops[color.stops.length-1]})`,
                      boxShadow: selectedColor.id === color.id
                        ? `0 0 0 3px #111, 0 0 0 5px ${color.stops[0]}, 0 8px 20px ${color.stops[0]}66`
                        : '0 4px 12px rgba(0,0,0,0.3)',
                      transform: selectedColor.id === color.id ? 'scale(1.12)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: selectedColor.id === color.id ? '#FFF' : 'rgba(255,255,255,0.45)' }}
                  >
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
{/* The Help Modal */}
      <ShareModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
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
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
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