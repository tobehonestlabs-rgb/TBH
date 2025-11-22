'use client'

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-16">
            <h2 className="text-6xl md:text-7xl font-bold mb-8">
              Ready to Connect? 🚀
            </h2>
            <p className="text-2xl text-black/60 mb-12">
              Join millions discovering authentic connections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-5 bg-black text-white rounded-full text-xl font-semibold hover:bg-black/90 transition-colors">
                Get Started Now ✨
              </button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-lg text-black/50">
              <div>✓ 100% Anonymous</div>
              <div>✓ 100M+ Users</div>
              <div>✓ Free to Use</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
