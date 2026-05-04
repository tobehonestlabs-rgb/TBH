'use client'

import { useState, useEffect, useRef } from 'react'
import { UserProfile } from '@/app/home/page'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabaseClient'

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
    id: 'blow_me_up', emoji: '💣', title: 'BLOW ME UP',
    subtitle: "Send me an anonymous photo or message",
    description: 'Anonymous messages',
    promptOverride: 'Send me an anonymous Photo/message 🤫'
  },
  {
    id: 'confession', emoji: '🤫', title: 'CONFESS TO ME',
    subtitle: "Tell me something you've never dared say",
    description: 'Anonymous confessions',
    promptOverride: "Tell me something you've never dared say 🤫"
  },
  {
    id: 'qa', emoji: '❓', title: 'ASK ME ANYTHING',
    subtitle: 'Ask me anything — I will answer honestly',
    description: 'Q&A',
    promptOverride: 'Ask me anything, I dare you ❓'
  },
  {
    id: 'make_laugh', emoji: '😂', title: 'MAKE ME LAUGH',
    subtitle: 'Send memes, jokes or something hilarious',
    description: 'Make me laugh',
    promptOverride: 'Make me laugh 😂 send a meme or funny message'
  },
  {
    id: 'confess_chat', emoji: '💬', title: 'CONFESS & CHAT',
    subtitle: 'Confess something and start a conversation',
    description: 'Confess and chat',
    promptOverride: 'Confess something to me 💬'
  },
  {
    id: 'be_honest', emoji: '👀', title: 'BE HONEST',
    subtitle: 'Be honest with me, even if it hurts',
    description: 'Be honest with me',
    promptOverride: "Be honest with me 👀 Tell me what you really think"
  },
  {
    id: 'dare_me', emoji: '🎯', title: 'DARE ME',
    subtitle: 'Dare me to do something wild',
    description: 'Dare me',
    promptOverride: 'Dare me to do something 🎯'
  },
  {
    id: 'birthday', emoji: '🎊', title: "IT'S MY BIRTHDAY",
    subtitle: 'Wish me or tell me something sincere',
    description: "It's my birthday!",
    promptOverride: "It's my birthday 🎊 Send me a message!"
  },
]

const PHRASES = [
  'Share your link to receive honest reviews on you.',
  'Check what kind of things people can send you.',
  'Is there someone who can send you a pic?',
  'You might discover something in a picture, send your link.',
  'What kind of things people can show in pictures.',
  'Ask people to send you a pic of their room',
  'try to know how people see you',
  'Dare people to make you laugh with memes'
]

const CARD_COLORS = [
  { id: 'magma',    label: 'Magma',  stops: ['#FF411D', '#550B00'], ring: ['#FF411D', '#FF8F1D', '#FFBF00'] },
  { id: 'neon',     label: 'Vibe',   stops: ['#8A2BE2', '#000814'], ring: ['#8A2BE2', '#E0B0FF', '#4D96FF'] },
  { id: 'azure',    label: 'Azure',  stops: ['#00D2FF', '#000046'], ring: ['#00D2FF', '#3A7BD5', '#00F2FE'] },
  { id: 'emerald',  label: 'Jungle', stops: ['#00B09B', '#111111'], ring: ['#00B09B', '#96C93D', '#00FF87'] },
  { id: 'titanium', label: 'Chrome', stops: ['#757F9A', '#1C1C1C'], ring: ['#FFFFFF', '#D7DDE8', '#757F9A'] },
  { id: 'hyper',    label: 'Volt',   stops: ['#F7971E', '#FFD200'], ring: ['#FFD200', '#FFFFFF', '#FF8C00'] },
  { id: 'bloom',    label: 'Blush',  stops: ['#F953C6', '#2A0845'], ring: ['#F953C6', '#FF9A9E', '#B91D73'] },
  { id: 'nebula',   label: 'Cosmos', stops: ['#4facfe', '#000000'], ring: ['#4facfe', '#00f2fe', '#FFFFFF'] },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Load an SVG from URL and re-color all fills/strokes to white
async function loadWhiteSvg(url: string): Promise<HTMLImageElement> {
  const text = await fetch(url).then(r => r.text())
  const white = text
    .replace(/fill="#000000"/gi, 'fill="white"')
    .replace(/fill="#000"/gi, 'fill="white"')
    .replace(/fill="black"/gi, 'fill="white"')
    .replace(/stroke="#000000"/gi, 'stroke="white"')
    .replace(/stroke="#000"/gi, 'stroke="white"')
    .replace(/stroke="black"/gi, 'stroke="white"')
  const blob = new Blob([white], { type: 'image/svg+xml' })
  const blobUrl = URL.createObjectURL(blob)
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(blobUrl); res(img) }
    img.onerror = rej
    img.src = blobUrl
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

// Detect if canvas supports ctx.filter (fails silently on iOS Safari)
function supportsCanvasFilter(): boolean {
  try {
    const c = document.createElement('canvas')
    c.width = 1; c.height = 1
    const ctx = c.getContext('2d')!
    ctx.filter = 'brightness(0)'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1, 1)
    const [r] = ctx.getImageData(0, 0, 1, 1).data
    return r === 0
  } catch { return false }
}

function buildBlurCanvas(img: HTMLImageElement, W: number, H: number): HTMLCanvasElement {
  const s1 = document.createElement('canvas')
  s1.width = Math.max(2, W >> 3); s1.height = Math.max(2, H >> 3)
  s1.getContext('2d')!.drawImage(img, 0, 0, s1.width, s1.height)
  const s2 = document.createElement('canvas')
  s2.width = Math.max(2, W >> 2); s2.height = Math.max(2, H >> 2)
  s2.getContext('2d')!.drawImage(s1, 0, 0, s2.width, s2.height)
  const s3 = document.createElement('canvas')
  s3.width = Math.max(2, W >> 1); s3.height = Math.max(2, H >> 1)
  s3.getContext('2d')!.drawImage(s2, 0, 0, s3.width, s3.height)
  const s4 = document.createElement('canvas')
  s4.width = W + 120; s4.height = H + 120
  s4.getContext('2d')!.drawImage(s3, 0, 0, s4.width, s4.height)
  return s4
}

// Draw blurred pfp background onto ctx — shared between image and GIF
function drawBlurredBg(
  ctx: CanvasRenderingContext2D,
  pfpImg: HTMLImageElement,
  W: number, H: number,
  blurTmp: HTMLCanvasElement | null,
  hasFilter: boolean,
  extra = 0,
) {
  if (hasFilter) {
    ctx.save()
    ctx.filter = 'blur(40px) brightness(0.25)'
    ctx.drawImage(pfpImg, -60 - extra, -60 - extra, W + 120 + extra * 2, H + 120 + extra * 2)
    ctx.filter = 'none'
    ctx.restore()
  } else if (blurTmp) {
    ctx.save()
    ctx.globalAlpha = 1
    ctx.drawImage(blurTmp, -60 - extra, -60 - extra, W + 120 + extra * 2, H + 120 + extra * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.72)'
    ctx.fillRect(-60 - extra, -60 - extra, W + 120 + extra * 2, H + 120 + extra * 2)
    ctx.restore()
  }
}

// ── Static image generation ───────────────────────────────────────────────────
async function generateShareCard(
  profile: UserProfile,
  promptText: string,
  cardType: CardType,
  colorStops: string[] = ['#1a1a2e', '#16213e'],
  ringColors: string[] = ['#FF6B6B', '#FFE66D', '#4D96FF'],
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const W = 1080, H = 1920
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    const hasFilter = supportsCanvasFilter()

    const [pfpImg, whiteLogo, whiteArrows] = await Promise.all([
      profile.pfp ? loadImage(profile.pfp).catch(() => null) : Promise.resolve(null),
      loadWhiteSvg(`${window.location.origin}/assets/TBH_Title_Logo.svg`).catch(() => null),
      loadWhiteSvg(`${window.location.origin}/assets/arrows.svg`).catch(() => null),
    ])

    let blurTmp: HTMLCanvasElement | null = null
    if (!hasFilter && pfpImg) {
      blurTmp = buildBlurCanvas(pfpImg, W, H)
    }

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, colorStops[0])
    bgGrad.addColorStop(1, colorStops[colorStops.length - 1])
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // 2. Blurred PFP background
    if (pfpImg) drawBlurredBg(ctx, pfpImg, W, H, blurTmp, hasFilter)

    // 3. Dark overlay — lightened for better card feel
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(0, 0, W, H)

    // 4. Vignette
    const vignette = ctx.createLinearGradient(0, H * 0.5, 0, H)
    vignette.addColorStop(0, 'transparent')
    vignette.addColorStop(1, colorStops[colorStops.length - 1] + '55')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, W, H)

    // 5. TBH Logo (white)
    if (whiteLogo) {
      const lw = 200, lh = lw * whiteLogo.height / whiteLogo.width
      ctx.drawImage(whiteLogo, (W - lw) / 2, 80, lw, lh)
    }

    // 6. Card title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 110px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 20
    const titleLines = cardType.title.split('\n')
    titleLines.forEach((line, i) => { ctx.fillText(line, W / 2, 340 + i * 130) })
    ctx.shadowBlur = 0

    // 7. Gradient ring + profile pic
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

    // 8. Username
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 12
    ctx.fillText(`@${profile.username ?? ''}`, W / 2, cy + ringR + 90)
    ctx.shadowBlur = 0

    // 9. Prompt pill
    ctx.font = '52px -apple-system, BlinkMacSystemFont, sans-serif'
    const pillPadX = 48, pillPadY = 28
    const maxPillW = W * 0.78
    const wrappedPrompt = wrapCanvasText(ctx, promptText, maxPillW - pillPadX * 2)
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
    wrappedPrompt.forEach((line, i) => { ctx.fillText(line, W / 2, pillY + pillPadY + lineH * i + 44) })

    // 10. Link text
    const linkY = pillY + pillH + 60
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`tbhonest.net/send/${profile.slug}`, W / 2, linkY + 40)

    // 11. Arrows below link text
    if (whiteArrows) {
      const aw = 120, ah = aw * whiteArrows.height / whiteArrows.width
      ctx.save()
      ctx.globalAlpha = 0.6
      ctx.drawImage(whiteArrows, (W - aw) / 2, linkY + 90, aw, ah)
      ctx.globalAlpha = 1
      ctx.restore()
    }

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}

// ── Animated GIF generation ───────────────────────────────────────────────────
async function generateShareGif(
  profile: UserProfile,
  promptText: string,
  cardType: CardType,
  colorStops: string[] = ['#1a1a2e', '#16213e'],
  ringColors: string[] = ['#FF6B6B', '#FFE66D', '#4D96FF'],
  onProgress?: (pct: number) => void,
): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc')

  const W = 540, H = 960
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  const hasFilter = supportsCanvasFilter()

  const [pfpImg, whiteLogo, whiteArrows] = await Promise.all([
    profile.pfp ? loadImage(profile.pfp).catch(() => null) : Promise.resolve(null),
    loadWhiteSvg(`${window.location.origin}/assets/TBH_Title_Logo.svg`).catch(() => null),
    loadWhiteSvg(`${window.location.origin}/assets/arrows.svg`).catch(() => null),
  ])

  let blurTmp: HTMLCanvasElement | null = null
  if (!hasFilter && pfpImg) {
    blurTmp = buildBlurCanvas(pfpImg, W, H)
  }

  const encoder = GIFEncoder()
  const FRAMES = 40
  const DELAY  = 100 // 10fps → 4s total

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FRAMES

    // Sinusoidal animation offsets (slow, gentle)
    const bgExtra  = Math.round(W * 0.03 * Math.sin(t * Math.PI))      // background breathe
    const logoOff  = Math.sin(t * Math.PI * 3.0) * 5                    // logo drift
    const ringOffX = Math.sin(t * Math.PI * 3.7 + 0.5) * 6             // ring/pfp horizontal drift
    const ringOffY = Math.cos(t * Math.PI * 2.9 + 1.2) * 5             // ring/pfp vertical drift
    const pillOff  = Math.sin(t * Math.PI * 2.0 + 0.8) * 4             // pill sway
    const linkOff  = Math.cos(t * Math.PI * 2.4) * 3                   // link drift
    const arrowOff = Math.sin(t * Math.PI * 1.6 + 1.2) * 6             // arrows bounce

    ctx.clearRect(0, 0, W, H)

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, colorStops[0])
    bgGrad.addColorStop(1, colorStops[colorStops.length - 1])
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Blurred PFP (with breathing expansion)
    if (pfpImg) drawBlurredBg(ctx, pfpImg, W, H, blurTmp, hasFilter, bgExtra)

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(0, 0, W, H)

    // Vignette
    const vignette = ctx.createLinearGradient(0, H * 0.5, 0, H)
    vignette.addColorStop(0, 'transparent')
    vignette.addColorStop(1, colorStops[colorStops.length - 1] + '55')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, W, H)

    // Logo
    if (whiteLogo) {
      const lw = 100, lh = lw * whiteLogo.height / whiteLogo.width
      ctx.drawImage(whiteLogo, (W - lw) / 2, 40 + logoOff, lw, lh)
    }

    // Title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 55px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 10
    const titleLines = cardType.title.split('\n')
    titleLines.forEach((line, i) => { ctx.fillText(line, W / 2, 170 + i * 65) })
    ctx.shadowBlur = 0

    // Ring + PFP (ring drifts with ringOffX / ringOffY)
    const ringY = 170 + titleLines.length * 65 + 30
    const ringR = 105
    const cx = W / 2 + ringOffX, cy = ringY + ringR + ringOffY
    const ringGrad = ctx.createLinearGradient(0, 0, W, H)
    ringColors.forEach((c, i) => ringGrad.addColorStop(i / Math.max(ringColors.length - 1, 1), c))
    ctx.beginPath()
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
    ctx.strokeStyle = ringGrad
    ctx.lineWidth = 11
    ctx.stroke()
    if (pfpImg) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, ringR - 7, 0, Math.PI * 2)
      ctx.clip()
      const pfpS = (ringR - 7) * 2
      ctx.drawImage(pfpImg, cx - pfpS / 2, cy - pfpS / 2, pfpS, pfpS)
      ctx.restore()
    }

    // Username
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 8
    ctx.fillText(`@${profile.username ?? ''}`, cx, cy + ringR + 45)
    ctx.shadowBlur = 0

    // Prompt pill
    ctx.font = '26px -apple-system, BlinkMacSystemFont, sans-serif'
    const pillPadX = 24, pillPadY = 14
    const maxPillW = W * 0.78
    const wrapped = wrapCanvasText(ctx, promptText, maxPillW - pillPadX * 2)
    const lineH = 32
    const pillH = wrapped.length * lineH + pillPadY * 2
    const pillW = maxPillW
    const pillX = (W - pillW) / 2
    const pillYPos = cy + ringR + 60 + pillOff
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    roundRect(ctx, pillX, pillYPos, pillW, pillH, 14)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    wrapped.forEach((line, i) => { ctx.fillText(line, W / 2, pillYPos + pillPadY + lineH * i + 22) })

    // Link text
    const linkY = pillYPos + pillH + 30 + linkOff
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`tbhonest.net/send/${profile.slug}`, W / 2, linkY + 20)

    // Arrows
    if (whiteArrows) {
      const aw = 60, ah = aw * whiteArrows.height / whiteArrows.width
      ctx.save()
      ctx.globalAlpha = 0.6
      ctx.drawImage(whiteArrows, (W - aw) / 2, linkY + 45 + arrowOff, aw, ah)
      ctx.globalAlpha = 1
      ctx.restore()
    }

    // Encode frame
    const imageData = ctx.getImageData(0, 0, W, H)
    const palette = quantize(imageData.data, 256)
    const index   = applyPalette(imageData.data, palette)
    encoder.writeFrame(index, W, H, { palette, delay: DELAY })

    onProgress?.((f + 1) / FRAMES)

    // Yield to browser to avoid blocking UI on heavy encoding
    if (f % 8 === 7) await new Promise(r => setTimeout(r, 0))
  }

  encoder.finish()
  const bytes = encoder.bytes()
  // Copy into a plain ArrayBuffer to satisfy Blob constructor types
  const ab = new ArrayBuffer(bytes.length)
  new Uint8Array(ab).set(bytes)
  return new Blob([ab], { type: 'image/gif' })
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SharePage({ profile }: Props) {
  const [copied, setCopied]               = useState(false)
  const [promptText, setPromptText]       = useState('Send me an anonymous photo/message')
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [tempPrompt, setTempPrompt]       = useState(promptText)
  const [showCardPicker, setShowCardPicker] = useState(false)
  const [selectedCard, setSelectedCard]   = useState<CardType>(ALL_CARD_TYPES[0])
  const [generating, setGenerating]       = useState(false)
  const [gifProgress, setGifProgress]     = useState(0)
  const [sharedPlatforms, setSharedPlatforms] = useState<string[]>([])
  const shareProgress = sharedPlatforms.length / 3
  const hasMarkedSharing = useRef(false)
  const [showSheet, setShowSheet]         = useState(false)
  // 'format' → pick Image/GIF, 'color' → pick color (after format chosen)
  const [sheetStep, setSheetStep]         = useState<'format' | 'color'>('format')
  const [shareMode, setShareMode]         = useState<'image' | 'gif'>('image')
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0])
  const [phraseIndex, setPhraseIndex]     = useState(0)
  const [phraseVisible, setPhraseVisible] = useState(true)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showGamePicker, setShowGamePicker] = useState(false)
  const [sheetClosing, setSheetClosing]         = useState(false)
  const [gamePickerClosing, setGamePickerClosing] = useState(false)
  const [shareReady, setShareReady] = useState<{ blob: Blob; filename: string; isGif: boolean } | null>(null)

  const shareLink = profile?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://tbhonest.net'}/send/${profile.slug}`
    : ''

  // Mark user as sharing on first successful share (fixed: awaited)
  useEffect(() => {
    if (sharedPlatforms.length === 0 || hasMarkedSharing.current || !profile) return
    hasMarkedSharing.current = true
    ;(async () => {
      await supabaseClient
        .from('users_table')
        .update({ is_sharing: true })
        .eq('user_id', profile.user_id)
    })()
  }, [sharedPlatforms.length, profile])

  // Phrase rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseVisible(false)
      setTimeout(() => { setPhraseIndex(i => (i + 1) % PHRASES.length); setPhraseVisible(true) }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const closeSheet = () => {
    setSheetClosing(true)
    setTimeout(() => { setShowSheet(false); setSheetClosing(false) }, 300)
  }

  const closeGamePicker = () => {
    setGamePickerClosing(true)
    setTimeout(() => { setShowGamePicker(false); setGamePickerClosing(false) }, 300)
  }

  const handleGameSelect = (game: CardType) => {
    setSelectedCard(game)
    if (game.promptOverride) setPromptText(game.promptOverride)
    closeGamePicker()
  }

  // Called from a fresh button tap → fresh gesture context → navigator.share works on iOS
  const handleShareReady = async () => {
    if (!shareReady) return
    const { blob, filename, isGif } = shareReady
    const mime = isGif ? 'image/gif' : 'image/png'
    const file = new File([blob], filename, { type: mime })
    const shareData = { files: [file], title: 'TBH', text: shareLink }
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); setShareReady(null); return }
      catch (e: any) { if (e?.name === 'AbortError') { setShareReady(null); return } }
    }
    // fallback: trigger download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 30000)
    setShareReady(null)
  }

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
      setTimeout(() => setCopied(false), 500)
    } catch (e) { console.error('Copy failed', e) }
  }

  const handleShareCard = async (cardType: CardType) => {
    if (!profile) return
    closeSheet()
    await new Promise(r => setTimeout(r, 300))
    setGenerating(true)
    try {
      const blob = await generateShareCard(profile, promptText, cardType, selectedColor.stops, selectedColor.ring)
      setShareReady({ blob, filename: 'tbh-share.png', isGif: false })
    } catch (e) { console.error('Share card failed', e) }
    finally { setGenerating(false) }
  }

  const handleShareGif = async () => {
    if (!profile) return
    closeSheet()
    await new Promise(r => setTimeout(r, 300))
    setGenerating(true)
    setGifProgress(0)
    try {
      const blob = await generateShareGif(
        profile, promptText, selectedCard, selectedColor.stops, selectedColor.ring,
        pct => setGifProgress(pct),
      )
      setShareReady({ blob, filename: 'tbh-share.gif', isGif: true })
    } catch (e) { console.error('GIF generation failed', e) }
    finally { setGenerating(false); setGifProgress(0) }
  }

  const handlePlatformShare = async (platformId: string) => {
    if (!profile || generating) return
    setGenerating(true)
    try {
      const blob = await generateShareCard(profile, promptText, selectedCard, selectedColor.stops, selectedColor.ring)
      const file = new File([blob], 'tbh-share.png', { type: 'image/png' })
      try { await navigator.clipboard.writeText(shareLink) } catch {}
      const shareData = { files: [file], title: 'TBH', text: shareLink }
      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData)
          setSharedPlatforms(prev => prev.includes(platformId) ? prev : [...prev, platformId])
          return
        } catch (e: any) { if (e?.name === 'AbortError') return }
      }
      if (platformId === 'instagram') {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'tbh-share.png'; a.click()
        setTimeout(() => { URL.revokeObjectURL(url); window.open('instagram://camera', '_blank') }, 800)
      } else if (platformId === 'snapchat') {
        window.open(`snapchat://creativekit/preview?attachmentUrl=${encodeURIComponent(shareLink)}`, '_blank')
      } else if (platformId === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent('Send me an anonymous photo/message! 🤫🔥')}`, '_blank')
      }
      setSharedPlatforms(prev => prev.includes(platformId) ? prev : [...prev, platformId])
    } catch (e) { console.error('Platform share failed', e) }
    finally { setGenerating(false) }
  }

  return (
    <div className="flex flex-col px-5 pt-3 pb-6 gap-3 relative">

      {/* ── Profile Card ── */}
      {!profile ? (
        <div className="w-full rounded-[28px] overflow-hidden relative" style={{ height: '148px' }}>
          <div className="absolute inset-0 bg-[#E8E8E8] rounded-[28px]" style={{ animation: 'shimmer 1.5s infinite linear', background: 'linear-gradient(90deg, #E8E8E8 25%, #F5F5F5 50%, #E8E8E8 75%)', backgroundSize: '200% 100%' }} />
        </div>
      ) : (
        <div className="w-full rounded-[28px] overflow-hidden relative" style={{ height: '148px' }}>
          {profile?.pfp && (
            <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: `url(${profile.pfp})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)', transform: 'scale(1.15)' }} />
          )}
          {!profile?.pfp && <div className="absolute inset-0 bg-gray-800" />}
          <div className="absolute inset-0 bg-black/40" />
          <a href="/settings" className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2.6" stroke="white" strokeWidth="1.8"/>
              <path d="M19.14 12.94a7.97 7.97 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.93 7.93 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.43h-3.84a.5.5 0 0 0-.5.43l-.36 2.54a8.06 8.06 0 0 0-1.63.95l-2.39-.96a.5.5 0 0 0-.6.22L2.66 8.84a.5.5 0 0 0 .12.64l2.03 1.58a8.13 8.13 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.38 1.05.7 1.62.94l.36 2.54a.5.5 0 0 0 .5.43h3.84a.5.5 0 0 0 .5-.43l.36-2.54a8.06 8.06 0 0 0 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </a>
          <div className="relative z-10 flex flex-col justify-center h-full px-5 gap-2">
            <div className="flex items-center gap-3">
              <div className="relative w-[52px] h-[52px] flex-shrink-0">
                <div className="absolute inset-0 rounded-full" style={{ padding: '2.5px', background: 'linear-gradient(135deg, #FF6B6B, #ff4b15, #e654ae, #ff4d4d)', borderRadius: '50%' }}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-700">
                    {profile?.pfp
                      ? <img src={profile.pfp} alt="pfp" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-xl font-bold">{profile?.username?.[0]?.toUpperCase() ?? '?'}</div>
                    }
                  </div>
                </div>
              </div>
              {profile?.username && <span className="text-white font-bold text-[19px] tracking-tight">@{profile.username}</span>}
            </div>
            <button
              onClick={() => { setTempPrompt(promptText); setEditingPrompt(true) }}
              className="self-start px-3 py-1.5 rounded-[10px] text-white text-[13px] font-medium text-left"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', maxWidth: '85%' }}
            >
              {promptText}
            </button>
          </div>
        </div>
      )}

      {/* ── Game selector ── */}
      <button
        onClick={() => setShowGamePicker(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-[20px] active:scale-95 transition-all"
        style={{ background: '#F5F5F7' }}
      >
        <span className="text-[22px]">{selectedCard.emoji}</span>
        <div className="flex-1 text-left">
          <p className="text-[13px] font-extrabold text-[#0D0D0D] tracking-tight">{selectedCard.title}</p>
          <p className="text-[11px] text-[#888] mt-0.5">{selectedCard.subtitle}</p>
        </div>
        <span className="text-[11px] font-semibold text-[#AAA]">Change</span>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" stroke="#ADADAD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Flat progress bar ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-[#0D0D0D] w-[38px]">
            {Math.round(shareProgress * 100)}%
          </span>
          <div className="flex-1 h-[6px] rounded-full bg-[#EBEBEB] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0D0D0D] transition-all duration-700"
              style={{ width: `${Math.round(shareProgress * 100)}%` }}
            />
          </div>
        </div>
        <p className="text-[11px] font-semibold text-[#555]">
          The more you share, the more messages you receive from your friends
        </p>
      </div>

      {/* ── Copy button — color flash on click ── */}
      <button
        onClick={handleCopy}
        className={`w-full py-[13px] rounded-[32px] flex items-center justify-center gap-2 font-bold text-[16px] text-white active:scale-95 transition-transform${copied ? ' copy-flash' : ''}`}
        style={{ background: copied ? undefined : '#0D0D0D' }}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {copied ? 'Copied!' : 'Copy my link'}
      </button>

      {/* ── Share button → opens format + color sheet ── */}
      <button
        onClick={() => { setSheetStep('format'); setShowSheet(true) }}
        disabled={generating}
        className="w-full py-[13px] rounded-[32px] flex items-center justify-center gap-2 font-bold text-[16px] text-white disabled:opacity-60 active:scale-95 transition-all"
        style={{ background: `linear-gradient(135deg, ${selectedColor.stops[0]}, ${selectedColor.stops[selectedColor.stops.length - 1]})` }}
      >
        {generating ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {gifProgress > 0 && <span className="text-[13px] opacity-80">GIF {Math.round(gifProgress * 100)}%</span>}
          </div>
        ) : (
          <>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Share my link
          </>
        )}
      </button>

      {/* ── Platform quick-share row ── */}
      <div className="w-full flex gap-2.5">
        {[
          { id: 'instagram', label: 'Instagram', icon: '/assets/social_media_icons/IG_icon.svg' },
          { id: 'snapchat',  label: 'Snapchat',  icon: '/assets/social_media_icons/snapshat_icon.svg' },
          { id: 'whatsapp',  label: 'WhatsApp',  icon: '/assets/social_media_icons/Platform=WhatsApp, Color=Original.svg' },
        ].map(platform => {
          const shared = sharedPlatforms.includes(platform.id)
          return (
            <button
              key={platform.id}
              onClick={() => handlePlatformShare(platform.id)}
              disabled={generating}
              className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[20px] active:scale-95 transition-all relative disabled:opacity-50"
              style={{ background: shared ? '#0D0D0D' : '#F5F5F7', border: 'none' }}
            >
              <img src={platform.icon} alt={platform.label} className="w-6 h-6 object-contain" />
              <span className="text-[11px] font-semibold" style={{ color: shared ? '#FFF' : '#0D0D0D' }}>{platform.label}</span>
              {shared && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#34C759] flex items-center justify-center">
                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Animated phrase ── */}
      <p className="text-center text-[13px] font-semibold text-[#0D0D0D] px-2" style={{ opacity: phraseVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        {PHRASES[phraseIndex]}
      </p>

      {/* ── How to share link ── */}
      <Link href="/guide" className="self-center">
        <button className="flex items-center gap-1.5 py-1 text-[13px] font-bold text-gray-400 hover:text-black active:scale-95 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          How to post my link?
        </button>
      </Link>

      {/* ── Share sheet (format → color) ── */}
      {showSheet && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
        >
          <div
            className={`absolute inset-0 ${sheetClosing ? 'backdrop-exit' : 'backdrop-enter'}`}
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => { if (!sheetClosing) closeSheet() }}
          />
          <div className={`relative ${sheetClosing ? 'sheet-exit' : 'sheet-enter'} rounded-t-[32px] z-10 pb-10 overflow-hidden border-t border-white/[0.06]`} style={{ background: '#181818' }}>
            <div className="absolute top-0 left-0 right-0 h-[90px] pointer-events-none" style={{ background: `linear-gradient(to bottom, ${selectedColor.stops[0]}18, transparent)` }} />

            <div className="relative z-10">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* Sliding step container */}
              <div className="overflow-hidden">
                {/* ── Step 1: Format picker ── */}
                {sheetStep === 'format' && (
                  <div className="slide-from-left pb-2">
                    <p className="text-white text-center text-[20px] font-extrabold px-6 pt-3">Share Format</p>
                    <p className="text-[#777] text-center text-[12px] mt-1 mb-5 px-6">Choose how to share your card</p>
                    <div className="flex gap-3 px-5 mb-5">
                      <button
                        onClick={() => { setShareMode('image'); setSheetStep('color') }}
                        className="flex-1 rounded-[24px] flex flex-col items-center justify-center gap-2 py-6 active:scale-95 transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: shareMode === 'image' ? `1.5px solid ${selectedColor.stops[0]}80` : '1.5px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <svg width="30" height="30" fill="none" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.6"/>
                          <circle cx="8.5" cy="8.5" r="1.5" fill="white"/>
                          <path d="M21 15l-5-5L5 21" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-white font-bold text-[14px]">Image</span>
                        <span className="text-[#555] text-[11px]">Static PNG</span>
                      </button>
                      <button
                        onClick={() => { setShareMode('gif'); setSheetStep('color') }}
                        className="flex-1 rounded-[24px] flex flex-col items-center justify-center gap-2 py-6 active:scale-95 transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: shareMode === 'gif' ? `1.5px solid ${selectedColor.stops[0]}80` : '1.5px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <svg width="30" height="30" fill="none" viewBox="0 0 24 24">
                          <rect x="2" y="6" width="20" height="12" rx="2" stroke="white" strokeWidth="1.6"/>
                          <path d="M12 10v4M10 12h4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                          <path d="M7 10v1.5a.5.5 0 0 0 .5.5H9M17 10v4h-2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-white font-bold text-[14px]">GIF</span>
                        <span className="text-[#555] text-[11px]">4s animated</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Color picker ── */}
                {sheetStep === 'color' && (
                  <div className="slide-from-right pb-2">
                    <div className="flex items-center px-5 pt-3 mb-4">
                      <button
                        onClick={() => setSheetStep('format')}
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3 active:scale-90 transition-transform"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <p className="text-white text-[20px] font-extrabold flex-1">
                        {shareMode === 'gif' ? 'GIF Color' : 'Card Color'}
                      </p>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: shareMode === 'gif' ? '#FFD60A' : 'rgba(255,255,255,0.5)' }}>
                        {shareMode === 'gif' ? 'GIF' : 'PNG'}
                      </span>
                    </div>

                    {/* Card preview */}
                    <div className="flex justify-center mb-4 px-5">
                      <div className="rounded-[20px] overflow-hidden relative" style={{ width: '130px', height: '231px', boxShadow: `0 16px 48px ${selectedColor.stops[0]}40` }}>
                        {profile?.pfp && (
                          <div className="absolute inset-0" style={{ backgroundImage: `url(${profile.pfp})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(12px) brightness(0.4)', transform: 'scale(1.1)' }} />
                        )}
                        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${selectedColor.stops[0]}99, ${selectedColor.stops[selectedColor.stops.length - 1]}bb)` }} />
                        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="absolute top-3 left-0 right-0 flex justify-center">
                          <div className="h-[3px] w-[30px] rounded-full bg-white/40" />
                        </div>
                        <div className="absolute left-0 right-0 flex justify-center" style={{ top: '38px' }}>
                          <div className="w-[48px] h-[48px] rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 2px ${selectedColor.ring[0]}, 0 0 0 3.5px ${selectedColor.ring[1] ?? selectedColor.ring[0]}60` }}>
                            {profile?.pfp
                              ? <img src={profile.pfp} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold text-base">{profile?.username?.[0]?.toUpperCase() ?? '?'}</div>
                            }
                          </div>
                        </div>
                        <div className="absolute left-0 right-0 text-center" style={{ top: '96px' }}>
                          <p className="text-white font-bold text-[9px]">@{profile?.username ?? 'you'}</p>
                        </div>
                        <div className="absolute left-2 right-2" style={{ top: '112px' }}>
                          <div className="rounded-[5px] px-2 py-1" style={{ background: 'rgba(255,255,255,0.10)' }}>
                            <p className="text-white/70 text-center" style={{ fontSize: '5.5px', lineHeight: '8px' }}>{selectedCard.title}</p>
                          </div>
                        </div>
                        <div className="absolute left-0 right-0 flex justify-center" style={{ bottom: '22px' }}>
                          <img src="/assets/arrows.svg" alt="" className="w-9 h-3 object-contain" style={{ filter: 'brightness(0) invert(1) opacity(0.6)' }} />
                        </div>
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                          <p className="text-white/40" style={{ fontSize: '4.5px' }}>tbhonest.net/send/{profile?.slug}</p>
                        </div>
                        {shareMode === 'gif' && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md" style={{ background: '#FFD60A' }}>
                            <span className="text-black font-extrabold" style={{ fontSize: '7px' }}>GIF</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Color swatches */}
                    <div className="flex gap-4 px-5 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                      {CARD_COLORS.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color)}
                          className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-90 transition-transform"
                        >
                          <div
                            className="w-10 h-10 rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${color.stops[0]}, ${color.stops[color.stops.length - 1]})`,
                              boxShadow: selectedColor.id === color.id ? `0 0 0 2px #181818, 0 0 0 3.5px ${color.stops[0]}` : 'none',
                              transform: selectedColor.id === color.id ? 'scale(1.1)' : 'scale(1)',
                              transition: 'all 0.2s ease',
                            }}
                          />
                          <span className="text-[10px] font-semibold" style={{ color: selectedColor.id === color.id ? '#FFF' : 'rgba(255,255,255,0.35)' }}>
                            {color.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Share button */}
                    <div className="px-5">
                      <button
                        onClick={() => {
                          if (shareMode === 'gif') handleShareGif()
                          else handleShareCard(selectedCard)
                        }}
                        className="w-full py-[17px] rounded-full text-white font-bold text-[16px] active:scale-95 transition-all flex items-center justify-center gap-2"
                        style={{
                          background: `linear-gradient(135deg, ${selectedColor.stops[0]}e0, ${selectedColor.stops[selectedColor.stops.length - 1]}e0)`,
                          boxShadow: `0 8px 24px ${selectedColor.stops[0]}40`,
                        }}
                      >
                        <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {shareMode === 'gif' ? 'Generate & Share GIF' : 'Share this card'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit prompt dialog ── */}
      {editingPrompt && (
        <div className="absolute inset-0 z-50 flex items-start justify-center px-6 pt-32">
          <div className="absolute inset-0 backdrop-enter" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} onClick={() => setEditingPrompt(false)} />
          <div className="dialog-enter relative w-[320px] bg-white rounded-[24px] p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex flex-col gap-1">
              <p className="text-center text-[17px] font-bold text-[#0D0D0D]">Edit your message</p>
              <p className="text-center text-[12px] text-[#888]">This shows on your share card</p>
            </div>
            <textarea
              autoFocus
              value={tempPrompt}
              onChange={e => setTempPrompt(e.target.value)}
              rows={3}
              maxLength={120}
              className="w-full bg-[#F5F5F7] rounded-[14px] px-4 py-3 text-[15px] font-medium text-[#0D0D0D] text-center outline-none resize-none border border-transparent focus:border-[#0D0D0D] transition-colors"
            />
            <p className="text-right text-[11px] text-[#AAA] -mt-2">{tempPrompt.length}/120</p>
            <div className="flex gap-2">
              <button onClick={() => setEditingPrompt(false)} className="flex-1 h-[44px] rounded-[14px] bg-[#F2F2F7] text-[#666] text-[14px] font-semibold active:scale-95 transition-transform">Cancel</button>
              <button onClick={() => { setPromptText(tempPrompt); setEditingPrompt(false) }} className="flex-1 h-[44px] rounded-[14px] bg-[#0D0D0D] text-white text-[14px] font-bold active:scale-95 transition-transform">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Game picker sheet ── */}
      {showGamePicker && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
          <div className={`absolute inset-0 ${gamePickerClosing ? 'backdrop-exit' : 'backdrop-enter'}`} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} onClick={() => { if (!gamePickerClosing) closeGamePicker() }} />
          <div className={`relative ${gamePickerClosing ? 'sheet-exit' : 'sheet-enter'} rounded-t-[32px] z-10 border-t border-white/[0.06]`} style={{ background: '#181818', maxHeight: '80vh' }}>
            <div className="relative z-10 overflow-y-auto" style={{ maxHeight: '80vh' }}>
              <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} /></div>
              <div className="px-5 pb-2">
                <p className="text-white text-[21px] font-extrabold tracking-tight">Choose your game</p>
                <p className="text-[#555] text-[12px] mt-0.5">Each game changes what appears on your share card</p>
              </div>
              <div className="flex flex-col gap-2 px-5 pb-10 pt-2">
                {ALL_CARD_TYPES.map(game => {
                  const isSelected = selectedCard.id === game.id
                  return (
                    <button
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[18px] active:scale-[0.98] transition-all text-left"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                        border: isSelected ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid transparent',
                      }}
                    >
                      <span className="text-[26px] flex-shrink-0">{game.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-extrabold text-[14px] tracking-tight">{game.title}</p>
                        <p className="text-[#555] text-[11px] mt-0.5 truncate">{game.subtitle}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Share-ready overlay ── shown after generation completes ── */}
      {shareReady && (
        <div className="absolute inset-0 z-[60] flex flex-col justify-end" onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
          <div className="absolute inset-0 backdrop-enter" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} onClick={() => setShareReady(null)} />
          <div className="relative sheet-enter rounded-t-[32px] z-10 px-5 pt-5 pb-10 border-t border-white/[0.06]" style={{ background: '#181818' }}>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="mb-5">
              <p className="text-white font-extrabold text-[18px]">{shareReady.isGif ? 'GIF ready!' : 'Image ready!'}</p>
              <p className="text-[#555] text-[12px] mt-0.5">Tap the button below to share</p>
            </div>
            <button
              onClick={handleShareReady}
              className="w-full py-[17px] rounded-full font-extrabold text-[17px] active:scale-95 transition-transform mb-3"
              style={{ background: '#ffffff', color: '#0D0D0D' }}
            >
              Share link
            </button>
            <button
              onClick={() => setShareReady(null)}
              className="w-full py-3 text-[#555] text-[14px] font-semibold active:opacity-70 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
