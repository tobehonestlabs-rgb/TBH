'use client'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Emoji Icon */}
          <div className="mb-8">
            <span className="text-8xl">💬</span>
          </div>

          {/* Main Title */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight">
            TBH
          </h1>

          {/* Tagline */}
          <p className="text-3xl md:text-4xl text-black/60 mb-12 font-light leading-tight">
            Anonymous messages, voices & photos 📸
          </p>

          {/* Stats */}
          <div className="mb-16">
            <p className="text-xl text-black/50">
              Join <span className="font-semibold text-black">100M+</span> users worldwide 🌍
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-full text-xl font-semibold hover:bg-black/90 transition-colors">
              Download Now 📱
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-black text-black rounded-full text-xl font-semibold hover:bg-black/5 transition-colors">
              Learn More ✨
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
