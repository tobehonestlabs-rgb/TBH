'use client'

export default function Features() {
  const features = [
    {
      emoji: '💬',
      title: 'Anonymous Messages',
      description: 'Get honest feedback from friends',
    },
    {
      emoji: '🎤',
      title: 'Voice Messages',
      description: 'Hear what they really think',
    },
    {
      emoji: '📸',
      title: 'Photo Sharing',
      description: 'Share moments anonymously',
    },
    {
      emoji: '🔍',
      title: 'Smart Hints',
      description: 'Guess who sent what',
    },
  ]

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6">
              Features ✨
            </h2>
            <p className="text-2xl text-black/50">
              Everything you need
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-10 text-center"
              >
                <div className="text-7xl mb-6">{feature.emoji}</div>
                <h3 className="text-3xl font-bold mb-4">
                  {feature.title}
                </h3>
                <p className="text-xl text-black/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
