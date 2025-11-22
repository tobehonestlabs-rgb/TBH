'use client'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            {/* Main Title */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              TBH
            </h1>

            {/* Tagline */}
            <p className="text-3xl md:text-4xl text-white/80 mb-8 font-light leading-tight">
              Anonymous messages, voices & photos
            </p>

            {/* Stats */}
            <div className="mb-12">
              <p className="text-xl text-white/60">
                Join <span className="font-semibold text-white">100M+</span> users worldwide
              </p>
            </div>

            {/* App Store Badges - PLACEHOLDERS */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Replace these with actual App Store and Google Play badge images */}
              <div className="w-48 h-14 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm">App Store Badge</span>
              </div>
              <div className="w-48 h-14 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm">Google Play Badge</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/50">
                Download Now
              </button>
              <button className="px-10 py-5 bg-white/10 border-2 border-white/20 text-white rounded-full text-xl font-semibold hover:bg-white/20 transition-all">
                Learn More
              </button>
            </div>
          </div>

          {/* Right: Phone Mockup with App Screenshot - PLACEHOLDER */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-64 h-[550px] bg-gray-800 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-700">
                <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden flex items-center justify-center">
                  {/* Replace this div with your app screenshot image */}
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <span className="text-white/30 text-sm">App Screenshot Placeholder</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
