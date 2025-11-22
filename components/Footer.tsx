'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Jobs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Connect</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TikTok</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-sm">
                © {currentYear} TBH. All rights reserved.
              </p>
              <div className="flex gap-6 text-white/60 text-sm">
                <a href="#" className="hover:text-white transition-colors">App Store</a>
                <a href="#" className="hover:text-white transition-colors">Google Play</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
