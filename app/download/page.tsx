'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DownloadPage() {
  // GitLab raw APK URL - uses branch name instead of commit hash to always get the latest version
  // Change 'main' to your branch name if different (e.g., 'master', 'develop', etc.)
  const APK_URL = "https://gitlab.com/tbh-labs/tbh-android/-/raw/main/app/release/app-release.apk"

  const handleDownload = () => {
    // Open the download link
    window.open(APK_URL, '_blank')
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <section className="relative min-h-screen flex items-center justify-center pt-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight text-black">
              Download TBH
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-black/80 mb-4 font-light">
              Get the latest version of TBH for Android
            </p>
            <p className="text-lg text-black/60 mb-12">
              Tap the button below to download and install the APK file
            </p>

            {/* Download Button */}
            <div className="flex justify-center mb-8">
              <a
                href={APK_URL}
                download
                onClick={handleDownload}
                className="px-12 py-5 bg-black text-white rounded-full text-xl font-semibold hover:bg-black/90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3"
              >
                <span>📱</span>
                <span>Download TBH (.apk)</span>
              </a>
            </div>

            {/* Instructions */}
            <div className="mt-16 bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-6">Installation Instructions</h2>
              <div className="text-left space-y-4 text-black/80">
                <div className="flex gap-4">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <p className="font-semibold mb-1 text-black">Download the APK</p>
                    <p className="text-black/60">Tap the download button above to get the APK file</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <p className="font-semibold mb-1 text-black">Allow Unknown Sources</p>
                    <p className="text-black/60">Go to Settings → Security → Enable "Install from Unknown Sources" (if prompted)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <p className="font-semibold mb-1 text-black">Install the App</p>
                    <p className="text-black/60">Open the downloaded APK file and follow the installation prompts</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">4️⃣</span>
                  <div>
                    <p className="font-semibold mb-1 text-black">Launch TBH</p>
                    <p className="text-black/60">Once installed, open TBH from your app drawer and start using it!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mt-8 text-black/50 text-sm">
              <p>⚠️ This is a test build. For production releases, download from the official app stores.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

