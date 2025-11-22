'use client'

export default function Reviews() {
  const reviews = [
    {
      emoji: '😊',
      name: 'Alex M.',
      message: 'Got the sweetest anonymous message! Made my day! 🌈',
    },
    {
      emoji: '🎉',
      name: 'Sam K.',
      message: 'Voice messages are incredible. So authentic!',
    },
    {
      emoji: '💕',
      name: 'Jordan L.',
      message: 'Love the hints feature! Fun guessing game.',
    },
    {
      emoji: '😭',
      name: 'Taylor R.',
      message: 'Received a photo collage. Cried happy tears.',
    },
    {
      emoji: '🔥',
      name: 'Casey D.',
      message: 'Game changer! Learned so much about myself.',
    },
    {
      emoji: '✨',
      name: 'Morgan P.',
      message: 'Every notification is exciting. Addicted!',
    },
  ]

  return (
    <section id="reviews" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6">
              What Users Say 💬
            </h2>
            <p className="text-2xl text-black/50">
              Real stories from 100M+ users
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="glass-card p-8"
              >
                <div className="text-4xl mb-4">{review.emoji}</div>
                <p className="text-xl text-black/80 mb-6 leading-relaxed">
                  "{review.message}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
                    <span className="text-xl">{review.emoji}</span>
                  </div>
                  <span className="font-semibold text-lg">{review.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 text-center">
            <p className="text-2xl text-black/60">
              <span className="font-bold text-black text-3xl">4.9/5</span> from{' '}
              <span className="font-bold text-black">2M+</span> reviews ⭐
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
