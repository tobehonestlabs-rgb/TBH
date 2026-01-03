'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DownloadPage() {
  // GitLab raw APK URL - converts blob URL to raw URL for direct download
  const APK_URL = "https://gitlab.com/tbh-labs/tbh-android/-/raw/61b29183b0669b5ce4840f05486d707657766909/app/release/app-release.apk"

  const handleDownload = () => {
    // Open the download link
    window.open(APK_URL, '_blank')
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      <section className="relative min-h-screen flex items-center justify-center pt-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight text-white">
              Download TBH
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
              Get the latest version of TBH for Android
            </p>
            <p className="text-lg text-white/60 mb-12">
              Tap the button below to download and install the APK file
            </p>

            {/* Download Button */}
            <div className="flex justify-center mb-8">
              <a
                href={APK_URL}
                download
                onClick={handleDownload}
                className="px-12 py-5 bg-white text-black rounded-full text-xl font-semibold hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3"
              >
                <span>📱</span>
                <span>Download TBH (.apk)</span>
              </a>
            </div>

            {/* Instructions */}
            <div className="mt-16 glass-card p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Installation Instructions</h2>
              <div className="text-left space-y-4 text-white/80">
                <div className="flex gap-4">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <p className="font-semibold mb-1">Download the APK</p>
                    <p className="text-white/60">Tap the download button above to get the APK file</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <p className="font-semibold mb-1">Allow Unknown Sources</p>
                    <p className="text-white/60">Go to Settings → Security → Enable "Install from Unknown Sources" (if prompted)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <p className="font-semibold mb-1">Install the App</p>
                    <p className="text-white/60">Open the downloaded APK file and follow the installation prompts</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">4️⃣</span>
                  <div>
                    <p className="font-semibold mb-1">Launch TBH</p>
                    <p className="text-white/60">Once installed, open TBH from your app drawer and start using it!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mt-8 text-white/50 text-sm">
              <p>⚠️ This is a test build. For production releases, download from the official app stores.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

