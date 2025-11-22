'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-xl mb-4">Product 📱</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Download</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Company 🏢</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Legal ⚖️</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Connect 🌐</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">TikTok</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/60">
              © {currentYear} TBH. All rights reserved. 💬
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
