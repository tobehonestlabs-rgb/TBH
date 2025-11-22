'use client'

export default function HowItWorks() {
  const steps = [
    {
      title: 'Share Profile',
      description: 'Create and share your link',
      color: 'text-blue-400',
      emoji: '👤',
    },
    {
      title: 'Receive Messages',
      description: 'Get anonymous messages',
      color: 'text-purple-400',
      emoji: '📨',
    },
    {
      title: 'Discover Hints',
      description: 'Guess who sent what',
      color: 'text-pink-400',
      emoji: '💡',
    },
    {
      title: 'Connect',
      description: 'Build deeper connections',
      color: 'text-red-400',
      emoji: '🤝',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 text-white">
              How It Works 🚀
            </h2>
            <p className="text-xl text-white/60">
              Simple and fun
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center"
              >
                <div className="text-4xl mb-3">{step.emoji}</div>
                <div className={`text-4xl font-bold mb-4 ${step.color}`}>
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-lg text-white/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
