'use client'

import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { name: 'Home', href: '#', emoji: '🏠' },
    { name: 'Manage Subscription', href: '#', emoji: '💳' },
    { name: 'Press', href: '#', emoji: '📰' },
    { name: 'Jobs', href: '#', emoji: '💼' },
    { name: 'Investment', href: '#', emoji: '📈' },
    { name: 'App Store', href: '#', emoji: '📱' },
    { name: 'Google Play Store', href: '#', emoji: '🤖' },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">TBH</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col gap-1.5 p-2"
              aria-label="Menu"
            >
              <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Expanded Menu */}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 right-0 z-40 glass-menu pt-20">
          <div className="container mx-auto px-6 pb-8">
            <nav className="flex flex-col gap-1 glass rounded-2xl p-4">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="px-4 py-4 text-white text-xl font-medium hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span>{item.name}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  )
}
