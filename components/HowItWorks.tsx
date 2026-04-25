'use client'

export default function HowItWorks() {
  const steps = [
    {
      title: 'Share your link',
      description: 'Create a custom TBH profile and send it to friends.',
      color: 'text-cyan-400',
      emoji: '👤',
    },
    {
      title: 'Receive anonymous notes',
      description: 'Get messages, voice clips, and photos without names.',
      color: 'text-purple-400',
      emoji: '📨',
    },
    {
      title: 'Discover playful hints',
      description: 'Use clues to guess who is messaging you.',
      color: 'text-pink-400',
      emoji: '💡',
    },
    {
      title: 'Enjoy real reactions',
      description: 'Respond privately and keep the conversation alive.',
      color: 'text-orange-400',
      emoji: '🤝',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-4">How it works</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Simple in four quick steps.</h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            Everything is built to keep the experience fast, private, and fun on a polished dark background.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="glass-card p-8 text-left">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl">{step.emoji}</span>
                <span className={`rounded-full border border-white/15 px-4 py-2 text-sm font-semibold ${step.color}`}>
                  Step {index + 1}
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">{step.title}</h3>
              <p className="text-base text-white/70 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
