'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

// ─── Types ────────────────────────────────────────────────────────────────────
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

// Generate reply share card (dark background, sender box + reply box)
async function generateReplyCard(
  messageText: string,
  replyText: string,
  imageUrl: string | null,
  logoSrc: string,
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const W = 1080, H = 1920
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Dark background with gradient glow
    ctx.fillStyle = '#0A0A0C'
    ctx.fillRect(0, 0, W, H)

    const g1 = ctx.createRadialGradient(W, 0, 0, W, 0, W * 0.8)
    g1.addColorStop(0, 'rgba(255,107,107,0.15)')
    g1.addColorStop(1, 'transparent')
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

    const g2 = ctx.createRadialGradient(0, H, 0, 0, H, W * 0.7)
    g2.addColorStop(0, 'rgba(77,150,255,0.12)')
    g2.addColorStop(1, 'transparent')
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H)

    // Logo
    const logo = await loadImage(logoSrc).catch(() => null)
    if (logo) {
      const lw = 180, lh = Math.round(lw * logo.height / logo.width)
      ctx.drawImage(logo, (W - lw) / 2, 80, lw, lh)
    }

    const hPad = 72, boxW = W - hPad * 2, innerPad = 48
    let y = 280

    // ── Sender box ────────────────────────────────────────────────────────────
    // Load image if present
    let msgImg: HTMLImageElement | null = null
    if (imageUrl) msgImg = await loadImage(imageUrl).catch(() => null)

    // Measure sender box height
    ctx.font = '52px -apple-system, sans-serif'
    const msgLines = wrapText(ctx, messageText || '', boxW - innerPad * 2)
    const msgLineH = 66
    const imgH = msgImg ? Math.round((boxW - innerPad * 2) * 0.6) : 0
    const senderBoxH = innerPad + 56 + 16 + imgH + (imgH && messageText ? 24 : 0) + msgLines.length * msgLineH + innerPad

    // Draw sender box
    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    roundRect(ctx, hPad, y, boxW, senderBoxH, 36)
    ctx.fill()

    // Anon label pill
    ctx.font = 'bold 38px -apple-system, sans-serif'
    const anonText = '🔒 ANONYMOUS'
    const anonW = ctx.measureText(anonText).width + 40
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    roundRect(ctx, hPad + innerPad, y + innerPad, anonW, 52, 26)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText(anonText, hPad + innerPad + 20, y + innerPad + 36)

    let contentY = y + innerPad + 52 + 20

    // Draw image if present
    if (msgImg) {
      ctx.save()
      roundRect(ctx, hPad + innerPad, contentY, boxW - innerPad * 2, imgH, 20)
      ctx.clip()
      ctx.drawImage(msgImg, hPad + innerPad, contentY, boxW - innerPad * 2, imgH)
      ctx.restore()
      contentY += imgH + (messageText ? 24 : 0)
    }

    // Draw message text
    if (messageText) {
      ctx.font = '52px -apple-system, sans-serif'
      ctx.fillStyle = 'rgba(20,20,30,0.9)'
      msgLines.forEach((line, i) => {
        ctx.fillText(line, hPad + innerPad, contentY + msgLineH * i + 48)
      })
    }

    y += senderBoxH + 48

    // ── Reply box ─────────────────────────────────────────────────────────────
    ctx.font = 'bold 68px -apple-system, sans-serif'
    const replyLines = wrapText(ctx, replyText, boxW - innerPad * 2)
    const replyLineH = 82
    const replyBoxH = innerPad + 52 + 24 + replyLines.length * replyLineH + innerPad

    const rg = ctx.createLinearGradient(0, 0, W, H)
    rg.addColorStop(0, 'rgba(255,107,107,0.7)')
    rg.addColorStop(1, 'rgba(77,150,255,0.65)')
    ctx.fillStyle = rg
    roundRect(ctx, hPad, y, boxW, replyBoxH, 36)
    ctx.fill()

    ctx.font = 'bold 38px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('ME', hPad + innerPad, y + innerPad + 38)

    ctx.font = 'bold 68px -apple-system, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    replyLines.forEach((line, i) => {
      ctx.fillText(line, hPad + innerPad, y + innerPad + 52 + 24 + replyLineH * i + 60)
    })

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}

// Generate message share card (gradient bg + big text)
async function generateMessageCard(
  messageText: string,
  imageUrl: string | null,
  logoSrc: string,
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const W = 1080, H = 1920
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Gradient background
    const bg = ctx.createRadialGradient(0, 0, 0, W * 0.5, H * 0.5, Math.hypot(W, H))
    bg.addColorStop(0, '#FF6B6B')
    bg.addColorStop(0.5, '#FFE66D')
    bg.addColorStop(1, '#4D96FF')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Logo
    const logo = await loadImage(logoSrc).catch(() => null)
    if (logo) {
      const lw = 200, lh = Math.round(lw * logo.height / logo.width)
      ctx.drawImage(logo, (W - lw) / 2, 80, lw, lh)
    }

    if (imageUrl) {
      const img = await loadImage(imageUrl).catch(() => null)
      if (img) {
        const imgS = 800
        ctx.save()
        roundRect(ctx, (W - imgS) / 2, 350, imgS, imgS, 24)
        ctx.clip()
        ctx.drawImage(img, (W - imgS) / 2, 350, imgS, imgS)
        ctx.restore()
      }
      // Text below image
      if (messageText) {
        ctx.font = 'bold 70px -apple-system, sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0,0,0,0.4)'
        ctx.shadowBlur = 16
        const lines = wrapText(ctx, messageText, W - 160)
        lines.forEach((line, i) => ctx.fillText(line, W / 2, 1250 + i * 90))
      }
    } else {
      // Big centered text
      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 24

      // Auto-size text
      let fontSize = 200
      while (fontSize > 40) {
        ctx.font = `bold ${fontSize}px -apple-system, sans-serif`
        const lines = wrapText(ctx, messageText, W - 160)
        const totalH = lines.length * fontSize * 1.2
        if (totalH < H - 400) {
          lines.forEach((line, i) => ctx.fillText(line, W / 2, H / 2 - totalH / 2 + i * fontSize * 1.2 + fontSize))
          break
        }
        fontSize -= 8
      }
    }

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}

// Share blob — tries native share sheet, falls back to new tab
async function shareBlob(blob: Blob, shareLink: string) {
  const file = new File([blob], 'tbh.png', { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: 'TBH', text: shareLink, files: [file] })
      return
    } catch (e: any) {
      if (e?.name === 'AbortError') return
    }
  }
  // Fallback: open in new tab (mobile can long-press to share)
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 15000)
}

// ─── ReadMessageScreen ────────────────────────────────────────────────────────
export default function ReadMessageScreen() {
  const router = useRouter()
  const params = useParams()
  const messageId = params?.id as string

  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLink, setUserLink] = useState('')

  // Image state
  const [imageBlurred, setImageBlurred] = useState(true)
  const [showFullscreen, setShowFullscreen] = useState(false)

  // Reply sheet
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySending, setReplySending] = useState(false)

  // Share state
  const [sharing, setSharing] = useState(false)

  const logoSrc = typeof window !== 'undefined'
    ? `${window.location.origin}/assets/TBH_Title_Logo.svg`
    : '/assets/TBH_Title_Logo.svg'

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data: msg } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('message_id', messageId)
        .single()

      if (msg) setMessage(msg)

      // Get user's share link
      const { data: profile } = await supabaseClient
        .from('users_table')
        .select('slug')
        .eq('user_id', session.user.id)
        .single()

      if (profile?.slug) {
        setUserLink(`${window.location.origin}/send/${profile.slug}`)
      }

      setLoading(false)
    }
    load()
  }, [messageId, router])

  const isImageMessage = message?.content?.startsWith('[IMAGE](') ?? false
  const imageUrl = isImageMessage
    ? message!.content.substring(7, message!.content.indexOf(')'))
    : null
  const textContent = isImageMessage
    ? message!.content.substring(message!.content.indexOf(')') + 2)
    : message?.content ?? ''

  // Gradient for background
  const grad = 'linear-gradient(135deg, #FF6B6B, #FFE66D, #4D96FF)'

  const handleShareMessage = async () => {
    if (!message || sharing) return
    setSharing(true)
    try {
      const blob = await generateMessageCard(textContent, imageUrl, logoSrc)
      await shareBlob(blob, userLink)
    } finally { setSharing(false) }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || replySending) return
    setReplySending(true)
    try {
      const blob = await generateReplyCard(textContent, replyText, imageUrl, logoSrc)
      await shareBlob(blob, userLink)
      setShowReply(false)
      setReplyText('')
    } finally { setReplySending(false) }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!message) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <p className="text-[18px] font-bold text-[#888]">Message not found</p>
        <button onClick={() => router.back()} className="text-sm underline text-[#AAA]">Go back</button>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ── Blurred gradient background ── */}
      <div className="absolute inset-0 z-0" style={{ background: grad, filter: 'blur(0px)' }}>
        <div className="absolute inset-0" style={{ background: grad, opacity: 0.85 }} />
      </div>

      {/* ── Content ── */}
      <div className={`relative z-10 flex flex-col min-h-screen ${showReply ? 'blur-sm' : ''}`}>

        {/* Top bar */}
        <div className="flex items-center px-4 pt-12 pb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── White message card ── */}
        <div className="px-5 mb-6">
          <div className="bg-white rounded-[28px] p-5 shadow-2xl">

            {/* Image row */}
            {isImageMessage && imageUrl && (
              <>
                <button
                  onClick={() => setShowFullscreen(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-[#F5F5F5] active:scale-[0.98] transition-transform mb-4"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-[#EEE] flex-shrink-0 relative">
                    <img
                      src={imageUrl} alt=""
                      className="w-full h-full object-cover"
                      style={{ filter: imageBlurred ? 'blur(10px)' : 'none', transition: 'filter 0.3s' }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-[15px] text-[#0D0D0D]">Photo</p>
                    <p className="text-[11px] text-[#888]">Tap to view fullscreen</p>
                  </div>
                  {/* Eye toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); setImageBlurred(!imageBlurred) }}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: imageBlurred ? '#0D0D0D' : '#F2F2F2' }}
                  >
                    {imageBlurred ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </button>
                <div className="w-full h-[1px] bg-[#F0F0F0] mb-4" />
              </>
            )}

            {/* Message text */}
            {textContent && (
              <p
                className="w-full text-center font-semibold text-[#0D0D0D]"
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

        {/* ── Bottom buttons ── */}
        <div className="px-5 pb-10 flex flex-col gap-3">

          {/* Discover who sent CTA */}
          <button
            className="w-full py-4 rounded-[32px] text-white font-bold text-[16px] active:scale-95 transition-transform"
            style={{ background: '#0D0D0D' }}
          >
            🔍 Discover who sent this
          </button>

          <div className="flex gap-3">
            {/* Reply */}
            <button
              onClick={() => setShowReply(true)}
              className="flex-1 py-4 rounded-[32px] bg-white border border-[#E8E8E8] flex items-center justify-center gap-2 font-semibold text-[15px] text-[#0D0D0D] active:scale-95 transition-transform"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4l-4 4v-4z" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Reply
            </button>

            {/* Share */}
            <button
              onClick={handleShareMessage}
              disabled={sharing}
              className="flex-1 py-4 rounded-[32px] flex items-center justify-center gap-2 font-semibold text-[15px] text-white active:scale-95 transition-transform disabled:opacity-60"
              style={{ background: grad }}
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
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-12 pb-4">
            <button
              onClick={() => setShowFullscreen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/15"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {/* Logo */}
            <img src="/assets/TBH_Title_Logo.svg" alt="TBH" className="h-6 invert" />
            <div className="w-10" />
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={imageUrl} alt=""
              className="max-w-full max-h-full object-contain"
              style={{ touchAction: 'pinch-zoom' }}
            />
          </div>

          {/* Caption */}
          {textContent && (
            <div className="px-5 pb-10">
              <div className="bg-black/55 rounded-[20px] px-5 py-4">
                <p className="text-white text-center text-[16px] font-medium">{textContent}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Reply bottom sheet ── */}
      {showReply && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReply(false)} />
          <div className="relative bg-white rounded-t-[28px] z-10 pb-10">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-5">
              <div className="w-10 h-[4px] rounded-full bg-[#DDD]" />
            </div>

            <div className="px-5">
              <p className="text-center font-bold text-[16px] text-[#0D0D0D] mb-1">Reply publicly</p>
              <p className="text-center text-[12px] text-[#888] mb-5">Your reply will be shared as a story card</p>

              {/* Original message preview */}
              <div className="bg-[#F5F5F5] rounded-[14px] p-3 mb-4">
                <p className="text-[13px] text-[#666] line-clamp-2">
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
                  className="flex-1 bg-[#F2F2F2] rounded-[16px] px-4 py-3 text-[16px] text-[#0D0D0D] outline-none resize-none"
                  style={{ minHeight: '52px', maxHeight: '140px' }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || replySending}
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-90 transition-transform"
                  style={{ background: replyText.trim() ? '#0D0D0D' : '#DDD' }}
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
      )}
    </main>
  )
}