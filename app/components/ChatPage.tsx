'use client'

import React from 'react'

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
      <h2 className="text-[26px] font-extrabold text-[#0D0D0D] tracking-tight mb-3">
        Private chat
      </h2>
      <p className="text-[15px] text-[#888] leading-relaxed max-w-[280px]">
        Reply to your anonymous senders, and start an anonymous conversation
      </p>
    </div>
  )
}
