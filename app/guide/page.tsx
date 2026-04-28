'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function HowToSharePage() {
  const steps = [
    {
      id: 1,
      title: "COPY YOUR LINK",
      desc: "Your unique TBH link is the key. It's already waiting in your clipboard.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )
    },
    {
      id: 2,
      title: "PICK YOUR VIBE",
      desc: "Open Instagram or Snapchat. Capture or upload the card you just saved.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002-2z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "STICK THE LINK",
      desc: "Use the 'Link' sticker (IG) or 'Paperclip' (Snap). Paste your link and place it over the card.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    }
  ]

  return (
    <main className="min-h-screen bg-black text-white px-8 py-16 flex flex-col items-center">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-orange-600/20 to-transparent blur-[120px] pointer-events-none" />

      {/* Logo */}
      <div className="relative mb-12">
        <Image 
          src="/assets/TBH_Title_Logo.svg" 
          alt="TBH Logo" 
          width={80} 
          height={30} 
          className="invert brightness-200"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <h1 className="text-5xl font-black tracking-tighter italic mb-2">GO VIRAL.</h1>
        <p className="text-gray-400 font-bold mb-12 tracking-tight">How to share your TBH link correctly:</p>

        {/* Steps */}
        <div className="space-y-10">
          {steps.map((step) => (
            <div key={step.id} className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">
                {step.id}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-widest text-white">{step.title}</h3>
                <p className="text-[15px] text-gray-500 font-medium leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <Link href="/home" className="block w-full">
            <button className="w-full h-16 bg-white text-black rounded-2xl font-black text-sm tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-xl">
              I'M READY
            </button>
          </Link>
          
          <p className="mt-6 text-center text-xs text-gray-600 font-bold uppercase tracking-widest">
            Anonymous messaging is live.
          </p>
        </div>
      </div>
    </main>
  )
}