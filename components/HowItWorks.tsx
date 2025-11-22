'use client'

export default function HowItWorks() {
  const steps = [
    {
      title: 'Share Profile',
      description: 'Create and share your link',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      title: 'Receive Messages',
      description: 'Get anonymous messages',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Discover Hints',
      description: 'Guess who sent what',
      gradient: 'from-pink-500 to-red-500',
    },
    {
      title: 'Connect',
      description: 'Build deeper connections',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-2xl text-white/60">
              Simple and fun
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center glass-card p-8"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-3xl font-bold text-white shadow-lg`}>
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
