import { Outfit } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={`${outfit.className} ${outfit.variable} font-outfit`}>{children}</div>
}
