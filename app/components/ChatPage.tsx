'use client'

import React from 'react'

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center animate-in fade-in duration-700">
      
      {/* Animated Icon Container */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B6B] to-[#4D96FF] rounded-[30px] rotate-12 opacity-20 animate-pulse" />
        <div className="absolute inset-0 bg-white shadow-xl rounded-[28px] flex items-center justify-center text-4xl">
          🤫
        </div>
        {/* Little notification badge decoration */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-4 border-white animate-bounce" />
      </div>

      {/* Text Content */}
      <h2 className="text-[28px] font-extrabold text-[#0D0D0D] tracking-tight mb-3">
        Private Chat
      </h2>
      
      <p className="text-[16px] text-[#666] leading-relaxed mb-8">
        Soon you'll be able to reply to your admirers and friends <span className="font-bold text-[#0D0D0D]">anonymously</span>. 
      </p>

      {/* "Coming Soon" Pill */}
      <div className="px-6 py-3 rounded-full bg-[#F2F2F2] flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[13px] font-bold text-[#888] uppercase tracking-widest">
          In Development
        </span>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-1/2 left-1/2 -z-10 w-[300px] h-[300px] bg-[#4D96FF]/5 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
    </div>
  )
}