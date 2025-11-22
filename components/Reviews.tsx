'use client'

export default function Reviews() {
  const reviews = [
    {
      // TO CHANGE PROFILE PICTURE: Replace the image src below with the actual profile picture URL
      // Example: profileImage: '/images/reviews/alex.jpg' or profileImage: 'https://example.com/alex.jpg'
      profileImage: '/images/reviews/alex.jpg', // PLACEHOLDER - Replace with actual image path
      name: 'Alex M.',
      message: 'Got the sweetest anonymous message! Made my day!',
    },
    {
      profileImage: '/images/reviews/sam.jpg', // PLACEHOLDER - Replace with actual image path
      name: 'Sam K.',
      message: 'Voice messages are incredible. So authentic!',
    },
    {
      profileImage: '/images/reviews/jordan.jpg', // PLACEHOLDER - Replace with actual image path
      name: 'Jordan L.',
      message: 'Love the hints feature! Fun guessing game.',
    },
    {
      profileImage: '/images/reviews/taylor.jpg', // PLACEHOLDER - Replace with actual image path
      name: 'Taylor R.',
      message: 'Received a photo collage. Cried happy tears.',
    },
    {
      profileImage: '/images/reviews/casey.jpg', // PLACEHOLDER - Replace with actual image path
      name: 'Casey D.',
      message: 'Game changer! Learned so much about myself.',
    },
    {
      profileImage: '/images/reviews/morgan.jpg', // PLACEHOLDER - Replace with actual image path
      name: 'Morgan P.',
      message: 'Every notification is exciting. Addicted!',
    },
  ]

  return (
    <section id="reviews" className="py-24 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
              What Users Say
            </h2>
            <p className="text-2xl text-white/60">
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
                <p className="text-xl text-white/90 mb-6 leading-relaxed">
                  "{review.message}"
                </p>
                <div className="flex items-center gap-3">
                  {/* Profile Picture - TO CHANGE: Replace the src with actual profile image path */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      {/* Replace this img src with actual profile picture */}
                      <img 
                        src={review.profileImage} 
                        alt={review.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.className = 'w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center';
                          e.currentTarget.parentElement!.textContent = review.name.charAt(0);
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-lg text-white">{review.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 text-center">
            <p className="text-2xl text-white/60">
              <span className="font-bold text-white text-3xl">4.9/5</span> from{' '}
              <span className="font-bold text-white">2M+</span> reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
