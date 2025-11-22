'use client'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 bg-black">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold mb-8 tracking-tight text-white">
            TBH
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-white/80 mb-12 font-light">
            Anonymous messages, voices & photos 💬
          </p>

          {/* Stats */}
          <div className="mb-16">
            <p className="text-lg text-white/60">
              Join <span className="font-semibold text-white">100M+</span> users worldwide 🌍
            </p>
          </div>

          {/* App Store Badges - PLACEHOLDERS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="w-48 h-14 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
              <span className="text-white/50 text-sm">App Store Badge</span>
            </div>
            <div className="w-48 h-14 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
              <span className="text-white/50 text-sm">Google Play Badge</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button className="px-12 py-4 bg-white text-black rounded-full text-xl font-semibold hover:bg-white/90 transition-colors">
              Get Started ✨
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
