'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

type Message = {
  message_id: string
  content: string
  media_url: string
  isOpened: boolean
  created_at: string
  contains_media: boolean
  from_user: string
  to_user: string
}

const FLOATING_EMOJIS = [
  { src: '/assets/poop.svg',    size: 90,  x: 5,  y: 8,  rot: -15, dur: 7.2, delay: 0   },
  { src: '/assets/hot.svg',     size: 110, x: 75, y: 5,  rot: 12,  dur: 8.5, delay: 1.2 },
  { src: '/assets/nerd.svg',    size: 85,  x: 85, y: 35, rot: -8,  dur: 6.8, delay: 0.5 },
  { src: '/assets/Deamon.svg',  size: 120, x: 3,  y: 52, rot: 18,  dur: 9.1, delay: 2.1 },
  { src: '/assets/Excited.svg', size: 95,  x: 78, y: 65, rot: -20, dur: 7.6, delay: 0.8 },
  { src: '/assets/Skull.svg',   size: 80,  x: 12, y: 78, rot: 10,  dur: 8.0, delay: 1.7 },
  { src: '/assets/hot.svg',     size: 70,  x: 58, y: 88, rot: -12, dur: 6.5, delay: 3.0 },
  { src: '/assets/poop.svg',    size: 75,  x: 42, y: 2,  rot: 22,  dur: 7.9, delay: 2.5 },
]

const GLOBAL_STYLES = `
  @keyframes floaty {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-16px); }
  }
  textarea::placeholder { color: rgba(255,255,255,0.35); }
  * { -webkit-tap-highlight-color: transparent; }
`

function FloatingEmojis() {
  return (
    <>
      {FLOATING_EMOJIS.map((e, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${e.x}%`, top: `${e.y}%`,
          transform: `rotate(${e.rot}deg)`,
          pointerEvents: 'none', zIndex: 1,
        }}>
          <div style={{ animation: `floaty ${e.dur}s ease-in-out ${e.delay}s infinite` }}>
            <img src={e.src} alt="" style={{ width: `${e.size}px`, height: `${e.size}px`, display: 'block', opacity: 0.55 }} />
          </div>
        </div>
      ))}
    </>
  )
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width <= maxW) { cur = test }
    else { if (cur) lines.push(cur); cur = w }
  }
  if (cur) lines.push(cur)
  return lines
}

async function generateReplyCard(
  messageText: string,
  replyText: string,
  imageUrl: string | null,
  logoSrc: string,
  userPfp: string | null,
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const W = 1080, H = 1920
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    // 1. Blurred pfp background
    let pfpImg: HTMLImageElement | null = null
    if (userPfp) pfpImg = await loadImage(userPfp).catch(() => null)

    if (pfpImg) {
      ctx.save()
      ctx.filter = 'blur(48px) brightness(0.3) saturate(1.4)'
      ctx.drawImage(pfpImg, -80, -80, W + 160, H + 160)
      ctx.filter = 'none'
      ctx.restore()
    } else {
      ctx.fillStyle = '#0A0A0C'
      ctx.fillRect(0, 0, W, H)
    }

    // 2. Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.52)'
    ctx.fillRect(0, 0, W, H)

    // 3. Subtle radial vignette
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85)
    vignette.addColorStop(0, 'transparent')
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, W, H)

    // 4. Floating emoji SVGs
    const emojiPositions = [
      { src: '/assets/poop.svg',    size: 180, x: 60,  y: 120,  rot: -15, opacity: 0.18 },
      { src: '/assets/hot.svg',     size: 220, x: 780, y: 80,   rot: 12,  opacity: 0.18 },
      { src: '/assets/nerd.svg',    size: 160, x: 860, y: 600,  rot: -8,  opacity: 0.15 },
      { src: '/assets/Deamon.svg',  size: 240, x: 40,  y: 900,  rot: 18,  opacity: 0.18 },
      { src: '/assets/Excited.svg', size: 190, x: 800, y: 1200, rot: -20, opacity: 0.15 },
      { src: '/assets/Skull.svg',   size: 160, x: 100, y: 1500, rot: 10,  opacity: 0.15 },
    ]
    for (const e of emojiPositions) {
      const img = await loadImage(e.src).catch(() => null)
      if (!img) continue
      ctx.save()
      ctx.globalAlpha = e.opacity
      ctx.translate(e.x + e.size / 2, e.y + e.size / 2)
      ctx.rotate((e.rot * Math.PI) / 180)
      ctx.drawImage(img, -e.size / 2, -e.size / 2, e.size, e.size)
      ctx.restore()
    }
    ctx.globalAlpha = 1

    // 5. Logo — white tinted
    const logo = await loadImage(logoSrc).catch(() => null)
    if (logo) {
      const lw = 200, lh = Math.round(lw * logo.height / logo.width)
      const offscreen = document.createElement('canvas')
      offscreen.width = lw; offscreen.height = lh
      const oc = offscreen.getContext('2d')!
      oc.drawImage(logo, 0, 0, lw, lh)
      oc.globalCompositeOperation = 'source-in'
      oc.fillStyle = '#FFFFFF'
      oc.fillRect(0, 0, lw, lh)
      ctx.globalAlpha = 0.9
      ctx.drawImage(offscreen, (W - lw) / 2, 90, lw, lh)
      ctx.globalAlpha = 1
    }

    const hPad = 72, boxW = W - hPad * 2, innerPad = 48
    let y = 320

    // 6. Load message image if present
    let msgImg: HTMLImageElement | null = null
    if (imageUrl) msgImg = await loadImage(imageUrl).catch(() => null)

    // 7. Measure sender box
    ctx.font = '52px -apple-system, sans-serif'
    const msgLines = wrapText(ctx, messageText || '', boxW - innerPad * 2)
    const msgLineH = 68
    const imgH = msgImg ? Math.round((boxW - innerPad * 2) * 0.6) : 0
    const senderBoxH = innerPad + 60 + 20 + imgH + (imgH && messageText ? 28 : 0) + msgLines.length * msgLineH + innerPad

    // 8. Sender box — frosted glass
    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    roundRect(ctx, hPad, y, boxW, senderBoxH, 40)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    roundRect(ctx, hPad, y, boxW, senderBoxH, 40)
    ctx.stroke()

    // 9. Anon pill
    ctx.font = 'bold 40px -apple-system, sans-serif'
    const anonText = '🔒  ANONYMOUS'
    const anonW = ctx.measureText(anonText).width + 48
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    roundRect(ctx, hPad + innerPad, y + innerPad, anonW, 56, 28)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.textAlign = 'left'
    ctx.fillText(anonText, hPad + innerPad + 24, y + innerPad + 40)

    let contentY = y + innerPad + 56 + 24

    // 10. Message image
    if (msgImg) {
      ctx.save()
      roundRect(ctx, hPad + innerPad, contentY, boxW - innerPad * 2, imgH, 24)
      ctx.clip()
      ctx.drawImage(msgImg, hPad + innerPad, contentY, boxW - innerPad * 2, imgH)
      ctx.restore()
      contentY += imgH + (messageText ? 28 : 0)
    }

    // 11. Message text — white
    if (messageText) {
      ctx.font = '52px -apple-system, sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'left'
      msgLines.forEach((line, i) => {
        ctx.fillText(line, hPad + innerPad, contentY + msgLineH * i + 48)
      })
    }

    y += senderBoxH + 52

    // 12. Reply box — frosted with accent glow
    ctx.font = 'bold 68px -apple-system, sans-serif'
    const replyLines = wrapText(ctx, replyText, boxW - innerPad * 2)
    const replyLineH = 86
    const replyBoxH = innerPad + 60 + 28 + replyLines.length * replyLineH + innerPad

    // Glow behind reply box
    ctx.save()
    ctx.shadowColor = 'rgba(255,107,107,0.4)'
    ctx.shadowBlur = 60
    ctx.fillStyle = 'rgba(255,107,107,0.01)'
    roundRect(ctx, hPad, y, boxW, replyBoxH, 40)
    ctx.fill()
    ctx.restore()

    // Reply box fill
    ctx.fillStyle = 'rgba(255,255,255,0.13)'
    roundRect(ctx, hPad, y, boxW, replyBoxH, 40)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,107,107,0.35)'
    ctx.lineWidth = 2
    roundRect(ctx, hPad, y, boxW, replyBoxH, 40)
    ctx.stroke()

    // "ME" label
    ctx.font = 'bold 40px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255,107,107,0.9)'
    ctx.textAlign = 'left'
    ctx.fillText('ME', hPad + innerPad, y + innerPad + 42)

    // Reply text
    ctx.font = 'bold 68px -apple-system, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 8
    replyLines.forEach((line, i) => {
      ctx.fillText(line, hPad + innerPad, y + innerPad + 60 + 28 + replyLineH * i + 60)
    })
    ctx.shadowBlur = 0

    // 13. Bottom link
    ctx.font = '40px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.textAlign = 'center'
    ctx.fillText('tbhonest.net', W / 2, H - 80)

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}
async function generateMessageCard(
  messageText: string,
  imageUrl: string | null,
  logoSrc: string,
  userPfp: string | null,
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const W = 1080, H = 1920
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    // 1. Blurred pfp background
    let pfpImg: HTMLImageElement | null = null
    if (userPfp) pfpImg = await loadImage(userPfp).catch(() => null)

    if (pfpImg) {
      ctx.save()
      ctx.filter = 'blur(48px) brightness(0.3) saturate(1.4)'
      ctx.drawImage(pfpImg, -80, -80, W + 160, H + 160)
      ctx.filter = 'none'
      ctx.restore()
    } else {
      ctx.fillStyle = '#0D0D0D'
      ctx.fillRect(0, 0, W, H)
    }

    // 2. Dark overlay for readability
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, W, H)

    // 3. Subtle gradient vignette
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85)
    vignette.addColorStop(0, 'transparent')
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, W, H)

    // 4. Floating emoji SVGs — rasterize a few at fixed positions
    const emojiPositions = [
      { src: '/assets/poop.svg',    size: 180, x: 60,  y: 120,  rot: -15, opacity: 0.18 },
      { src: '/assets/hot.svg',     size: 220, x: 780, y: 80,   rot: 12,  opacity: 0.18 },
      { src: '/assets/nerd.svg',    size: 160, x: 860, y: 600,  rot: -8,  opacity: 0.15 },
      { src: '/assets/Deamon.svg',  size: 240, x: 40,  y: 900,  rot: 18,  opacity: 0.18 },
      { src: '/assets/Excited.svg', size: 190, x: 800, y: 1200, rot: -20, opacity: 0.15 },
      { src: '/assets/Skull.svg',   size: 160, x: 100, y: 1500, rot: 10,  opacity: 0.15 },
    ]
    for (const e of emojiPositions) {
      const img = await loadImage(e.src).catch(() => null)
      if (!img) continue
      ctx.save()
      ctx.globalAlpha = e.opacity
      ctx.translate(e.x + e.size / 2, e.y + e.size / 2)
      ctx.rotate((e.rot * Math.PI) / 180)
      ctx.drawImage(img, -e.size / 2, -e.size / 2, e.size, e.size)
      ctx.restore()
    }
    ctx.globalAlpha = 1

    // 5. Logo — white, centered at top
    const logo = await loadImage(logoSrc).catch(() => null)
    if (logo) {
      const lw = 220, lh = Math.round(lw * logo.height / logo.width)
      // Tint white
      const offscreen = document.createElement('canvas')
      offscreen.width = lw; offscreen.height = lh
      const oc = offscreen.getContext('2d')!
      oc.drawImage(logo, 0, 0, lw, lh)
      oc.globalCompositeOperation = 'source-in'
      oc.fillStyle = '#FFFFFF'
      oc.fillRect(0, 0, lw, lh)
      ctx.globalAlpha = 0.9
      ctx.drawImage(offscreen, (W - lw) / 2, 100, lw, lh)
      ctx.globalAlpha = 1
    }

    // 6. Anonymous pill
    ctx.font = 'bold 44px -apple-system, sans-serif'
    const pillText = '🔒  Anonymous message'
    const pillW = ctx.measureText(pillText).width + 64
    const pillH = 72
    const pillX = (W - pillW) / 2
    const pillY = 320
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.textAlign = 'center'
    ctx.fillText(pillText, W / 2, pillY + 48)

    // 7. Main content
    if (imageUrl) {
      const img = await loadImage(imageUrl).catch(() => null)
      if (img) {
        const imgS = 860
        const imgY = 450
        ctx.save()
        roundRect(ctx, (W - imgS) / 2, imgY, imgS, imgS, 48)
        ctx.clip()
        ctx.drawImage(img, (W - imgS) / 2, imgY, imgS, imgS)
        ctx.restore()
        // Subtle image border
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = 3
        roundRect(ctx, (W - imgS) / 2, imgY, imgS, imgS, 48)
        ctx.stroke()
      }
      if (messageText) {
        ctx.font = 'bold 72px -apple-system, sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0,0,0,0.6)'
        ctx.shadowBlur = 20
        const lines = wrapText(ctx, messageText, W - 180)
        lines.forEach((line, i) => ctx.fillText(line, W / 2, 1390 + i * 96))
        ctx.shadowBlur = 0
      }
    } else {
      // Big centered text with auto-size
      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 28
      let fontSize = 210
      while (fontSize > 48) {
        ctx.font = `bold ${fontSize}px -apple-system, sans-serif`
        const lines = wrapText(ctx, messageText, W - 180)
        const totalH = lines.length * fontSize * 1.25
        if (totalH < H - 600) {
          const startY = H / 2 - totalH / 2 + fontSize * 0.8
          lines.forEach((line, i) =>
            ctx.fillText(line, W / 2, startY + i * fontSize * 1.25)
          )
          break
        }
        fontSize -= 8
      }
      ctx.shadowBlur = 0
    }

    // 8. Bottom link pill
    ctx.font = '40px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.textAlign = 'center'
    ctx.fillText('tbhonest.net', W / 2, H - 80)

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}
async function shareBlob(blob: Blob) {
  const file = new File([blob], 'tbh.png', { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (e: any) {
      if (e?.name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 15000)
}

export default function ReadMessageScreen() {
  const router = useRouter()
  const params = useParams()
  const messageId = params?.id as string

  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLink, setUserLink] = useState('')
  const [userPfp, setUserPfp] = useState<string | null>(null)

  const [imageBlurred, setImageBlurred] = useState(true)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [sharing, setSharing] = useState(false)

  const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"

  const logoSrc = typeof window !== 'undefined'
    ? `${window.location.origin}/assets/TBH_Title_Logo.svg`
    : '/assets/TBH_Title_Logo.svg'

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data: msg } = await supabaseClient
        .from('messages').select('*').eq('message_id', messageId).single()
      if (msg) setMessage(msg)

      const { data: profile } = await supabaseClient
        .from('users_table').select('slug, pfp').eq('user_id', session.user.id).single()
      if (profile?.slug) setUserLink(`${window.location.origin}/send/${profile.slug}`)
      if (profile?.pfp) setUserPfp(profile.pfp)

      setLoading(false)
    }
    load()
  }, [messageId, router])

  const isImageMessage = message?.content?.startsWith('[IMAGE](') ?? false
  const imageUrl = isImageMessage
    ? message!.content.match(/\[IMAGE\]\(([^)]+)\)/)?.[1] ?? null
    : null
  const textContent = isImageMessage
    ? message!.content.substring(message!.content.indexOf(')') + 1).trimStart()
    : message?.content ?? ''

  const handleShareMessage = async () => {
  if (!message || sharing) return
  setSharing(true)
  try {
    const blob = await generateMessageCard(textContent, imageUrl, logoSrc, userPfp)
    await shareBlob(blob)
  } finally { setSharing(false) }
}


 const handleSendReply = async () => {
  if (!replyText.trim() || replySending) return
  setReplySending(true)
  try {
    const blob = await generateReplyCard(textContent, replyText, imageUrl, logoSrc, userPfp)
    await shareBlob(blob)
    setShowReply(false)
    setReplyText('')
  } finally { setReplySending(false) }
}

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!message) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
        <p className="text-[18px] font-bold text-[#888]">Message not found</p>
        <button onClick={() => router.back()} className="text-sm underline text-[#666]">Go back</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden" style={{ fontFamily: font }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Background: blurred pfp ── */}
      <div className="absolute inset-0 z-0">
        {userPfp ? (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${userPfp})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(32px) brightness(0.35)',
            transform: 'scale(1.1)',
          }} />
        ) : (
          <div className="absolute inset-0 bg-[#0D0D0D]" />
        )}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
      </div>

      {/* ── Floating emojis behind UI ── */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <FloatingEmojis />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center px-4 pt-12 pb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="flex-1" />

        {/* ── Message card ── */}
        <div className="px-5 mb-6">
          <div style={{
            background: 'rgba(20,20,20,0.75)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderRadius: '28px',
            padding: '24px',
          }}>

            {/* Image row */}
            {isImageMessage && imageUrl && (
              <>
                <button
                  onClick={() => setShowFullscreen(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-[16px] active:scale-[0.98] transition-transform mb-4"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-black/30 flex-shrink-0">
                    <img
                      src={imageUrl} alt=""
                      className="w-full h-full object-cover"
                      style={{ filter: imageBlurred ? 'blur(10px)' : 'none', transition: 'filter 0.3s' }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-[15px] text-white">Photo</p>
                    <p className="text-[11px] text-white/50">Tap to view fullscreen</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setImageBlurred(!imageBlurred) }}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                    style={{ background: imageBlurred ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }}
                  >
                    {imageBlurred ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#000" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="#000" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </button>
                <div className="w-full h-[1px] mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </>
            )}

            {/* Message text */}
            {textContent && (
              <p
                className="w-full text-center font-semibold text-white"
                style={{
                  fontSize: textContent.length > 100 ? '18px' : textContent.length > 50 ? '24px' : '32px',
                  lineHeight: '1.3',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {textContent}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1" />

        {/* ── Bottom buttons ── */}
        <div className="px-5 pb-10 flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => setShowReply(true)}
              className="flex-1 py-4 rounded-[32px] flex items-center justify-center gap-2 font-semibold text-[15px] text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4l-4 4v-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Reply
            </button>

            <button
              onClick={handleShareMessage}
              disabled={sharing}
              className="flex-1 py-4 rounded-[32px] flex items-center justify-center gap-2 font-semibold text-[15px] text-white active:scale-95 transition-transform disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF431D)' }}
            >
              {sharing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="18" cy="5" r="3" stroke="white" strokeWidth="2"/>
                    <circle cx="6" cy="12" r="3" stroke="white" strokeWidth="2"/>
                    <circle cx="18" cy="19" r="3" stroke="white" strokeWidth="2"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="white" strokeWidth="2"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="white" strokeWidth="2"/>
                  </svg>
                  Share
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Fullscreen image viewer ── */}
      {showFullscreen && imageUrl && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 pt-12 pb-4">
            <button
              onClick={() => setShowFullscreen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <img src="/assets/TBH_Title_Logo.svg" alt="TBH" className="h-6 invert" />
            <div className="w-10" />
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" style={{ touchAction: 'pinch-zoom' }} />
          </div>
          {textContent && (
            <div className="px-5 pb-10">
              <div className="rounded-[20px] px-5 py-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
                <p className="text-white text-center text-[16px] font-medium">{textContent}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Reply bottom sheet ── */}
      {showReply && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowReply(false)} />

          {/* Sheet with blurred pfp background */}
          <div className="relative z-10 rounded-t-[32px] overflow-hidden" style={{ maxHeight: '85vh' }}>

            {/* Blurred pfp background layer */}
            {userPfp && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${userPfp})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(28px) brightness(0.3)',
                transform: 'scale(1.15)',
              }} />
            )}
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />

            {/* Floating emojis inside sheet */}
            <div className="absolute inset-0 overflow-hidden">
              <FloatingEmojis />
            </div>

            {/* Sheet content */}
            <div className="relative z-10 pb-10">
              <div className="flex justify-center pt-3 pb-5">
                <div className="w-10 h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />
              </div>

              <div className="px-5">
                <p className="text-center font-bold text-[16px] text-white mb-1">Reply publicly</p>
                <p className="text-center text-[12px] mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Your reply will be shared as a story card
                </p>

                {/* Original message preview */}
                <div className="rounded-[14px] p-3 mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-[13px] line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {(imageUrl ? '📷 ' : '') + (textContent || '')}
                  </p>
                </div>

                {/* Reply input + send */}
                <div className="flex items-end gap-3">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Your reply..."
                    rows={3}
                    className="flex-1 rounded-[16px] px-4 py-3 text-[16px] text-white outline-none resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      minHeight: '52px', maxHeight: '140px',
                      fontFamily: font,
                    }}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || replySending}
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-90 transition-transform"
                    style={{ background: replyText.trim() ? 'linear-gradient(135deg, #FF6B6B, #FF431D)' : 'rgba(255,255,255,0.15)' }}
                  >
                    {replySending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}