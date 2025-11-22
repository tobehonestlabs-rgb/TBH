'use client'

export default function Reviews() {
  const reviews = [
    {
      profileImage: '/images/reviews/alex.jpg',
      name: 'Alex M.',
      message: 'Got the sweetest anonymous message! Made my day!',
    },
    {
      profileImage: '/images/reviews/sam.jpg',
      name: 'Sam K.',
      message: 'Voice messages are incredible. So authentic!',
    },
    {
      profileImage: '/images/reviews/jordan.jpg',
      name: 'Jordan L.',
      message: 'Love the hints feature! Fun guessing game.',
    },
    {
      profileImage: '/images/reviews/taylor.jpg',
      name: 'Taylor R.',
      message: 'Received a photo collage. Cried happy tears.',
    },
    {
      profileImage: '/images/reviews/casey.jpg',
      name: 'Casey D.',
      message: 'Game changer! Learned so much about myself.',
    },
    {
      profileImage: '/images/reviews/morgan.jpg',
      name: 'Morgan P.',
      message: 'Every notification is exciting. Addicted!',
    },
  ]

  return (
    <section id="reviews" className="py-24 bg-gradient-to-b from-white via-pink-50/30 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 text-black">
              What Users Say 💬
            </h2>
            <p className="text-xl text-black/60">
              Real stories from 100M+ users
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-black p-8 rounded-2xl border border-white/10"
              >
                <p className="text-xl text-white/90 mb-6 leading-relaxed">
                  "{review.message}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    <img 
                      src={review.profileImage} 
                      alt={review.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.className = 'w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center';
                        e.currentTarget.parentElement!.textContent = review.name.charAt(0);
                      }}
                    />
                  </div>
                  <span className="font-semibold text-lg text-white">{review.name}</span>
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
