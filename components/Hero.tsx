'use client'

/**
 * Hero Section Component
 * Displays the main app title, tagline, and call-to-action buttons
 */
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-white to-black/5">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 glass rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 glass rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* App Logo/Icon Placeholder */}
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 glass-strong rounded-3xl flex items-center justify-center rainbow-border">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl sm:text-7xl font-bold">TBH</span>
              </div>
            </div>
          </div>

          {/* Main Title with Glassmorphism */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 glass-strong px-8 py-6 rounded-3xl inline-block">
            <span className="rainbow-text">TBH</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl md:text-3xl text-black/70 mb-4 font-light">
            Receive anonymous messages, voices, and photos
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-black/60 mb-12 font-light">
            with intuitive hints about the sender
          </p>

          {/* Download Stats */}
          <div className="mb-12 glass-card inline-block">
            <p className="text-sm sm:text-base text-black/60">
              Join over <span className="font-bold text-black">100M+</span> users worldwide
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* App Store Button */}
            <a
              href="#"
              className="glass-card px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20 group"
              aria-label="Download on App Store"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.69-2.2.5-3.08-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>App Store</span>
                <span className="text-xs opacity-60">(Coming Soon)</span>
              </div>
            </a>

            {/* Google Play Button */}
            <a
              href="#"
              className="glass-card px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20 group"
              aria-label="Get it on Google Play"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span>Google Play</span>
                <span className="text-xs opacity-60">(Coming Soon)</span>
              </div>
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-20 animate-bounce">
            <div className="w-6 h-10 glass rounded-full mx-auto flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-black/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

