'use client'

import React from 'react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
        style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
      >
        <div className="p-8 flex flex-col items-center text-center">
          {/* Decorative handle */}
          <div className="w-12 h-1 bg-gray-200 rounded-full mb-8" />

          <h2 className="text-3xl font-black tracking-tighter leading-none mb-6 italic">
            HOW TO SHARE
          </h2>

          <div className="w-full space-y-6 text-left mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">1</div>
              <p className="text-sm font-bold text-gray-500 leading-tight">
                Your link is already <span className="text-black">copied to your clipboard.</span>
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">2</div>
              <p className="text-sm font-bold text-gray-500 leading-tight">
                Pick your app below and <span className="text-black">paste the link</span> using the sticker or paperclip tool.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">3</div>
              <p className="text-sm font-bold text-gray-500 leading-tight">
                Overlay your <span className="text-black">saved image</span> and post!
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full h-14 bg-black text-white rounded-2xl font-black text-sm tracking-widest active:scale-95 transition-transform"
          >
            LET'S GO
          </button>
        </div>
      </div>
    </div>
  )
}