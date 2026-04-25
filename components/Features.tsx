'use client'

export default function Features() {
  const features = [
    {
      title: 'Anonymous messages',
      description: 'Collect honest feedback without revealing identities.',
      color: 'text-cyan-400',
      emoji: '💬',
    },
    {
      title: 'Voice reactions',
      description: 'Send and receive private voice messages instantly.',
      color: 'text-purple-400',
      emoji: '🎤',
    },
    {
      title: 'Photo drops',
      description: 'Share memorable moments without the pressure.',
      color: 'text-pink-400',
      emoji: '📸',
    },
    {
      title: 'Smart hints',
      description: 'Add playful clues and keep the experience engaging.',
      color: 'text-orange-400',
      emoji: '🔍',
    },
  ]

  return (
    <section id="features" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-4">Core benefits</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Designed for anonymous connection.</h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            A modern social experience that feels premium, private, and effortless in black mode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-8 xl:p-10"
            >
              <div className="text-5xl mb-5">{feature.emoji}</div>
              <h3 className={`text-3xl font-semibold mb-3 ${feature.color}`}>
                {feature.title}
              </h3>
              <p className="text-lg text-white/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
