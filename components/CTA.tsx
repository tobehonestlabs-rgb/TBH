'use client'

export default function CTA() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold mb-8 text-white">
            Ready to Connect?
          </h2>
          <p className="text-2xl text-white/70 mb-12">
            Join millions discovering authentic connections
          </p>
          <div className="flex justify-center">
            <button className="px-12 py-4 bg-white text-black rounded-full text-xl font-semibold hover:bg-white/90 transition-colors">
              Get Started Now
            </button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-lg text-white/60">
            <div>100% Anonymous</div>
            <div>100M+ Users</div>
            <div>Free to Use</div>
          </div>
        </div>
      </div>
    </section>
  )
}
