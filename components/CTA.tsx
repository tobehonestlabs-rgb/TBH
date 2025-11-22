'use client'

/**
 * Call-to-Action Section Component
 * Invites users to try the app or join beta
 */
export default function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-black/5 to-white relative overflow-hidden">
      {/* Background decoration with rainbow accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 glass rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 glass rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-8 sm:p-12 lg:p-16 fade-in-on-scroll">
            {/* Main CTA Title */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Ready to <span className="rainbow-text">Connect</span>?
            </h2>

            {/* CTA Description */}
            <p className="text-lg sm:text-xl md:text-2xl text-black/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join millions of users discovering authentic connections through anonymous messages, voices, and photos.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {/* Primary CTA - Join Beta */}
              <a
                href="#"
                className="glass-card px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/25 rainbow-border group"
                aria-label="Join Beta"
              >
                <div className="px-6 py-2">
                  <span>Join Beta Waitlist</span>
                </div>
              </a>

              {/* Secondary CTA - Learn More */}
              <a
                href="#"
                className="glass-card px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20"
                aria-label="Learn More"
              >
                Learn More
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm sm:text-base text-black/60">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>100% Anonymous</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>100M+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Free to Use</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

