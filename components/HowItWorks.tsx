'use client'

/**
 * How It Works Section Component
 * Simple visual explanation of the app flow
 */
export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Share Your Profile',
      description: 'Create your profile and share it with friends. They can send you anonymous messages.',
      icon: '👤',
    },
    {
      number: '2',
      title: 'Receive Messages',
      description: 'Get anonymous messages, voice notes, and photos from people who know you.',
      icon: '📨',
    },
    {
      number: '3',
      title: 'Discover Hints',
      description: 'Use smart hints to guess who sent what. The mystery makes every message exciting.',
      icon: '💡',
    },
    {
      number: '4',
      title: 'Connect Authentically',
      description: 'Build deeper connections through honest, anonymous feedback from your peers.',
      icon: '🤝',
    },
  ]

  return (
    <section className="py-20 sm:py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 glass rounded-full blur-3xl opacity-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-on-scroll">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            How It <span className="rainbow-text">Works</span>
          </h2>
          <p className="text-lg sm:text-xl text-black/60 max-w-2xl mx-auto">
            Simple, fun, and engaging. Here's how TBH brings people together.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="glass-card fade-in-on-scroll text-center group relative"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Step Number with Rainbow Accent */}
                <div className="relative mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center text-3xl font-bold rainbow-border group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-white">
                      {step.number}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 text-4xl opacity-60">
                    {step.icon}
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-black/90 transition-colors">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-black/70 text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Arrow (hidden on mobile, shown on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-rainbow-blue to-rainbow-purple opacity-30" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visual Flow Indicator */}
        <div className="mt-16 flex justify-center fade-in-on-scroll">
          <div className="glass-card px-8 py-4 inline-block">
            <p className="text-sm sm:text-base text-black/60">
              <span className="font-semibold text-black">100M+</span> messages sent and counting
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

