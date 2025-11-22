'use client'

export default function Features() {
  const features = [
    {
      title: 'Anonymous Messages',
      description: 'Get honest feedback from friends',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Voice Messages',
      description: 'Hear what they really think',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Photo Sharing',
      description: 'Share moments anonymously',
      gradient: 'from-pink-500 to-red-500',
    },
    {
      title: 'Smart Hints',
      description: 'Guess who sent what',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ]

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Features
            </h2>
            <p className="text-2xl text-white/60">
              Everything you need
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-10 text-center group hover:scale-105 transition-transform"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">
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
