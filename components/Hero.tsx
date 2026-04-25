'use client'

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24 pb-20 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_20%),radial-gradient(circle_at_80%_30%,_rgba(236,72,153,0.16),_transparent_18%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70 mb-8">
            <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            Premium black experience — redesigned for night mode.
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white">
            TBH
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400">anonymous feedback</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl sm:text-2xl text-white/70 leading-relaxed">
            Send anonymous messages, voice notes, and photo reactions in a sleek dark interface built to feel premium, private, and effortless.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-semibold text-black transition hover:bg-white/90">
              Start Free
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-10 py-4 text-lg font-semibold text-white transition hover:bg-white/10">
              See Demo
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left w-full max-w-3xl mx-auto">
            <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Users</p>
              <p className="mt-3 text-3xl font-bold text-white">100M+</p>
            </div>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Anonymous</p>
              <p className="mt-3 text-3xl font-bold text-white">100%</p>
            </div>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Review</p>
              <p className="mt-3 text-3xl font-bold text-white">4.9★</p>
            </div>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Launch</p>
              <p className="mt-3 text-3xl font-bold text-white">Now</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
