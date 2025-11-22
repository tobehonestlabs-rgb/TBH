'use client'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-white">TBH</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/70 hover:text-white text-lg font-medium transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-white/70 hover:text-white text-lg font-medium transition-colors">
              How It Works
            </a>
            <a href="#reviews" className="text-white/70 hover:text-white text-lg font-medium transition-colors">
              Reviews
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
