'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface SharePlatformSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (platform: 'snapchat' | 'instagram' | 'whatsapp') => void
  title?: string
  subtitle?: string
  cancelText?: string
  portalTarget?: HTMLElement | null
}

export default function SharePlatformSheet({
  isOpen,
  onClose,
  onSelect,
  title = 'Partager sur',
  subtitle = 'Choisis une application pour partager ton image',
  cancelText = 'Annuler',
  portalTarget,
}: SharePlatformSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setClosing(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      onClose()
      setClosing(false)
    }, 200)
  }

  const handleSelect = (platform: 'snapchat' | 'instagram' | 'whatsapp') => {
    // Call directly in user tap gesture context to preserve Web Share privileges
    onSelect(platform)
  }

  if (!mounted || (!isOpen && !closing)) return null

  const target = portalTarget || (typeof document !== 'undefined' ? document.body : null)
  if (!target) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-end"
      onTouchStart={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          closing ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Sheet panel */}
      <div
        className={`relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-[32px] px-5 pt-3 pb-8 shadow-2xl transition-transform duration-200 ease-out select-none ${
          closing ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E5E5EA]" />
        </div>

        {/* Header */}
        <div className="text-center mb-5">
          <h3 className="text-[20px] font-extrabold text-[#0D0D0D] tracking-tight">{title}</h3>
          {subtitle && <p className="text-[13px] text-[#8E8E93] mt-0.5">{subtitle}</p>}
        </div>

        {/* Platform selection items */}
        <div className="flex flex-col gap-2.5 mb-4">
          {/* Snapchat */}
          <button
            onClick={() => handleSelect('snapchat')}
            type="button"
            className="w-full flex items-center gap-3.5 p-3.5 rounded-[22px] bg-[#F7F7F9] hover:bg-[#EFEFF3] active:scale-[0.98] transition-all text-left cursor-pointer"
          >
            <div className="w-12 h-12 rounded-[16px] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm bg-[#FFFC00]">
              <img
                src="/assets/social_media_icons/snapshat_icon.svg"
                alt="Snapchat"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-[#0D0D0D]">Snapchat</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFC00] text-black border border-black/10">
                  Lien copié
                </span>
              </div>
              <p className="text-[12px] text-[#8E8E93] truncate">Image seule • Lien copié automatiquement</p>
            </div>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#C4C4C6] flex-shrink-0">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Instagram */}
          <button
            onClick={() => handleSelect('instagram')}
            type="button"
            className="w-full flex items-center gap-3.5 p-3.5 rounded-[22px] bg-[#F7F7F9] hover:bg-[#EFEFF3] active:scale-[0.98] transition-all text-left cursor-pointer"
          >
            <div className="w-12 h-12 rounded-[16px] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
              <img
                src="/assets/social_media_icons/IG_icon.svg"
                alt="Instagram"
                className="w-12 h-12 object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#0D0D0D]">Instagram</p>
              <p className="text-[12px] text-[#8E8E93] truncate">Story ou message direct</p>
            </div>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#C4C4C6] flex-shrink-0">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => handleSelect('whatsapp')}
            type="button"
            className="w-full flex items-center gap-3.5 p-3.5 rounded-[22px] bg-[#F7F7F9] hover:bg-[#EFEFF3] active:scale-[0.98] transition-all text-left cursor-pointer"
          >
            <div className="w-12 h-12 rounded-[16px] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm bg-[#25D366]">
              <img
                src="/assets/social_media_icons/Platform=WhatsApp, Color=Original.svg"
                alt="WhatsApp"
                className="w-8 h-8 object-contain brightness-0 invert"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#0D0D0D]">WhatsApp</p>
              <p className="text-[12px] text-[#8E8E93] truncate">Statut ou conversation</p>
            </div>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#C4C4C6] flex-shrink-0">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={handleClose}
          type="button"
          className="w-full py-3.5 rounded-full bg-[#F2F2F7] text-[#0D0D0D] font-bold text-[15px] active:scale-[0.98] transition-transform"
        >
          {cancelText}
        </button>
      </div>
    </div>,
    target
  )
}
