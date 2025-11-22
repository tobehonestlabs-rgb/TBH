'use client'

export default function AppScreenshots() {
  // TO CHANGE APP SCREENSHOTS: Replace these image paths with your actual app screenshot paths
  // Place your screenshots in the public/images/screenshots/ folder
  const screenshots = [
    {
      image: '/images/screenshots/screenshot1.jpg', // PLACEHOLDER - Replace with actual screenshot
      title: 'Home Screen',
    },
    {
      image: '/images/screenshots/screenshot2.jpg', // PLACEHOLDER - Replace with actual screenshot
      title: 'Messages',
    },
    {
      image: '/images/screenshots/screenshot3.jpg', // PLACEHOLDER - Replace with actual screenshot
      title: 'Profile',
    },
  ]

  return (
    <section className="py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-2xl text-white/60">
              Experience the app
            </p>
          </div>

          {/* Screenshots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {screenshots.map((screenshot, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Phone Frame */}
                <div className="relative">
                  <div className="w-64 h-[550px] bg-gray-800 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-700">
                    <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden">
                      {/* TO CHANGE: Replace this img src with your actual app screenshot */}
                      <img 
                        src={screenshot.image} 
                        alt={screenshot.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback placeholder if image fails to load
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement!;
                          parent.className = 'w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center';
                          parent.innerHTML = `<span class="text-white/30 text-sm">${screenshot.title}<br/>Screenshot Placeholder</span>`;
                        }}
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-xl text-white/70 font-medium">{screenshot.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

