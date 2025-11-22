'use client'

/**
 * Features Section Component
 * Describes the main app features with glassmorphism cards
 */
export default function Features() {
  const features = [
    {
      title: 'Anonymous Messages',
      description: 'Receive honest, anonymous messages from your peers. No names, just genuine thoughts.',
      icon: '💬',
      color: 'from-rainbow-blue to-rainbow-purple',
    },
    {
      title: 'Voice Messages',
      description: 'Hear what others really think with anonymous voice messages. Sometimes tone says it all.',
      icon: '🎤',
      color: 'from-rainbow-purple to-rainbow-red',
    },
    {
      title: 'Photo Sharing',
      description: 'Share and receive photos anonymously. Visual expressions speak louder than words.',
      icon: '📸',
      color: 'from-rainbow-red to-rainbow-orange',
    },
    {
      title: 'Smart Hints',
      description: 'Get intuitive hints about who sent what. The mystery makes it fun, hints make it engaging.',
      icon: '🔍',
      color: 'from-rainbow-orange to-rainbow-yellow',
    },
  ]

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-black/5 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 glass rounded-full blur-3xl opacity-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-on-scroll">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="rainbow-text">Features</span>
          </h2>
          <p className="text-lg sm:text-xl text-black/60 max-w-2xl mx-auto">
            Everything you need to connect authentically with your peers
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card fade-in-on-scroll group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon with gradient background */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Feature Title */}
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-black/90 transition-colors">
                {feature.title}
              </h3>

              {/* Feature Description */}
              <p className="text-black/70 text-base sm:text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

