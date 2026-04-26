import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'TBH - Receive Anonymous Messages, Voices & Photos',
  description: 'TBH lets you receive anonymous messages, voices, and photos from peers with intuitive hints about the sender. Join over 100M users.',
  keywords: 'anonymous messages, social app, TBH, anonymous feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

