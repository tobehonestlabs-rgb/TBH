'use client'

import { useState, useEffect } from 'react'

type Browser = 'instagram' | 'whatsapp' | 'facebook' | null

function detectBrowser(): Browser {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/Instagram/.test(ua)) return 'instagram'
  if (/WhatsApp/.test(ua)) return 'whatsapp'
  if (/FBAN|FBAV/.test(ua)) return 'facebook'
  return null
}

function isIOS() {
  return /iP(hone|ad|od)/.test(navigator.userAgent)
}

const BROWSER_NAMES: Record<NonNullable<Browser>, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)',
      }}>
        {n}
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>{text}</p>
    </div>
  )
}

export default function InAppBrowserBanner() {
  const [browser, setBrowser] = useState<Browser>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setBrowser(detectBrowser())
  }, [])

  if (!browser) return null

  const ios = isIOS()
  const targetBrowser = ios ? 'Safari' : 'Chrome'
  const menuIcon = browser === 'instagram' ? '···' : '⋮'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback: user copies manually */ }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.94)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: '340px',
        background: '#1A1A1A',
        borderRadius: '28px', padding: '32px 24px',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center',
      }}>

        {/* Icon */}
        <div style={{
          width: '60px', height: '60px', borderRadius: '16px',
          background: '#252525',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="15 3 21 3 21 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10" y1="14" x2="21" y2="3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '19px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            Open in {targetBrowser}
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
            {BROWSER_NAMES[browser]}&apos;s browser doesn&apos;t support sign-in.
            Open this page in {targetBrowser} to continue.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ios ? (
            <>
              <Step n={1} text={`Tap ${menuIcon} in the top-right corner`} />
              <Step n={2} text={`Select "Open in ${targetBrowser}"`} />
            </>
          ) : (
            <>
              <Step n={1} text="Tap the menu (⋮) in the top-right corner" />
              <Step n={2} text={`Select "Open in ${targetBrowser}"`} />
            </>
          )}
        </div>

        <button
          onClick={handleCopy}
          style={{
            width: '100%', padding: '15px', borderRadius: '99px', border: 'none',
            background: copied ? '#22C55E' : '#FFFFFF',
            color: copied ? '#fff' : '#000',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? 'Link copied!' : 'Copy link to open manually'}
        </button>
      </div>
    </div>
  )
}
