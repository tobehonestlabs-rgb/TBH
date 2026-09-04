'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'
import { apiFetch } from '@/lib/api'
import { getT, useTranslation } from '@/lib/i18n'
import InsightsMap from './InsightsMap'
import GifPicker, { GifResult } from './GifPicker'
import TBHProScreen from './TBHProScreen'

type Message = {
  message_id: string
  content: string | null
  media_url: string | null
  isOpened: boolean
  created_at: string
  contains_media: boolean
  ip_address?: string | null
  country?: string | null
  city?: string | null
  region?: string | null
  latitude?: string | null
  longitude?: string | null
  browser_name?: string | null
  device_fingerprint?: string | null
  phone_type?: string | null
}

type Props = {
  onUnreadChange: (hasUnread: boolean) => void
  isActive: boolean
  profile: { active_subscription: boolean } | null
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const s = Math.floor(diff / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 30) return `${Math.floor(d / 30)}mo`
    if (d > 6)  return `${Math.floor(d / 7)}w`
    if (d > 0)  return `${d}d`
    if (h > 0)  return `${h}h`
    if (m > 0)  return `${m}m`
    return 'just now'
  } catch { return 'now' }
}

const LS_BLUR_SHARED_PHOTO = 'tbh_blur_shared_photo'
function loadBlurSharedPhotoPref(): boolean {
  try { return JSON.parse(localStorage.getItem(LS_BLUR_SHARED_PHOTO) ?? 'false') } catch { return false }
}
function saveBlurSharedPhotoPref(v: boolean) {
  try { localStorage.setItem(LS_BLUR_SHARED_PHOTO, JSON.stringify(v)) } catch {}
}

// A small iOS-style pill switch, styled with the app's signature gradient
// for the "on" state.
function BlurPhotoSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-[50px] h-[30px] rounded-full flex-shrink-0 transition-colors duration-200"
      style={{ background: checked ? 'linear-gradient(135deg, #FF3F1D, #FF3CAC)' : '#E2E2E6' }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
      />
    </button>
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

// ─── generateGifReplyCard ──────────────────────────────────────────────

async function generateGifReplyCard(
  messageText: string,
  gifUrl: string,
  logoSrc: string,
  userPfp: string | null,
  arrowsSrc: string,
): Promise<Blob> {
  const proxiedGifUrl = `/api/gif-proxy?url=${encodeURIComponent(gifUrl)}`
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

    drawBlurredBackground(ctx, pfpImg, W, H, blurTmp, hasFilter)

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

    if (messageText) {
      ctx.font = '52px -apple-system, BlinkMacSystemFont, sans-serif'
      const msgLines = wrapTextWithWordBreak(ctx, messageText, boxW - innerPad * 2)
      const msgLineH = 68
      const senderBoxH = innerPad + 60 + 20 + msgLines.length * msgLineH + innerPad

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

      ctx.font = '52px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'left'
      msgLines.forEach((line, i) => {
        ctx.fillText(line, hPad + innerPad, y + innerPad + 60 + 20 + msgLineH * i + 48)
      })
      y += senderBoxH + 52
    }

    const gifImg = await loadImage(proxiedGifUrl).catch(() => null)
    if (gifImg) {
      const gifAspect = gifImg.naturalHeight / gifImg.naturalWidth || 0.5625
      const gifDisplayH = Math.min(Math.round(boxW * gifAspect), 720)
      ctx.save()
      roundRect(ctx, hPad, y, boxW, gifDisplayH, 40)
      ctx.clip()
      ctx.drawImage(gifImg, hPad, y, boxW, gifDisplayH)
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,107,107,0.4)'
      ctx.lineWidth = 3
      roundRect(ctx, hPad, y, boxW, gifDisplayH, 40)
      ctx.stroke()
      y += gifDisplayH + 48
    }

    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = 'rgba(255,107,107,0.9)'
    ctx.textAlign = 'center'
    ctx.fillText('🎬 MY REPLY', W / 2, y + 48)

    await drawSendMeCta(ctx, W, H, arrowsSrc)

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}

// ─── generatePhotoReplyCard ────────────────────────────────────────────

async function generatePhotoReplyCard(
  messageText: string,
  photoUrl: string,
  logoSrc: string,
  userPfp: string | null,
  arrowsSrc: string,
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

    drawBlurredBackground(ctx, pfpImg, W, H, blurTmp, hasFilter)

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

    if (messageText) {
      ctx.font = '52px -apple-system, BlinkMacSystemFont, sans-serif'
      const msgLines = wrapTextWithWordBreak(ctx, messageText, boxW - innerPad * 2)
      const msgLineH = 68
      const senderBoxH = innerPad + 60 + 20 + msgLines.length * msgLineH + innerPad

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

      ctx.font = '52px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'left'
      msgLines.forEach((line, i) => {
        ctx.fillText(line, hPad + innerPad, y + innerPad + 60 + 20 + msgLineH * i + 48)
      })
      y += senderBoxH + 52
    }

    const photoImg = await loadImage(photoUrl).catch(() => null)
    if (photoImg) {
      const photoAspect = photoImg.naturalHeight / photoImg.naturalWidth || 0.5625
      const photoDisplayH = Math.min(Math.round(boxW * photoAspect), 720)
      ctx.save()
      roundRect(ctx, hPad, y, boxW, photoDisplayH, 40)
      ctx.clip()
      ctx.drawImage(photoImg, hPad, y, boxW, photoDisplayH)
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,107,107,0.4)'
      ctx.lineWidth = 3
      roundRect(ctx, hPad, y, boxW, photoDisplayH, 40)
      ctx.stroke()
      y += photoDisplayH + 48
    }

    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = 'rgba(255,107,107,0.9)'
    ctx.textAlign = 'center'
    ctx.fillText('📷 MY REPLY', W / 2, y + 48)

    await drawSendMeCta(ctx, W, H, arrowsSrc)

    canvas.toBlob(b => resolve(b!), 'image/png', 1.0)
  })
}

type ConvMsg = {
  id: string
  sender_id: string
  content: string | null
  gif_url?: string | null
  created_at: string
  is_read: boolean
}

export default function MessagesPage({ onUnreadChange, isActive, profile }: Props) {
  const isPro = !!profile?.active_subscription
  const { t } = useTranslation()
  const [messages, setMessages]         = useState<Message[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedMsg, setSelectedMsg]   = useState<Message | null>(null)
  const [sheetClosing, setSheetClosing] = useState(false)
  const [imageBlurred, setImageBlurred] = useState(true)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showReply, setShowReply]       = useState(false)
  const [replyText, setReplyText]       = useState('')
  const [showInsights, setShowInsights] = useState(false)
  const [senderCount, setSenderCount]   = useState<number | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [userPfp, setUserPfp]           = useState<string | null>(null)
  const [userLink, setUserLink]         = useState('')
  const [messageCardBlob, setMessageCardBlob] = useState<Blob | null>(null)
  const [cardGenerating, setCardGenerating]   = useState(false)
  const [sharing, setSharing]           = useState(false)
  const [replySending, setReplySending] = useState(false)
  // Whether the received photo should be blurred inside generated share/reply
  // cards (independent from `imageBlurred`, which only affects the in-app preview).
  const [blurSharedPhoto, setBlurSharedPhoto] = useState(false)
  const userIdRef = useRef<string | null>(null)
  const cardPromiseRef = useRef<Promise<Blob | null> | null>(null)

  // Global lock: navigator.share() only allows one in-flight call at a time,
  // and it must be checked synchronously (React state updates are async and
  // can't stop two near-simultaneous taps from both slipping through).
  const shareInFlightRef = useRef(false)

  // Pro + GIF state
  const [showProScreen, setShowProScreen]       = useState(false)
  const [replyMode, setReplyMode]               = useState<'text' | 'gif' | 'photo'>('text')
  const [selectedGif, setSelectedGif]           = useState<GifResult | null>(null)
  const [gifCardBlob, setGifCardBlob]           = useState<Blob | null>(null)
  const [selectedPhoto, setSelectedPhoto]       = useState<File | null>(null)
  const [photoPreview, setPhotoPreview]       = useState<string | null>(null)
  const [photoCardBlob, setPhotoCardBlob]       = useState<Blob | null>(null)
  const [showGifPicker, setShowGifPicker]       = useState(false)
  const [showConvGifPicker, setShowConvGifPicker] = useState(false)

  // Reply-card pre-generation (text mode) — generated ahead of the tap so
  // navigator.share() fires immediately inside the user gesture. Each token
  // bump invalidates whatever was mid-generation, so a card that finishes
  // rendering for stale text can never silently become "ready".
  const [replyCardBlob, setReplyCardBlob] = useState<Blob | null>(null)
  const replyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replyGenPromiseRef = useRef<Promise<Blob> | null>(null)
  const replyGenTokenRef = useRef(0)
  const gifGenPromiseRef = useRef<Promise<Blob> | null>(null)
  const gifGenTokenRef = useRef(0)

  // Conversation
  const [convId, setConvId]           = useState<string | null>(null)
  const [showConv, setShowConv]       = useState(false)
  const [convMsgs, setConvMsgs]       = useState<ConvMsg[]>([])
  const [convInput, setConvInput]     = useState('')
  const [convSending, setConvSending] = useState(false)
  const convBottomRef = useRef<HTMLDivElement>(null)
  const convChannelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null)

  const getLogoSrc = () => `${window.location.origin}/assets/TBH_Title_Logo.svg`
  const getArrowsSrc = () => `${window.location.origin}/assets/arrows.svg`

  useEffect(() => {
    setPortalTarget(document.getElementById('app-shell'))
    setBlurSharedPhoto(loadBlurSharedPhotoPref())
  }, [])

  useEffect(() => {
    if (!isActive && selectedMsg) {
      setSelectedMsg(null); setSheetClosing(false); setShowReply(false)
      setReplyText(''); setShowFullscreen(false); setShowInsights(false)
      setSenderCount(null); setShowConv(false); setConvId(null)
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let mounted = true
    let ch: ReturnType<typeof supabaseClient.channel> | null = null
    const setup = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session || !mounted) return
      userIdRef.current = session.user.id

      const { data, error } = await supabaseClient
        .from('messages').select('*')
        .eq('to_user', session.user.id)
        .order('created_at', { ascending: false })

      if (mounted) {
        if (!error && data) { setMessages(data); onUnreadChange(data.some((m: Message) => !m.isOpened)) }
        setLoading(false)
      }

      const { data: profile } = await supabaseClient
        .from('users_table').select('slug, pfp').eq('user_id', session.user.id).maybeSingle()
      if (mounted) {
        if (profile?.pfp) setUserPfp(profile.pfp)
        if (profile?.slug) setUserLink(`${window.location.origin}/send/${profile.slug}`)
      }

      ch = supabaseClient.channel(`inbox-${session.user.id}`)
      ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user=eq.${session.user.id}` }, (payload) => {
        if (mounted) { setMessages(prev => [payload.new as Message, ...prev]); onUnreadChange(true) }
      }).subscribe()
    }
    setup()
    return () => { mounted = false; if (ch) supabaseClient.removeChannel(ch).catch(() => {}) }
  }, [onUnreadChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const openSheet = async (msg: Message) => {
    if (!msg.isOpened) {
      // Use server-side admin route to bypass RLS
      apiFetch('/api/messages/read', {
        method: 'POST',
        body: JSON.stringify({ message_id: msg.message_id }),
      }).catch(() => {})
      setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, isOpened: true } : m))
      onUnreadChange(messages.filter(m => !m.isOpened && m.message_id !== msg.message_id).length > 0)
    }
    setSelectedMsg(msg); setSheetClosing(false); setImageBlurred(true)
    setShowFullscreen(false); setShowReply(false); setReplyText('')
    setShowInsights(false); setSenderCount(null); setShowConv(false); setConvId(null)
    setMessageCardBlob(null); setSharing(false); setReplySending(false)
    setReplyCardBlob(null); replyGenPromiseRef.current = null
    setGifCardBlob(null); gifGenPromiseRef.current = null
    setSelectedPhoto(null); setPhotoPreview(null); setPhotoCardBlob(null); photoGenPromiseRef.current = null
  }

  const closeSheet = () => {
    setSheetClosing(true); setShowFullscreen(false); setShowConv(false)
    setShowConvGifPicker(false); setShowGifPicker(false)
    if (convChannelRef.current) { supabaseClient.removeChannel(convChannelRef.current).catch(() => {}); convChannelRef.current = null }
    setTimeout(() => {
      setSelectedMsg(null); setSheetClosing(false); setShowReply(false)
      setReplyText(''); setShowInsights(false); setSenderCount(null); setConvId(null)
      setMessageCardBlob(null)
      setReplyMode('text'); setSelectedGif(null); setGifCardBlob(null)
      setSelectedPhoto(null); setPhotoPreview(null); setPhotoCardBlob(null)
      setReplyCardBlob(null); replyGenPromiseRef.current = null; gifGenPromiseRef.current = null; photoGenPromiseRef.current = null
    }, 300)
  }

  const loadInsights = async () => {
    if (!selectedMsg) return
    setShowInsights(true)
    if (selectedMsg.ip_address && userIdRef.current && senderCount === null) {
      setLoadingInsights(true)
      const { count } = await supabaseClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', selectedMsg.ip_address)
        .eq('to_user', userIdRef.current)
      setSenderCount(count ?? 0)
      setLoadingInsights(false)
    }
  }

  const subscribeConv = (cid: string) => {
    if (convChannelRef.current) { supabaseClient.removeChannel(convChannelRef.current).catch(() => {}); convChannelRef.current = null }
    const ch = supabaseClient.channel(`conv-msg-${cid}`)
    ch
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `conversation_id=eq.${cid}` }, payload => {
        const m = payload.new as ConvMsg
        setConvMsgs(prev => prev.find(x => x.id === m.id) ? prev : [...prev, m])
        setTimeout(() => convBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        if (userIdRef.current && m.sender_id !== userIdRef.current) {
          apiFetch(`/api/conversations/${cid}/read`, { method: 'POST' }).catch(() => {})
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversation_messages', filter: `conversation_id=eq.${cid}` }, payload => {
        const updated = payload.new as ConvMsg
        setConvMsgs(prev => prev.map(m => m.id === updated.id ? { ...m, is_read: updated.is_read } : m))
      })
      .subscribe()
    convChannelRef.current = ch
  }

  // Pre-generate message share card whenever a message is opened
  useEffect(() => {
    if (!selectedMsg) {
      setMessageCardBlob(null)
      cardPromiseRef.current = null
      return
    }
    setCardGenerating(true)
    const promise = generateMessageCard(selectedMsg.content || '', selectedMsg.media_url || null, getLogoSrc(), userPfp, getArrowsSrc(), blurSharedPhoto)
      .then(blob => {
        setMessageCardBlob(blob)
        return blob
      })
      .catch(() => null)
      .finally(() => setCardGenerating(false))
    cardPromiseRef.current = promise
  }, [selectedMsg, userPfp, blurSharedPhoto])

  // Pre-generate the text-reply card, debounced 600ms after typing stops.
  // The token bumps on every keystroke — even mid-generation — so the Send
  // button can only ever go "ready" for the text that's actually on screen
  // right now, never for a version you've since edited.
  useEffect(() => {
    replyGenTokenRef.current += 1
    setReplyCardBlob(null)

    if (!showReply || replyMode !== 'text' || !replyText.trim() || !selectedMsg) {
      if (replyDebounceRef.current) clearTimeout(replyDebounceRef.current)
      return
    }
    const myToken = replyGenTokenRef.current
    if (replyDebounceRef.current) clearTimeout(replyDebounceRef.current)
    replyDebounceRef.current = setTimeout(() => {
      const promise = generateReplyCard(
        selectedMsg.content || '', replyText, selectedMsg.media_url || null, getLogoSrc(), userPfp, getArrowsSrc(), blurSharedPhoto,
      )
      replyGenPromiseRef.current = promise
      promise
        .then(blob => { if (replyGenTokenRef.current === myToken) setReplyCardBlob(blob) })
        .catch(console.error)
    }, 600)
    return () => { if (replyDebounceRef.current) clearTimeout(replyDebounceRef.current) }
  }, [replyText, replyMode, showReply, selectedMsg, userPfp, blurSharedPhoto])

  // Pre-generate the GIF-reply card as soon as a GIF is picked. Same token
  // guard — picking a different GIF mid-render can't leave a mismatched
  // blob marked ready.
  useEffect(() => {
    gifGenTokenRef.current += 1
    setGifCardBlob(null)

    if (!showReply || replyMode !== 'gif' || !selectedGif || !selectedMsg) return
    const myToken = gifGenTokenRef.current
    const promise = generateGifReplyCard(selectedMsg.content || '', selectedGif.url, getLogoSrc(), userPfp, getArrowsSrc())
    gifGenPromiseRef.current = promise
    promise
      .then(blob => { if (gifGenTokenRef.current === myToken) setGifCardBlob(blob) })
      .catch(console.error)
  }, [selectedGif, replyMode, showReply, selectedMsg, userPfp])

  // Pre-generate the photo-reply card as soon as a photo is picked.
  const photoGenPromiseRef = useRef<Promise<Blob> | null>(null)
  const photoGenTokenRef = useRef(0)
  useEffect(() => {
    photoGenTokenRef.current += 1
    setPhotoCardBlob(null)

    if (!showReply || replyMode !== 'photo' || !selectedPhoto || !selectedMsg) return
    const myToken = photoGenTokenRef.current
    
    // Upload photo and generate card
    const uploadAndGenerate = async () => {
      try {
        const formData = new FormData()
        formData.append('file', selectedPhoto)
        
        const response = await apiFetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Upload failed')
        }
        
        const data = await response.json()
        const photoUrl = data.url
        
        const promise = generatePhotoReplyCard(selectedMsg.content || '', photoUrl, getLogoSrc(), userPfp, getArrowsSrc())
        photoGenPromiseRef.current = promise
        const blob = await promise
        if (photoGenTokenRef.current === myToken) setPhotoCardBlob(blob)
      } catch (error) {
        console.error('Photo upload/generation error:', error)
      }
    }
    
    uploadAndGenerate()
  }, [selectedPhoto, replyMode, showReply, selectedMsg, userPfp])

  // Shares a blob via the Web Share API (falling back to a download link),
  // guarded by the single global in-flight lock.
  const shareBlob = async (blob: Blob, filename: string) => {
    const file = new File([blob], filename, { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: userLink })
      return
    }
    if (navigator.share) {
      await navigator.share({ url: userLink || window.location.origin })
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const handleSendReply = async () => {
    if (shareInFlightRef.current || replySending) return
    const blobToUse = replyMode === 'text' ? replyCardBlob : replyMode === 'gif' ? gifCardBlob : photoCardBlob
    // The button is disabled until this is non-null, but guard anyway —
    // this call must never do generation work before navigator.share().
    if (!blobToUse) return

    shareInFlightRef.current = true
    setReplySending(true)
    try {
      await shareBlob(blobToUse, 'tbh-reply.png')

      // Reset UI after share completes (even if user cancels)
      setShowReply(false)
      setReplyText('')
      setGifCardBlob(null)
      setSelectedPhoto(null); setPhotoPreview(null); setPhotoCardBlob(null)
      setSelectedGif(null)
      setReplyMode('text')
      setReplyCardBlob(null)
      replyGenPromiseRef.current = null
      gifGenPromiseRef.current = null
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error('Reply share failed', e)
    } finally {
      setReplySending(false)
      shareInFlightRef.current = false
    }
  }

  const sendConvGif = async (gif: GifResult) => {
    if (!convId || convSending) return
    setConvSending(true)
    setShowConvGifPicker(false)
    try {
      const res = await apiFetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ gif_url: gif.url }),
      })
      const { message } = await res.json()
      if (message) {
        setConvMsgs(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
        setTimeout(() => convBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch {}
    setConvSending(false)
  }

  const startConversation = async () => {
    if (!selectedMsg) return
    if (convId) { setShowConv(true); return }
    try {
      const res = await apiFetch('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ original_message_id: selectedMsg.message_id, sender_ip: selectedMsg.ip_address ?? null }),
      })
      const { conversation } = await res.json()
      if (!conversation) return
      setConvId(conversation.id)
      const mRes = await apiFetch(`/api/conversations/${conversation.id}/messages`)
      const { messages: ms } = await mRes.json()
      setConvMsgs(ms ?? [])
      apiFetch(`/api/conversations/${conversation.id}/read`, { method: 'POST' }).catch(() => {})
      subscribeConv(conversation.id)
      setShowConv(true)
      setTimeout(() => convBottomRef.current?.scrollIntoView(), 50)
    } catch {}
  }

  const sendConvMsg = async () => {
    if (!convInput.trim() || !convId || convSending) return
    setConvSending(true)
    const text = convInput.trim(); setConvInput('')
    try {
      const res = await apiFetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      })
      const { message } = await res.json()
      if (message) {
        setConvMsgs(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
        setTimeout(() => convBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch {}
    setConvSending(false)
  }

  const handleReport = async () => {
    if (!selectedMsg) return
    try { await supabaseClient.from('messages').update({ reported: true } as any).eq('message_id', selectedMsg.message_id) } catch {}
    closeSheet()
  }

  const handleShare = async () => {
    if (!selectedMsg || shareInFlightRef.current) return
    shareInFlightRef.current = true
    setSharing(true)
    try {
      let blobToUse: Blob | null = messageCardBlob
      if (!blobToUse && cardPromiseRef.current) {
        blobToUse = await cardPromiseRef.current
      }
      if (!blobToUse) {
        blobToUse = await generateMessageCard(
          selectedMsg.content || '', selectedMsg.media_url || null, getLogoSrc(), userPfp, getArrowsSrc(), blurSharedPhoto,
        )
      }
      if (!blobToUse) return
      await shareBlob(blobToUse, 'tbh.png')
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error('Share failed', e)
    } finally {
      setSharing(false)
      shareInFlightRef.current = false
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-3">
        {[1, 2, 3].map(i => <div key={i} className="h-[76px] rounded-[20px] bg-[#F5F5F5] animate-pulse" />)}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <img src="/assets/BrokenHeart.svg" alt="" style={{ width: '56px', height: '56px' }} />
        <p className="text-[18px] font-bold text-[#888]">{t.noMessagesYetInbox || 'Pas encore de messages'}</p>
        <p className="text-[13px] text-[#AAA]">{t.shareLinkToReceive || 'Partage ton lien pour en recevoir !'}</p>
      </div>
    )
  }

  const isImageMessage = selectedMsg ? (selectedMsg.contains_media || !!selectedMsg.media_url) : false
  const imageUrl       = selectedMsg?.media_url  || null
  const textContent    = selectedMsg?.content    || null


  return (
    <>
      {/* ── Message list: flat divided list, hairline separators between rows ── */}
      <div className="flex flex-col pb-10">
        {messages.map((msg, idx) => {
          const hasImage = msg.contains_media || !!msg.media_url
          const preview  = msg.content ?? ''
          return (
            <button
              key={msg.message_id}
              onClick={() => openSheet(msg)}
              className={`w-full text-left flex items-center gap-3 px-5 py-[14px] active:bg-[#FAFAFA] transition-colors ${idx === 0 ? '' : 'border-t border-[#EFEFEF]'}`}
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: msg.isOpened ? '#E5E5E5' : 'linear-gradient(135deg, #cf5454, #ff4da6)' }}>
                <img src={msg.isOpened ? '/assets/Love_Letter.svg' : '/assets/R.svg'} className="w-6 h-6 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                {!msg.isOpened ? (
                  <>
                    <p className="text-[16px] font-bold" style={{ background: 'linear-gradient(90deg, #FF6B6B, #4D96FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.newMessage || 'Nouveau message'}</p>
                    <p className="text-[12px] text-[#888]">{hasImage ? (t.photo || 'Photo') : (t.tapToRead || 'Appuie pour lire')}</p>
                  </>
                ) : (
                  <>
                    <p className="text-[15px] font-medium text-[#0D0D0D] truncate">{preview}</p>
                    <p className="text-[11px] text-[#AAA]">{timeAgo(msg.created_at)}</p>
                  </>
                )}
              </div>
              {hasImage && msg.media_url ? (
                <div className="w-[52px] h-[52px] rounded-[12px] overflow-hidden bg-[#EEE] flex-shrink-0">
                  <img src={msg.media_url} alt="" className="w-full h-full object-cover" style={{ filter: msg.isOpened ? 'none' : 'blur(10px)' }} />
                </div>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" stroke="#D0D0D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Full-screen message sheet (portaled out of slide transform) ── */}
      {selectedMsg && portalTarget && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col">
          <div
            className={`flex-1 ${sheetClosing ? 'sheet-exit' : 'sheet-enter'} bg-white flex flex-col overflow-hidden`}
            style={{ borderRadius: '32px 32px 0 0' }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
              <button onClick={handleReport} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: '#FFF0EE' }} title={t.report || 'Signaler'}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="4" y1="22" x2="4" y2="15" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="w-10 h-[5px] rounded-full bg-[#E8E8E8]" />
              <button onClick={closeSheet} className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition-transform">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" stroke="#888" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Main message view ── */}
              {!showInsights && !showConv && (
                <div className="px-5 pt-3 pb-4 slide-from-left">
                  {!showReply ? (
                    <>
                      {/* Message card preview */}
                      <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18),0_8px_20px_rgba(0,0,0,0.12)] mb-3">
                        <div className="bg-[#111111] px-5 py-4 text-center">
                          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-[12px] font-bold text-white/75">
                            🔒&nbsp; Envoie moi un message anonyme et on chat anonymement
                          </span>
                        </div>
                        <div className="bg-white px-6 py-6 min-h-[140px] flex flex-col justify-center items-center">
                          {isImageMessage && imageUrl && (
                            <>
                              <div
                                onClick={() => setShowFullscreen(true)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowFullscreen(true) }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[22px] active:scale-[0.98] transition-transform mb-4 cursor-pointer"
                                style={{ background: '#F7F7F9' }}
                              >
                                <div className="w-14 h-14 rounded-[14px] overflow-hidden bg-[#E8E8E8] flex-shrink-0">
                                  <img src={imageUrl} alt="" className="w-full h-full object-cover" style={{ filter: imageBlurred ? 'blur(10px)' : 'none', transition: 'filter 0.3s' }} />
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-semibold text-[15px] text-[#0D0D0D]">{t.photo || 'Photo'}</p>
                                  <p className="text-[12px] text-[#ADADAD]">{t.photoTapFullscreen || 'Appuie pour agrandir'}</p>
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); setImageBlurred(b => !b) }}
                                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                                  style={{ background: imageBlurred ? '#0D0D0D' : '#EBEBEB' }}
                                >
                                  {imageBlurred ? (
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/></svg>
                                  ) : (
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/></svg>
                                  )}
                                </button>
                              </div>

                              {/* Blur photo in shared/reply cards — separate from the in-app preview toggle above */}
                              <div className="w-full flex items-center justify-between px-4 py-3.5 rounded-[22px] mb-4" style={{ background: '#F7F7F9' }}>
                                <div>
                                  <p className="text-[14px] font-semibold text-[#0D0D0D]">{t.blurPhotoWhenSharing || 'Flouter la photo lors du partage'}</p>
                                  <p className="text-[11px] text-[#ADADAD]">{t.hidesInExportedCard || 'La masque dans la carte exportée'}</p>
                                </div>
                                <BlurPhotoSwitch
                                  checked={blurSharedPhoto}
                                  onChange={v => { setBlurSharedPhoto(v); saveBlurSharedPhotoPref(v) }}
                                />
                              </div>

                              {textContent && <div className="h-px bg-[#F0F0F0] mb-4" />}
                            </>
                          )}

                          {textContent ? (
                            <p className="font-semibold text-center leading-snug text-[#111111]" style={{ fontSize: textContent.length > 100 ? '18px' : textContent.length > 50 ? '22px' : '28px' }}>
                              {textContent}
                            </p>
                          ) : (
                            <p className="text-center italic text-black/40">{t.noMessageContent || 'Aucun contenu de message'}</p>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-[#C8C8C8] text-center mb-5">{timeAgo(selectedMsg.created_at)}</p>

                      {/* Who sent this */}
                      <button
                        onClick={() => isPro ? loadInsights() : setShowProScreen(true)}
                        className="w-full py-3.5 rounded-[22px] mb-3 text-center font-semibold text-[15px] text-[#0D0D0D] active:scale-[0.98] transition-transform"
                        style={{ background: '#F7F7F9' }}
                      >
                        {t.whoSentThisBtn || 'Qui a envoyé ça 👀'}
                      </button>

                      {/* Chat */}
                      <button
                        onClick={() => isPro ? startConversation() : setShowProScreen(true)}
                        className="w-full py-3.5 rounded-[22px] mb-5 text-center font-bold text-[15px] text-white active:scale-[0.98] transition-transform"
                        style={{ background: '#0D0D0D' }}
                      >
                        {t.chatBtn || 'Chat 👀'}
                      </button>
                    </>
                  ) : (
                    /* Reply view */
                    <>
                      <button
                        onClick={() => { setShowReply(false); setReplyMode('text'); setSelectedGif(null); setGifCardBlob(null); setShowGifPicker(false) }}
                        className="flex items-center gap-1.5 text-[#ADADAD] text-[13px] mb-4 active:opacity-60"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {t.back || 'Retour'}
                      </button>
                      {textContent && (
                        <div className="w-full rounded-[20px] px-4 py-3.5 mb-4" style={{ background: '#F7F7F9' }}>
                          <p className="text-[#888] text-[14px] leading-snug line-clamp-3">{textContent}</p>
                        </div>
                      )}

                      {/* Mode toggle */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => { setReplyMode('text'); setSelectedGif(null); setShowGifPicker(false) }}
                          className="flex-1 py-2.5 rounded-full text-[14px] font-semibold transition-all"
                          style={{ background: replyMode === 'text' ? '#0D0D0D' : '#F2F2F2', color: replyMode === 'text' ? '#FFF' : '#888' }}
                        >{t.text || 'Texte'}</button>
                        <button
                          onClick={() => { setReplyMode('gif'); setShowGifPicker(true) }}
                          className="flex-1 py-2.5 rounded-full text-[14px] font-semibold transition-all"
                          style={{ background: replyMode === 'gif' ? '#0D0D0D' : '#F2F2F2', color: replyMode === 'gif' ? '#FFF' : '#888' }}
                        >{t.gif || 'GIF'} 🎬</button>
                        <button
                          onClick={() => { setReplyMode('photo') }}
                          className="flex-1 py-2.5 rounded-full text-[14px] font-semibold transition-all"
                          style={{ background: replyMode === 'photo' ? '#0D0D0D' : '#F2F2F2', color: replyMode === 'photo' ? '#FFF' : '#888' }}
                        >{t.photoMode || 'Photo 📷'}</button>
                      </div>

                      {replyMode === 'text' ? (
                        <>
                          <textarea
                            value={replyText} onChange={e => setReplyText(e.target.value)}
                            placeholder={t.typeReply || 'Écris ta réponse…'} autoFocus rows={4}
                            disabled={replySending}
                            className="w-full rounded-[20px] bg-[#F7F7F9] px-4 py-3.5 text-[16px] text-[#0D0D0D] outline-none resize-none mb-3 disabled:opacity-60"
                            style={{ fontFamily: 'inherit' }}
                          />
                        </>
                      ) : replyMode === 'gif' ? (
                        selectedGif ? (
                          <>
                            <img src={selectedGif.preview} alt="GIF" className="w-full rounded-[20px] mb-3" style={{ maxHeight: '200px', objectFit: 'cover' }} />
                            <button
                              onClick={() => { setSelectedGif(null); setGifCardBlob(null); setShowGifPicker(true) }}
                              className="w-full py-2.5 rounded-full bg-[#F2F2F2] text-[#555] text-[14px] font-semibold mb-3 active:scale-95 transition-transform"
                            >{t.changeGif || 'Changer le GIF'}</button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowGifPicker(true)}
                            className="w-full py-4 rounded-[20px] mb-3 text-[15px] font-semibold text-[#555] active:scale-95 transition-transform"
                            style={{ background: '#F7F7F9' }}
                          >{t.pickAGif || '🎬 Choisir un GIF'}</button>
                        )
                      ) : replyMode === 'photo' ? (
                        selectedPhoto ? (
                          <>
                            <img src={photoPreview || ''} alt="Photo" className="w-full rounded-[20px] mb-3" style={{ maxHeight: '200px', objectFit: 'cover' }} />
                            <button
                              onClick={() => { setSelectedPhoto(null); setPhotoPreview(null); setPhotoCardBlob(null) }}
                              className="w-full py-2.5 rounded-full bg-[#F2F2F2] text-[#555] text-[14px] font-semibold mb-3 active:scale-95 transition-transform"
                            >{t.changePhoto || 'Changer de photo'}</button>
                          </>
                        ) : (
                          <label className="w-full py-4 rounded-[20px] mb-3 text-[15px] font-semibold text-[#555] active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                            style={{ background: '#F7F7F9' }}
                          >
                            {t.pickAPhoto || '📷 Choisir une photo'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  if (!file.type.startsWith('image/')) {
                                    alert('Please select an image file')
                                    return
                                  }
                                  if (file.size > 10 * 1024 * 1024) {
                                    alert('Image must be less than 10MB')
                                    return
                                  }
                                  setSelectedPhoto(file)
                                  const reader = new FileReader()
                                  reader.onload = (e) => setPhotoPreview(e.target?.result as string)
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )
                      ) : null}

                      {(() => {
                        const hasInput = replyMode === 'text' ? !!replyText.trim() : replyMode === 'gif' ? !!selectedGif : !!selectedPhoto
                        const ready = replyMode === 'text' ? !!replyCardBlob : replyMode === 'gif' ? !!gifCardBlob : !!photoCardBlob
                        const preparing = hasInput && !ready
                        return (
                          <button
                            onClick={handleSendReply}
                            disabled={replySending || !hasInput || !ready}
                            className="w-full py-[15px] rounded-full bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
                          >
                            {replySending || preparing
                              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : replyMode === 'gif' ? t.shareGifReply : replyMode === 'photo' ? (t.sharePhotoReply || 'Partager la réponse photo') : t.shareReply
                            }
                          </button>
                        )
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* ── Insights panel ── */}
              {showInsights && !showConv && (
                <div className="px-5 pt-3 pb-6 slide-from-right">
                  <button onClick={() => setShowInsights(false)} className="flex items-center gap-1.5 text-[#ADADAD] text-[13px] mb-5 active:opacity-60">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {t.backToMessage || 'Retour au message'}
                  </button>

                  <p className="text-[21px] font-extrabold text-[#0D0D0D] tracking-tight mb-1">{t.senderInsights || "Infos sur l'expéditeur"}</p>
                  <p className="text-[13px] text-[#ADADAD] mb-5">{t.approximateInfo || 'Informations approximatives basées sur les données réseau'}</p>

                  <div className="flex flex-col gap-2.5 mb-4">
                    {/* Location */}
                    <div className="rounded-[22px] px-4 py-4" style={{ background: '#F7F7F9' }}>
                      <p className="text-[10px] font-semibold text-[#ADADAD] uppercase tracking-widest mb-2">{t.location || 'Localisation'}</p>
                      <p className="text-[17px] font-bold text-[#0D0D0D]">
                        {[selectedMsg.city, selectedMsg.country].filter(Boolean).join(', ') || (t.unknown || 'Inconnu')}
                      </p>
                      {selectedMsg.region && <p className="text-[12px] text-[#ADADAD] mt-0.5">{selectedMsg.region}</p>}
                    </div>

                    {/* IP */}
                    <div className="rounded-[22px] px-4 py-4" style={{ background: '#F7F7F9' }}>
                      <p className="text-[10px] font-semibold text-[#ADADAD] uppercase tracking-widest mb-1.5">{t.ipAddress || 'Adresse IP'}</p>
                      <p className="text-[16px] font-mono font-bold text-[#0D0D0D]">
                        {selectedMsg.ip_address
                          ? selectedMsg.ip_address.split('.').slice(0, 3).join('.') + '.*'
                          : (t.notAvailable || 'Indisponible')}
                      </p>
                    </div>

                    {/* Device */}
                    {(selectedMsg.phone_type || selectedMsg.browser_name) && (
                      <div className="rounded-[22px] px-4 py-4" style={{ background: '#F7F7F9' }}>
                        <p className="text-[10px] font-semibold text-[#ADADAD] uppercase tracking-widest mb-1.5">{t.device || 'Appareil'}</p>
                        <p className="text-[16px] font-bold text-[#0D0D0D]">{selectedMsg.phone_type ?? (t.unknown || 'Inconnu')}</p>
                        {selectedMsg.browser_name && (
                          <p className="text-[12px] text-[#ADADAD] mt-0.5">{selectedMsg.browser_name}</p>
                        )}
                      </div>
                    )}

                    {/* Message count */}
                    <div className="rounded-[22px] px-4 py-4" style={{ background: '#F7F7F9' }}>
                      <p className="text-[10px] font-semibold text-[#ADADAD] uppercase tracking-widest mb-1.5">{t.messagesFromThisSender || 'Messages de cet expéditeur'}</p>
                      <p className="text-[26px] font-extrabold text-[#0D0D0D]">
                        {loadingInsights ? '—' : senderCount !== null ? senderCount : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Map */}
                  {selectedMsg?.latitude && selectedMsg?.longitude ? (
                    <div className="mb-5">
                      <InsightsMap
                        latitude={parseFloat(selectedMsg.latitude)}
                        longitude={parseFloat(selectedMsg.longitude)}
                      />
                    </div>
                  ) : (
                    <div className="w-full rounded-[22px] mb-5 flex items-center justify-center border border-[#EBEBEB]" style={{ height: 80 }}>
                      <p className="text-[13px] text-[#ADADAD]">{t.locationMapNotAvailable || 'Carte de localisation indisponible'}</p>
                    </div>
                  )}

                  <button onClick={() => isPro ? startConversation() : setShowProScreen(true)} className="w-full py-[15px] rounded-full bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform">
                    {t.chatBtn || 'Chat 👀'}
                  </button>
                </div>
              )}

              {/* ── Conversation thread ── */}
              {showConv && (() => {
                const myId = userIdRef.current
                const lastReadSentId = [...convMsgs].reverse().find(m => m.sender_id === myId && m.is_read)?.id
                return (
                  <div className="flex flex-col slide-from-right" style={{ height: '100%' }}>
                    <div className="px-5 pt-2 pb-3 border-b border-[#F0F0F0] flex-shrink-0">
                      <button onClick={() => setShowConv(false)} className="flex items-center gap-1.5 text-[#ADADAD] text-[13px] py-1 active:opacity-60 mb-1">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {t.back || 'Retour'}
                      </button>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[16px] font-bold text-[#0D0D0D]">{t.anonymousSender || 'Expéditeur anonyme'}</p>
                          <p className="text-[11px] text-[#ADADAD]">{t.privateConversation || 'Conversation privée'}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-[#2AC642]" />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5">
                      {convMsgs.length === 0 && (
                        <p className="text-[14px] text-[#ADADAD] text-center mt-8">{t.startTheConversation || 'Commencer la conversation'}</p>
                      )}
                      {convMsgs.map((m, i) => {
                        const isMine = m.sender_id === myId
                        const isLastMine = isMine && convMsgs.slice(i + 1).every(n => n.sender_id !== myId)
                        return (
                          <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            {m.gif_url ? (
                              <img src={m.gif_url} alt="GIF" className="max-w-[220px] rounded-[16px] block" style={{ border: isMine ? '2px solid rgba(255,107,107,0.3)' : '2px solid #E8E8E8' }} />
                            ) : (
                              <div className="max-w-[78%] px-4 py-3"
                                style={{
                                  background: isMine ? '#0D0D0D' : '#F2F2F2',
                                  borderRadius: isMine ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                }}>
                                <p style={{ color: isMine ? '#FFF' : '#0D0D0D', fontSize: '15px', lineHeight: '1.4' }}>{m.content}</p>
                              </div>
                            )}
                            {(isLastMine || (i === convMsgs.length - 1 && !isMine)) && (
                              <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[10px] text-[#C8C8C8]">{timeAgo(m.created_at)}</span>
                                {isMine && m.id === lastReadSentId && <span className="text-[10px] text-[#2AC642] font-medium">{t.readIndicator || 'Lu'}</span>}
                                {isMine && m.id !== lastReadSentId && isLastMine && <span className="text-[10px] text-[#C8C8C8]">{t.sentIndicator || 'Envoyé'}</span>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      <div ref={convBottomRef} />
                    </div>

                    <div className="px-4 pb-6 pt-2 border-t border-[#F0F0F0] flex-shrink-0">
                      {showConvGifPicker && (
                        <div className="relative h-0 mb-[316px]">
                          <GifPicker
                            onSelect={gif => sendConvGif(gif)}
                            onClose={() => setShowConvGifPicker(false)}
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowConvGifPicker(p => !p)}
                          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 text-[18px]"
                          style={{ background: showConvGifPicker ? '#0D0D0D' : '#F5F5F5' }}
                        >
                          <span style={{ filter: showConvGifPicker ? 'brightness(0) invert(1)' : 'none' }}>🎬</span>
                        </button>
                        <input
                          value={convInput} onChange={e => setConvInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendConvMsg() } }}
                          placeholder={t.messagePlaceholder || 'Message…'} maxLength={500}
                          className="flex-1 rounded-full bg-[#F5F5F5] px-4 py-3 text-[15px] text-[#0D0D0D] outline-none"
                          style={{ fontFamily: 'inherit' }}
                        />
                        <button onClick={sendConvMsg} disabled={!convInput.trim() || convSending} className="w-10 h-10 rounded-full bg-[#0D0D0D] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 flex-shrink-0">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Bottom buttons — main view only */}
            {!showInsights && !showConv && !showReply && (
              <div className="px-5 pb-8 pt-2.5 flex gap-3 border-t border-[#F0F0F0] flex-shrink-0">
                <button onClick={() => setShowReply(true)} className="flex-1 py-[15px] rounded-full bg-[#0D0D0D] text-white font-bold text-[15px] active:scale-95 transition-transform">{t.reply}</button>
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex-1 py-[15px] rounded-full font-bold text-[15px] active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center"
                  style={{ background: '#F2F2F2', color: '#0D0D0D' }}
                >
                  {sharing
                    ? <div className="w-5 h-5 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                    : t.share
                  }
                </button>
              </div>
            )}
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Fullscreen image viewer ── */}
      {showFullscreen && imageUrl && portalTarget && createPortal(
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 pt-12 pb-4">
            <button onClick={() => setShowFullscreen(false)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.14)' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <img src="/assets/TBH_Title_Logo.svg" alt="TBH" className="h-6 invert" />
            <div className="w-10" />
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" style={{ touchAction: 'pinch-zoom' }} />
          </div>
          {textContent && (
            <div className="px-5 pb-10">
              <div className="rounded-[20px] px-5 py-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p className="text-white text-center text-[16px] font-medium">{textContent}</p>
              </div>
            </div>
          )}
        </div>,
        portalTarget
      )}

      {/* GIF picker overlay for reply mode */}
      {showGifPicker && portalTarget && createPortal(
        <div className="fixed inset-0 z-[65]" onTouchStart={e => e.stopPropagation()} onClick={() => setShowGifPicker(false)}>
          <div className="absolute bottom-28 left-4 right-4" onClick={e => e.stopPropagation()}>
            <div className="relative h-0">
              <GifPicker
                onSelect={gif => { setSelectedGif(gif); setShowGifPicker(false) }}
                onClose={() => setShowGifPicker(false)}
              />
            </div>
          </div>
        </div>,
        portalTarget
      )}

      {/* Pro screen */}
      {showProScreen && (
        <TBHProScreen
          onClose={() => setShowProScreen(false)}
          onSuccess={() => setShowProScreen(false)}
        />
      )}
    </>
  )
}