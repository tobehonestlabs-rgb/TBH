'use client'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <span className="text-2xl font-bold">TBH</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-black/70 hover:text-black text-lg font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-black/70 hover:text-black text-lg font-medium">
              How It Works
            </a>
            <a href="#reviews" className="text-black/70 hover:text-black text-lg font-medium">
              Reviews
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 bg-black text-white rounded-full text-lg font-semibold hover:bg-black/90 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

