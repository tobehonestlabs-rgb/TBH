'use client'

export default function HowItWorks() {
  const steps = [
    {
      emoji: '👤',
      title: 'Share Profile',
      description: 'Create and share your link',
    },
    {
      emoji: '📨',
      title: 'Receive Messages',
      description: 'Get anonymous messages',
    },
    {
      emoji: '💡',
      title: 'Discover Hints',
      description: 'Guess who sent what',
    },
    {
      emoji: '🤝',
      title: 'Connect',
      description: 'Build deeper connections',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6">
              How It Works 🚀
            </h2>
            <p className="text-2xl text-black/50">
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
                <div className="text-6xl mb-6">{step.emoji}</div>
                <div className="text-4xl font-bold mb-2 text-black/20">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {step.title}
                </h3>
                <p className="text-lg text-black/60">
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
