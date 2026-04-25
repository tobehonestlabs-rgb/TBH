'use client'

export default function Reviews() {
  const reviews = [
    {
      name: 'Alex M.',
      message: 'Got the sweetest anonymous message! Made my day!',
      accent: 'from-cyan-400 to-blue-500',
    },
    {
      name: 'Sam K.',
      message: 'Voice messages are incredible. So authentic!',
      accent: 'from-fuchsia-500 to-pink-500',
    },
    {
      name: 'Jordan L.',
      message: 'Love the hints feature! Fun guessing game.',
      accent: 'from-emerald-400 to-cyan-500',
    },
    {
      name: 'Taylor R.',
      message: 'Received a photo collage. Cried happy tears.',
      accent: 'from-orange-400 to-rose-500',
    },
    {
      name: 'Casey D.',
      message: 'Game changer! Learned so much about myself.',
      accent: 'from-blue-400 to-violet-500',
    },
    {
      name: 'Morgan P.',
      message: 'Every notification is exciting. Addicted!',
      accent: 'from-cyan-300 to-blue-500',
    },
  ]

  return (
    <section id="reviews" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-4">Community</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white">Real reactions from real people.</h2>
          <p className="mt-4 text-lg text-white/60 max-w-3xl mx-auto">
            See why millions choose TBH for private, honest sharing in a dark, premium environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="glass-card p-8">
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                “{review.message}”
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${review.accent} flex items-center justify-center text-base font-semibold text-white`}> 
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">{review.name}</p>
                  <p className="text-sm text-white/50">Verified user</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-white/60">
          <p className="text-2xl md:text-3xl font-semibold text-white">4.9/5 average rating</p>
          <p className="mt-3 text-lg">Trusted by millions of users worldwide.</p>
        </div>
      </div>
    </section>
  )
}
