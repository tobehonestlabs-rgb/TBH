import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'TBH - Receive Anonymous Messages, Voices & Photos',
  description: 'TBH lets you receive anonymous messages, voices, and photos from peers with intuitive hints about the sender. Join over 100M users.',
  keywords: 'anonymous messages, social app, TBH, anonymous feedback',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TBH',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* iOS standalone PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180.png" />
      </head>
      <body>
        <div id="desktop-bg">
          <div id="desktop-decor" aria-hidden="true">
            <div className="decor-card" style={{ ['--rot' as string]: '-7deg',  ['--dur' as string]: '7.4s', ['--delay' as string]: '0s',   left: '4%',  top: '8%',   background: '#FF3F1D', color: '#fff' }}>Send me a wild pic 😏</div>
            <div className="decor-card" style={{ ['--rot' as string]: '5deg',   ['--dur' as string]: '8.6s', ['--delay' as string]: '1.1s', left: '7%',  top: '34%',  background: '#9B5DE5', color: '#fff' }}>Make me laugh 😂</div>
            <div className="decor-card" style={{ ['--rot' as string]: '-11deg', ['--dur' as string]: '6.8s', ['--delay' as string]: '2.4s', left: '9%',  top: '60%',  background: '#0D0D0D', color: '#fff' }}>Roast me 🔥</div>
            <div className="decor-card" style={{ ['--rot' as string]: '9deg',   ['--dur' as string]: '9.2s', ['--delay' as string]: '0.5s', left: '5%',  top: '83%',  background: '#4D96FF', color: '#fff' }}>Truth or Dare? 🎲</div>
            <div className="decor-card" style={{ ['--rot' as string]: '6deg',   ['--dur' as string]: '7.9s', ['--delay' as string]: '1.6s', right: '5%', top: '7%',   background: '#FF6B9D', color: '#fff' }}>Drop a hot take 🌶️</div>
            <div className="decor-card" style={{ ['--rot' as string]: '-8deg',  ['--dur' as string]: '6.6s', ['--delay' as string]: '0.9s', right: '6%', top: '30%',  background: '#FFE66D', color: '#0D0D0D' }}>Be honest 👀</div>
            <div className="decor-card" style={{ ['--rot' as string]: '11deg',  ['--dur' as string]: '8.3s', ['--delay' as string]: '2.0s', right: '7%', top: '57%',  background: '#6BCB77', color: '#fff' }}>Q&amp;A anything 🎯</div>
            <div className="decor-card" style={{ ['--rot' as string]: '-5deg',  ['--dur' as string]: '7.5s', ['--delay' as string]: '0.3s', right: '4%', top: '82%',  background: '#FF512F', color: '#fff' }}>Anonymous love 💌</div>
          </div>
          <div id="app-shell">
            {children}
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
