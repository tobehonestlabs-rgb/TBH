'use client'

/**
 * Reviews Section Component
 * User testimonials in glass cards with fun anecdotes
 */
export default function Reviews() {
  const reviews = [
    {
      name: 'Alex M.',
      message: 'Got the sweetest anonymous message from someone who noticed I was having a rough week. TBH made my day! 🌈',
      rating: 5,
      highlight: 'Made my day',
    },
    {
      name: 'Sam K.',
      message: 'The voice messages feature is incredible. Hearing someone say "you\'re amazing" anonymously hits different. So authentic!',
      rating: 5,
      highlight: 'Incredible',
    },
    {
      name: 'Jordan L.',
      message: 'Love the hints feature! It\'s like a fun guessing game. I\'ve reconnected with old friends through this app.',
      rating: 5,
      highlight: 'Fun guessing game',
    },
    {
      name: 'Taylor R.',
      message: 'Received a photo collage from someone showing our friendship journey. Cried happy tears. This app is special.',
      rating: 5,
      highlight: 'Special',
    },
    {
      name: 'Casey D.',
      message: 'The anonymous format lets people be honest without fear. I\'ve learned so much about how others see me. Game changer!',
      rating: 5,
      highlight: 'Game changer',
    },
    {
      name: 'Morgan P.',
      message: 'Best part? The mystery of not knowing who sent what makes every notification exciting. Addicted in the best way!',
      rating: 5,
      highlight: 'Addicted',
    },
  ]

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-white to-black/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] glass rounded-full blur-3xl opacity-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-on-scroll">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            What Users <span className="rainbow-text">Say</span>
          </h2>
          <p className="text-lg sm:text-xl text-black/60 max-w-2xl mx-auto">
            Real stories from our community of 100M+ users
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="glass-card fade-in-on-scroll group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <span
                    key={i}
                    className="text-yellow-400 text-lg"
                    style={{
                      filter: 'drop-shadow(0 0 2px rgba(255, 217, 61, 0.5))',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Review Message */}
              <p className="text-black/80 text-base sm:text-lg mb-4 leading-relaxed italic">
                "{review.message}"
              </p>

              {/* Highlight Badge */}
              <div className="inline-block glass px-3 py-1 rounded-full mb-4">
                <span className="text-xs sm:text-sm font-semibold text-black/70">
                  {review.highlight}
                </span>
              </div>

              {/* Reviewer Name */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                  <span className="text-lg">
                    {review.name.charAt(0)}
                  </span>
                </div>
                <span className="font-semibold text-black/80">{review.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="mt-16 text-center fade-in-on-scroll">
          <div className="glass-card inline-block px-8 py-4">
            <p className="text-sm sm:text-base text-black/60">
              <span className="font-bold text-black text-lg">4.9/5</span> average rating from{' '}
              <span className="font-bold text-black">2M+</span> reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

