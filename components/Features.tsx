'use client'

export default function Features() {
  const features = [
    {
      title: 'Anonymous Messages',
      description: 'Get honest feedback from friends',
      color: 'text-blue-400',
      emoji: '💬',
    },
    {
      title: 'Voice Messages',
      description: 'Hear what they really think',
      color: 'text-purple-400',
      emoji: '🎤',
    },
    {
      title: 'Photo Sharing',
      description: 'Share moments anonymously',
      color: 'text-pink-400',
      emoji: '📸',
    },
    {
      title: 'Smart Hints',
      description: 'Guess who sent what',
      color: 'text-red-400',
      emoji: '🔍',
    },
  ]

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 text-black">
              Features ✨
            </h2>
            <p className="text-xl text-black/60">
              Everything you need
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-black p-10 rounded-2xl border border-white/10"
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className={`text-3xl font-bold mb-4 ${feature.color}`}>
                  {feature.title}
                </h3>
                <p className="text-xl text-white/70">
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
