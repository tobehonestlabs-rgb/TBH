'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import { useTranslation } from '@/lib/i18n'

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

// ── Named Constants for Story Cards (1080 × 1920) ───────────────────────────
const STORY_CANVAS_WIDTH = 1080
const STORY_CANVAS_HEIGHT = 1920

// Arrière-plan & voile
const BG_FALLBACK_COLOR = '#0D0D0D'
const BG_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.52)'
const BG_VIGNETTE_COLOR = 'rgba(0, 0, 0, 0.40)'
const BG_VIGNETTE_INNER_RATIO = 0.20
const BG_VIGNETTE_OUTER_RATIO = 0.85
const BG_EXPANSION_PADDING = 60
const BLUR_PASS_COUNT = 3
const BLUR_PASS_RADIUS = 4

// Logo & Emojis décoratifs
const LOGO_WIDTH = 220
const LOGO_TOP_Y = 100
const EMOJI_DECORATIONS = [
  { src: '/assets/poop.svg',    size: 180, x: 60,  y: 120,  rot: -15, opacity: 0.18 },
  { src: '/assets/hot.svg',     size: 220, x: 780, y: 80,   rot: 12,  opacity: 0.18 },
  { src: '/assets/nerd.svg',    size: 160, x: 860, y: 600,  rot: -8,  opacity: 0.15 },
  { src: '/assets/Deamon.svg',  size: 240, x: 40,  y: 900,  rot: 18,  opacity: 0.18 },
  { src: '/assets/Excited.svg', size: 190, x: 800, y: 1200, rot: -20, opacity: 0.15 },
  { src: '/assets/Skull.svg',   size: 160, x: 100, y: 1500, rot: 10,  opacity: 0.15 },
]

// Pilule Anonymous Message
const ANONYMOUS_PILL_TEXT = '🔒  Anonymous message'
const ANONYMOUS_PILL_FONT = 'bold 44px -apple-system, BlinkMacSystemFont, sans-serif'
const ANONYMOUS_PILL_PADDING_X = 32
const ANONYMOUS_PILL_HEIGHT = 72
const ANONYMOUS_PILL_TOP_Y = 320
const ANONYMOUS_PILL_BG = 'rgba(255, 255, 255, 0.12)'
const ANONYMOUS_PILL_TEXT_COLOR = 'rgba(255, 255, 255, 0.70)'

// Boîte de message globale
const CARD_BOX_WIDTH = 860
const CARD_BOX_RADIUS = 40
const CARD_BOX_SHADOW_COLOR = 'rgba(0, 0, 0, 0.50)'
const CARD_BOX_SHADOW_BLUR = 40
const CARD_BOX_SHADOW_OFFSET_Y = 15

// Bandeau noir supérieur
const BANDEAU_TEXT = 'Envoie moi un message anonyme et on chat anonymement!!'
const BANDEAU_FONT = 'bold 44px -apple-system, BlinkMacSystemFont, sans-serif'
const BANDEAU_BG_COLOR = '#111111'
const BANDEAU_TEXT_COLOR = '#FFFFFF'
const BANDEAU_PADDING_X = 30
const BANDEAU_PADDING_Y = 24
const BANDEAU_LINE_HEIGHT = 56

// Zone blanche du message
const WHITE_BOX_BG_COLOR = '#FFFFFF'
const WHITE_BOX_TEXT_COLOR = '#111111'
const WHITE_BOX_PADDING_X = 50
const WHITE_BOX_PADDING_Y = 50
const WHITE_BOX_MIN_HEIGHT = 140
const WHITE_BOX_FONT_MAX = 72
const WHITE_BOX_FONT_MIN = 36
const WHITE_BOX_LINE_HEIGHT_RATIO = 1.3
const WHITE_BOX_TEXT_SHADOW_COLOR = 'rgba(0, 0, 0, 0.20)'
const WHITE_BOX_TEXT_SHADOW_BLUR = 12

// CTA bas de page
const CTA_TEXT = 'Send me something anonymously'
const CTA_FONT = 'bold 46px -apple-system, BlinkMacSystemFont, sans-serif'
const CTA_LINE_HEIGHT = 56
const CTA_ARROWS_HEIGHT = 64
const CTA_BOTTOM_MARGIN = 90

// ── Helpers Canvas ───────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function supportsCanvasFilter(): boolean {
  try {
    const c = document.createElement('canvas')
    c.width = 1; c.height = 1
    const ctx = c.getContext('2d')!
    ctx.filter = 'brightness(0)'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1, 1)
    const r = ctx.getImageData(0, 0, 1, 1).data[0]
    return r === 0
  } catch { return false }
}

function applySoftBlur(data: Uint8ClampedArray, w: number, h: number, radius: number) {
  const tmp = new Uint8ClampedArray(data.length)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rv = 0, gv = 0, bv = 0, n = 0
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = Math.min(w - 1, Math.max(0, x + dx))
        const p = (y * w + nx) * 4
        rv += data[p]; gv += data[p + 1]; bv += data[p + 2]; n++
      }
      const p = (y * w + x) * 4
      tmp[p] = rv / n; tmp[p + 1] = gv / n; tmp[p + 2] = bv / n; tmp[p + 3] = data[p + 3]
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rv = 0, gv = 0, bv = 0, n = 0
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = Math.min(h - 1, Math.max(0, y + dy))
        const p = (ny * w + x) * 4
        rv += tmp[p]; gv += tmp[p + 1]; bv += tmp[p + 2]; n++
      }
      const p = (y * w + x) * 4
      data[p] = rv / n; data[p + 1] = gv / n; data[p + 2] = bv / n
    }
  }
}

function buildBlurCanvas(img: HTMLImageElement, W: number, H: number): HTMLCanvasElement {
  const sw = Math.max(4, W >> 3)
  const sh = Math.max(4, H >> 3)
  const small = document.createElement('canvas')
  small.width = sw; small.height = sh
  const sctx = small.getContext('2d')!
  sctx.drawImage(img, 0, 0, sw, sh)

  const imgData = sctx.getImageData(0, 0, sw, sh)
  for (let pass = 0; pass < BLUR_PASS_COUNT; pass++) {
    applySoftBlur(imgData.data, sw, sh, BLUR_PASS_RADIUS)
  }
  sctx.putImageData(imgData, 0, 0)

  const m1 = document.createElement('canvas')
  m1.width = Math.max(2, W >> 2); m1.height = Math.max(2, H >> 2)
  m1.getContext('2d')!.drawImage(small, 0, 0, m1.width, m1.height)

  const m2 = document.createElement('canvas')
  m2.width = Math.max(2, W >> 1); m2.height = Math.max(2, H >> 1)
  m2.getContext('2d')!.drawImage(m1, 0, 0, m2.width, m2.height)

  const out = document.createElement('canvas')
  out.width = W + BG_EXPANSION_PADDING * 2; out.height = H + BG_EXPANSION_PADDING * 2
  out.getContext('2d')!.drawImage(m2, 0, 0, out.width, out.height)
  return out
}

function drawBlurredBackground(
  ctx: CanvasRenderingContext2D,
  pfpImg: HTMLImageElement | null,
  W: number,
  H: number,
  blurTmp: HTMLCanvasElement | null,
  hasFilter: boolean,
  extra = 0,
) {
  const pad = BG_EXPANSION_PADDING + extra
  if (pfpImg) {
    if (hasFilter) {
      ctx.save()
      ctx.filter = 'blur(40px) brightness(0.35)'
      ctx.drawImage(pfpImg, -pad, -pad, W + pad * 2, H + pad * 2)
      ctx.filter = 'none'
      ctx.restore()
    } else if (blurTmp) {
      ctx.save()
      ctx.globalAlpha = 1
      ctx.drawImage(blurTmp, -pad, -pad, W + pad * 2, H + pad * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.50)'
      ctx.fillRect(-pad, -pad, W + pad * 2, H + pad * 2)
      ctx.restore()
    }
  } else {
    ctx.fillStyle = BG_FALLBACK_COLOR
    ctx.fillRect(0, 0, W, H)
  }

  // Voile sombre uniforme
  ctx.fillStyle = BG_OVERLAY_COLOR
  ctx.fillRect(0, 0, W, H)

  // Vignette radiale
  const vignette = ctx.createRadialGradient(
    W / 2, H / 2, H * BG_VIGNETTE_INNER_RATIO,
    W / 2, H / 2, H * BG_VIGNETTE_OUTER_RATIO,
  )
  vignette.addColorStop(0, 'transparent')
  vignette.addColorStop(1, BG_VIGNETTE_COLOR)
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, W, H)
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

function roundTopCornersRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapTextWithWordBreak(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let cur = ''

  for (const w of words) {
    if (ctx.measureText(w).width > maxW) {
      if (cur) { lines.push(cur); cur = '' }
      let chunk = ''
      for (const char of w) {
        const candidate = chunk + char
        if (ctx.measureText(candidate).width <= maxW) {
          chunk = candidate
        } else {
          if (chunk) lines.push(chunk)
          chunk = char
        }
      }
      cur = chunk
      continue
    }
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width <= maxW) {
      cur = test
    } else {
      if (cur) lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const imgRatio = img.width / img.height
  const boxRatio = w / h
  let sx = 0, sy = 0, sw = img.width, sh = img.height
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / boxRatio
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function drawImageCoverOptionallyBlurred(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
  blurred: boolean,
) {
  if (!blurred) { drawImageCover(ctx, img, x, y, w, h); return }
  const off = document.createElement('canvas')
  off.width = w; off.height = h
  const octx = off.getContext('2d')!
  octx.filter = 'blur(22px)'
  octx.imageSmoothingEnabled = true
  drawImageCover(octx, img, -24, -24, w + 48, h + 48)
  octx.filter = 'none'
  ctx.drawImage(off, x, y, w, h)
}

async function drawSendMeCta(ctx: CanvasRenderingContext2D, W: number, H: number, arrowsSrc: string) {
  ctx.font = CTA_FONT
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.textAlign = 'center'
  const ctaLines = wrapTextWithWordBreak(ctx, CTA_TEXT, W - 160)
  const ctaLineH = CTA_LINE_HEIGHT
  const arrowsH = CTA_ARROWS_HEIGHT
  const bottomMargin = CTA_BOTTOM_MARGIN
  const arrowsY = H - bottomMargin - arrowsH
  const ctaStartY = arrowsY - 24 - (ctaLines.length - 1) * ctaLineH
  ctaLines.forEach((line, i) => ctx.fillText(line, W / 2, ctaStartY + i * ctaLineH))

  const arrowsImgEl = await loadImage(arrowsSrc).catch(() => null)
  if (arrowsImgEl) {
    const aw = Math.round(arrowsH * arrowsImgEl.width / arrowsImgEl.height)
    const offArrows = document.createElement('canvas')
    offArrows.width = aw; offArrows.height = arrowsH
    const ocArrows = offArrows.getContext('2d')!
    ocArrows.drawImage(arrowsImgEl, 0, 0, aw, arrowsH)
    ocArrows.globalCompositeOperation = 'source-in'
    ocArrows.fillStyle = '#FFFFFF'
    ocArrows.fillRect(0, 0, aw, arrowsH)
    ctx.globalAlpha = 0.9
    ctx.drawImage(offArrows, (W - aw) / 2, arrowsY, aw, arrowsH)
    ctx.globalAlpha = 1
  }
}

// ─── generateReplyCard ─────────────────────────────────────────────────

async function generateReplyCard(
  messageText: string,
  replyText: string,
  imageUrl: string | null,
  logoSrc: string,
  userPfp: string | null,
  arrowsSrc: string,
  blurImage = false,
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const W = STORY_CANVAS_WIDTH, H = STORY_CANVAS_HEIGHT
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    const hasFilter = supportsCanvasFilter()
    let pfpImg: HTMLImageElement | null = null
    if (userPfp) pfpImg = await loadImage(userPfp).catch(() => null)

    let blurTmp: HTMLCanvasElement | null = null
    if (pfpImg && !hasFilter) {
      blurTmp = buildBlurCanvas(pfpImg, W, H)
    }

    // 1. Arrière-plan flouté avec voile sombre et vignette
    drawBlurredBackground(ctx, pfpImg, W, H, blurTmp, hasFilter)

    // 2. Emojis décoratifs
    for (const e of EMOJI_DECORATIONS) {
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

    // 3. Logo TBH
    const logo = await loadImage(logoSrc).catch(() => null)
    if (logo) {
      const lw = LOGO_WIDTH, lh = Math.round(lw * logo.height / logo.width)
      const offscreen = document.createElement('canvas')
      offscreen.width = lw; offscreen.height = lh
      const oc = offscreen.getContext('2d')!
      oc.drawImage(logo, 0, 0, lw, lh)
      oc.globalCompositeOperation = 'source-in'
      oc.fillStyle = '#FFFFFF'
      oc.fillRect(0, 0, lw, lh)
      ctx.globalAlpha = 0.9
      ctx.drawImage(offscreen, (W - lw) / 2, LOGO_TOP_Y, lw, lh)
      ctx.globalAlpha = 1
    }

    const hPad = 72, boxW = W - hPad * 2, innerPad = 48
    let y = 320

    let msgImg: HTMLImageElement | null = null
    if (imageUrl) msgImg = await loadImage(imageUrl).catch(() => null)

    ctx.font = '52px -apple-system, BlinkMacSystemFont, sans-serif'
    const msgLines = wrapTextWithWordBreak(ctx, messageText || '', boxW - innerPad * 2)
    const msgLineH = 68
    const imgSize = boxW - innerPad * 2
    const imgH = msgImg ? imgSize : 0
    const senderBoxH = innerPad + 60 + 20 + imgH + (imgH && messageText ? 28 : 0) + msgLines.length * msgLineH + innerPad

    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    roundRect(ctx, hPad, y, boxW, senderBoxH, 40)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    roundRect(ctx, hPad, y, boxW, senderBoxH, 40)
    ctx.stroke()

    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif'
    const anonText = '🔒  ANONYMOUS'
    const anonW = ctx.measureText(anonText).width + 48
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    roundRect(ctx, hPad + innerPad, y + innerPad, anonW, 56, 28)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.textAlign = 'left'
    ctx.fillText(anonText, hPad + innerPad + 24, y + innerPad + 40)

    let contentY = y + innerPad + 56 + 24

    if (msgImg) {
      ctx.save()
      roundRect(ctx, hPad + innerPad, contentY, imgSize, imgSize, 24)
      ctx.clip()
      drawImageCoverOptionallyBlurred(ctx, msgImg, hPad + innerPad, contentY, imgSize, imgSize, blurImage)
      ctx.restore()
      contentY += imgSize + (messageText ? 28 : 0)
    }

    if (messageText) {
      ctx.font = '52px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'left'
      msgLines.forEach((line, i) => {
        ctx.fillText(line, hPad + innerPad, contentY + msgLineH * i + 48)
      })
    }

    y += senderBoxH + 52

    ctx.font = 'bold 68px -apple-system, BlinkMacSystemFont, sans-serif'
    const replyLines = wrapTextWithWordBreak(ctx, replyText, boxW - innerPad * 2)
    const replyLineH = 86
    const replyBoxH = innerPad + 60 + 28 + replyLines.length * replyLineH + innerPad

    ctx.save()
    ctx.shadowColor = 'rgba(255,107,107,0.4)'
    ctx.shadowBlur = 60
    ctx.fillStyle = 'rgba(255,107,107,0.01)'
    roundRect(ctx, hPad, y, boxW, replyBoxH, 40)
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = 'rgba(255,255,255,0.13)'
    roundRect(ctx, hPad, y, boxW, replyBoxH, 40)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,107,107,0.35)'
    ctx.lineWidth = 2
    roundRect(ctx, hPad, y, boxW, replyBoxH, 40)
    ctx.stroke()

    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = 'rgba(255,107,107,0.9)'
    ctx.textAlign = 'left'
    ctx.fillText('ME', hPad + innerPad, y + innerPad + 42)

    ctx.font = 'bold 68px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 8
    replyLines.forEach((line, i) => {
      ctx.fillText(line, hPad + innerPad, y + innerPad + 60 + 28 + replyLineH * i + 60)
    })
    ctx.shadowBlur = 0

    await drawSendMeCta(ctx, W, H, arrowsSrc)

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}

// ─── generateMessageCard ───────────────────────────────────────────────

async function generateMessageCard(
  messageText: string,
  imageUrl: string | null,
  logoSrc: string,
  userPfp: string | null,
  arrowsSrc: string,
  blurImage = false,
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const W = STORY_CANVAS_WIDTH, H = STORY_CANVAS_HEIGHT
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    const hasFilter = supportsCanvasFilter()
    let pfpImg: HTMLImageElement | null = null
    if (userPfp) pfpImg = await loadImage(userPfp).catch(() => null)

    let blurTmp: HTMLCanvasElement | null = null
    if (pfpImg && !hasFilter) {
      blurTmp = buildBlurCanvas(pfpImg, W, H)
    }

    // 1. Arrière-plan flouté avec voile sombre et vignette
    drawBlurredBackground(ctx, pfpImg, W, H, blurTmp, hasFilter)

    // 2. Emojis décoratifs
    for (const e of EMOJI_DECORATIONS) {
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

    // 3. Logo TBH
    const logo = await loadImage(logoSrc).catch(() => null)
    if (logo) {
      const lw = LOGO_WIDTH, lh = Math.round(lw * logo.height / logo.width)
      const offscreen = document.createElement('canvas')
      offscreen.width = lw; offscreen.height = lh
      const oc = offscreen.getContext('2d')!
      oc.drawImage(logo, 0, 0, lw, lh)
      oc.globalCompositeOperation = 'source-in'
      oc.fillStyle = '#FFFFFF'
      oc.fillRect(0, 0, lw, lh)
      ctx.globalAlpha = 0.9
      ctx.drawImage(offscreen, (W - lw) / 2, LOGO_TOP_Y, lw, lh)
      ctx.globalAlpha = 1
    }

    // 4. Pilule "🔒 Anonymous message"
    ctx.font = ANONYMOUS_PILL_FONT
    const pillW = ctx.measureText(ANONYMOUS_PILL_TEXT).width + ANONYMOUS_PILL_PADDING_X * 2
    const pillH = ANONYMOUS_PILL_HEIGHT
    const pillX = (W - pillW) / 2
    const pillY = ANONYMOUS_PILL_TOP_Y
    ctx.fillStyle = ANONYMOUS_PILL_BG
    roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2)
    ctx.fill()
    ctx.fillStyle = ANONYMOUS_PILL_TEXT_COLOR
    ctx.textAlign = 'center'
    ctx.fillText(ANONYMOUS_PILL_TEXT, W / 2, pillY + 48)

    // 5. Image attachée si présente
    let imageBoxY = 0
    if (imageUrl) {
      const img = await loadImage(imageUrl).catch(() => null)
      if (img) {
        const imgS = 860, imgY = 440
        ctx.save()
        roundRect(ctx, (W - imgS) / 2, imgY, imgS, imgS, 48)
        ctx.clip()
        drawImageCoverOptionallyBlurred(ctx, img, (W - imgS) / 2, imgY, imgS, imgS, blurImage)
        ctx.restore()
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = 3
        roundRect(ctx, (W - imgS) / 2, imgY, imgS, imgS, 48)
        ctx.stroke()
        imageBoxY = imgY + imgS + 40
      }
    }

    // 6. Boîte avec bandeau noir multiligne et zone blanche dynamique
    const boxWidth = CARD_BOX_WIDTH
    const boxX = (W - boxWidth) / 2
    const boxRadius = CARD_BOX_RADIUS

    // ── BANDEAU NOIR MULTILIGNE ──
    ctx.font = BANDEAU_FONT
    const maxBandeauWidth = boxWidth - BANDEAU_PADDING_X * 2
    const bandeauLines = wrapTextWithWordBreak(ctx, BANDEAU_TEXT, maxBandeauWidth)
    const bandeauHeight = bandeauLines.length * BANDEAU_LINE_HEIGHT + BANDEAU_PADDING_Y * 2

    // ── ZONE BLANCHE DYNAMIQUE (AUCUN DÉBORDEMENT) ──
    const maxTextWidth = boxWidth - WHITE_BOX_PADDING_X * 2
    let fontSize = WHITE_BOX_FONT_MAX
    let messageLines: string[] = []
    let contentHeight = 0

    while (fontSize > WHITE_BOX_FONT_MIN) {
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      messageLines = wrapTextWithWordBreak(ctx, messageText || ' ', maxTextWidth)
      contentHeight = messageLines.length * fontSize * WHITE_BOX_LINE_HEIGHT_RATIO
      if (contentHeight + WHITE_BOX_PADDING_Y * 2 <= 550) break
      fontSize -= 4
    }
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
    messageLines = wrapTextWithWordBreak(ctx, messageText || ' ', maxTextWidth)
    contentHeight = messageLines.length * fontSize * WHITE_BOX_LINE_HEIGHT_RATIO

    const whiteHeight = Math.max(contentHeight + WHITE_BOX_PADDING_Y * 2, WHITE_BOX_MIN_HEIGHT)
    const totalBoxHeight = bandeauHeight + whiteHeight

    // Position Y de la boîte
    let boxY = 0
    if (imageUrl) {
      boxY = imageBoxY > 0 ? imageBoxY : 440 + 860 + 40
    } else {
      const availableTop = pillY + pillH + 40
      boxY = Math.max(availableTop, (H - totalBoxHeight) / 2 + 10)
    }

    // 6a. Ombre + fond blanc
    ctx.save()
    ctx.shadowColor = CARD_BOX_SHADOW_COLOR
    ctx.shadowBlur = CARD_BOX_SHADOW_BLUR
    ctx.shadowOffsetY = CARD_BOX_SHADOW_OFFSET_Y
    ctx.fillStyle = WHITE_BOX_BG_COLOR
    roundRect(ctx, boxX, boxY, boxWidth, totalBoxHeight, boxRadius)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    ctx.restore()

    // 6b. Bandeau noir supérieur (coins arrondis en haut)
    ctx.save()
    roundTopCornersRect(ctx, boxX, boxY, boxWidth, bandeauHeight, boxRadius)
    ctx.fillStyle = BANDEAU_BG_COLOR
    ctx.fill()
    ctx.restore()

    // 6c. Texte du bandeau noir
    ctx.save()
    ctx.font = BANDEAU_FONT
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = BANDEAU_TEXT_COLOR
    const bandeauStartY = boxY + BANDEAU_PADDING_Y + BANDEAU_LINE_HEIGHT / 2
    bandeauLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, bandeauStartY + i * BANDEAU_LINE_HEIGHT)
    })
    ctx.restore()

    // 6d. Texte du message dans la zone blanche
    ctx.save()
    ctx.shadowColor = WHITE_BOX_TEXT_SHADOW_COLOR
    ctx.shadowBlur = WHITE_BOX_TEXT_SHADOW_BLUR
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 4
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
    ctx.fillStyle = WHITE_BOX_TEXT_COLOR
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const textStartY = boxY + bandeauHeight + WHITE_BOX_PADDING_Y
    messageLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, textStartY + i * fontSize * WHITE_BOX_LINE_HEIGHT_RATIO)
    })
    ctx.restore()

    // 7. Call-to-action final (Send me something anonymously + flèches)
    await drawSendMeCta(ctx, W, H, arrowsSrc)

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}

// ─── ReadMessageScreen ─────────────────────────────────────────────────

export default function ReadMessageScreen() {
  const router = useRouter()
  const params = useParams()
  const messageId = params?.id as string
  const { t } = useTranslation()

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

  const [messageCardBlob, setMessageCardBlob] = useState<Blob | null>(null)
  const [cardGenerating, setCardGenerating] = useState(false)
  const [replyCardBlob, setReplyCardBlob] = useState<Blob | null>(null)

  const replyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replyGenPromiseRef = useRef<Promise<Blob> | null>(null)

  const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
  const logoSrc = typeof window !== 'undefined'
    ? `${window.location.origin}/assets/TBH_Title_Logo.svg`
    : '/assets/TBH_Title_Logo.svg'
  const arrowsSrc = typeof window !== 'undefined'
    ? `${window.location.origin}/assets/arrows.svg`
    : '/assets/arrows.svg'

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

  const isImageMessage = !!(message?.contains_media || message?.media_url)
  const imageUrl = message?.media_url || null
  const textContent = message?.content ?? ''

  useEffect(() => {
    if (!message) return
    let cancelled = false
    setCardGenerating(true)
    setMessageCardBlob(null)
    generateMessageCard(textContent, imageUrl, logoSrc, userPfp, arrowsSrc)
      .then(blob => {
        if (!cancelled) setMessageCardBlob(blob)
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setCardGenerating(false)
      })
    return () => { cancelled = true }
  }, [message, textContent, imageUrl, logoSrc, userPfp, arrowsSrc])

  useEffect(() => {
    if (!showReply || !replyText.trim()) {
      setReplyCardBlob(null)
      replyGenPromiseRef.current = null
      if (replyDebounceRef.current) clearTimeout(replyDebounceRef.current)
      return
    }
    if (replyDebounceRef.current) clearTimeout(replyDebounceRef.current)
    replyDebounceRef.current = setTimeout(() => {
      const promise = generateReplyCard(textContent, replyText, imageUrl, logoSrc, userPfp, arrowsSrc)
      replyGenPromiseRef.current = promise
      promise
        .then(blob => {
          if (replyGenPromiseRef.current === promise) setReplyCardBlob(blob)
        })
        .catch(console.error)
    }, 600)
    return () => {
      if (replyDebounceRef.current) clearTimeout(replyDebounceRef.current)
    }
  }, [replyText, showReply, textContent, imageUrl, logoSrc, userPfp, arrowsSrc])

  const handleShareMessage = async () => {
    if (!message || sharing || !messageCardBlob) return
    setSharing(true)
    try {
      const file = new File([messageCardBlob], 'tbh.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: userLink })
        return
      }
      if (navigator.share) {
        await navigator.share({ url: userLink })
        return
      }
      const url = URL.createObjectURL(messageCardBlob)
      const a = document.createElement('a')
      a.href = url; a.download = 'tbh.png'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error('Share failed', e)
    } finally {
      setSharing(false)
    }
  }

  const handleSendReply = async () => {
    const text = replyText.trim()
    if (!text || replySending) return

    setReplySending(true)
    try {
      if (replyDebounceRef.current) {
        clearTimeout(replyDebounceRef.current)
        replyDebounceRef.current = null
      }

      let blob = replyCardBlob
      if (!blob) {
        blob = replyGenPromiseRef.current
          ? await replyGenPromiseRef.current
          : await generateReplyCard(textContent, text, imageUrl, logoSrc, userPfp, arrowsSrc)
      }

      const file = new File([blob], 'tbh.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: userLink })
      } else if (navigator.share) {
        await navigator.share({ url: userLink })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'tbh.png'
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 10000)
      }

      setShowReply(false)
      setReplyText('')
      setReplyCardBlob(null)
      replyGenPromiseRef.current = null
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error('Reply share failed', e)
    } finally {
      setReplySending(false)
    }
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
        <p className="text-[18px] font-bold text-[#888]">{t.messageNotFound || 'Message introuvable'}</p>
        <button onClick={() => router.back()} className="text-sm underline text-[#666]">{t.goBack || 'Retour'}</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden" style={{ fontFamily: font }}>
      <style>{GLOBAL_STYLES}</style>

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

      <div className="absolute inset-0 z-[1] overflow-hidden">
        <FloatingEmojis />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex items-center px-4 pt-12 pb-4">
          <button
            onClick={() => router.back()}
            aria-label={t.back || 'Retour'}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="flex-1" />

        {/* UI : card preview avec bandeau noir */}
        <div className="px-5 mb-6">
          <div className="rounded-[28px] overflow-hidden bg-white shadow-[0_24px_60px_rgba(0,0,0,0.45),0_8px_20px_rgba(0,0,0,0.25)]">
            {/* Task 1: Black banner with specified text */}
            <div className="bg-[#111111] px-5 py-3.5 text-center">
              <span className="text-[14px] font-bold leading-snug text-white">
                Envoie moi un message anonyme et on chat anonymement
              </span>
            </div>

            {/* Task 2: White box without inner black box, clean spacing */}
            <div className="bg-white px-6 py-6 min-h-[140px] flex flex-col justify-center items-center">
              {isImageMessage && imageUrl && (
                <div className="w-full mb-4">
                  <div
                    onClick={() => setShowFullscreen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') setShowFullscreen(true)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-[16px] active:scale-[0.98] transition-transform cursor-pointer"
                    style={{ background: 'rgba(0,0,0,0.05)' }}
                  >
                    <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-black/10 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ filter: imageBlurred ? 'blur(10px)' : 'none', transition: 'filter 0.3s' }}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[15px] text-black">{t.photo || 'Photo'}</p>
                      <p className="text-[11px] text-black/45">{t.photoTapFullscreen || 'Appuie pour agrandir'}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setImageBlurred(!imageBlurred) }}
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                      style={{ background: imageBlurred ? '#111111' : 'rgba(0,0,0,0.08)' }}
                    >
                      {imageBlurred ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#fff" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="2"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="w-full h-[1px] mb-4" style={{ background: 'rgba(0,0,0,0.08)' }} />
                </div>
              )}

              {textContent ? (
                <p
                  className="w-full text-center font-semibold text-black"
                  style={{
                    fontSize: textContent.length > 100 ? '18px' : textContent.length > 50 ? '24px' : '32px',
                    lineHeight: '1.3',
                  }}
                >
                  {textContent}
                </p>
              ) : (
                <p className="text-black/40 text-center italic">{t.noMessageContent || 'Aucun contenu de message'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="px-5 pb-10 flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => setShowReply(true)}
              className="flex-1 py-4 rounded-[32px] font-bold text-[15px] text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              {t.reply || 'Répondre'}
            </button>
            <button
              onClick={handleShareMessage}
              disabled={sharing || cardGenerating || !messageCardBlob}
              className="flex-1 py-4 rounded-[32px] font-bold text-[15px] text-white active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF431D)' }}
            >
              {(sharing || cardGenerating)
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : (t.share || 'Partager')
              }
            </button>
          </div>
        </div>
      </div>

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

      {showReply && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => !replySending && setShowReply(false)} />
          <div className="relative z-10 rounded-t-[32px] overflow-hidden" style={{ maxHeight: '85vh' }}>
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
            <div className="absolute inset-0 overflow-hidden">
              <FloatingEmojis />
            </div>

            <div className="relative z-10 pb-10">
              <div className="flex justify-center pt-3 pb-5">
                <div className="w-10 h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />
              </div>
              <div className="px-5">
                <p className="text-center font-bold text-[16px] text-white mb-1">{t.replyPublicly || 'Répondre publiquement'}</p>
                <p className="text-center text-[12px] mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {t.replyPubliclySub || 'Ta réponse sera partagée sous forme de story'}
                </p>
                <div className="rounded-[14px] p-3 mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-[13px] line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {(imageUrl ? '📷 ' : '') + (textContent || '')}
                  </p>
                </div>
                <div className="flex items-end gap-3">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={t.yourReplyPlaceholder || 'Ta réponse…'}
                    rows={3}
                    disabled={replySending}
                    className="flex-1 rounded-[16px] px-4 py-3 text-[16px] text-white outline-none resize-none disabled:opacity-60"
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
                    {replySending
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <span style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>{t.sendReplyGo || 'Envoyer'}</span>
                    }
                  </button>
                </div>
                {replySending && (
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', textAlign: 'center' }}>
                    {t.preparingAndSharing || 'Préparation et partage en cours…'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}