'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-12 flex flex-col items-center">
      {/* Logo */}
      <div className="mb-12">
        <Link href="/">
          <Image
            src="/assets/TBH_Title_Logo.svg"
            alt="TBH Logo"
            width={100}
            height={40}
            className="cursor-pointer"
          />
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-10" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        
        {/* --- TERMS OF SERVICE --- */}
        <section>
          <h1 className="text-3xl font-black tracking-tight mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8 font-medium">Last Updated: April 28, 2026</p>
          
          <div className="space-y-6 text-sm leading-relaxed text-gray-700">
            <p>
              Welcome to **TBH**. By using our platform, you agree to these terms. If you do not agree, please do not use the service.
            </p>

            <div>
              <h2 className="font-bold text-black mb-2 uppercase text-xs tracking-widest">1. User Responsibility</h2>
              <p>
                TBH is a platform for receiving messages. You acknowledge and agree that **you are solely responsible** for the interactions you have and the content your acquaintances or third parties send to you. We provide the tools, but you manage the link.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-2 uppercase text-xs tracking-widest">2. Prohibited Conduct</h2>
              <p>
                You are strictly prohibited from using TBH to **harass, bully, or threaten** any other user. We have a zero-tolerance policy for hate speech or targeted abuse. We reserve the right to terminate access for any account violating this.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-2 uppercase text-xs tracking-widest">3. Sensitive & Sexual Content</h2>
              <p>
                TBH is intended for respectful communication. Users are **completely responsible** if they choose to receive or engage with sexual content. TBH does not actively monitor private messages but will act on reported violations of local laws.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-2 uppercase text-xs tracking-widest">4. Account Control</h2>
              <p>
                You are free to **log out** of your account at any time. While we currently do not have an automated "Delete Account" button in the UI, you can contact us to request data removal.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-2 uppercase text-xs tracking-widest">5. Disclaimer</h2>
              <p>
                The service is provided "As-Is." We are not liable for any emotional distress or damages resulting from anonymous messages sent via our platform. Stay respectful.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* --- PRIVACY POLICY --- */}
        <section>
          <h1 className="text-3xl font-black tracking-tight mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-sm leading-relaxed text-gray-700">
            <div>
              <h2 className="font-bold text-black mb-2 uppercase text-xs tracking-widest">Data Collection</h2>
              <p>
                We collect your **Google profile information** (Email, Name, Profile Picture) to create your account. We store the anonymous messages sent to you so you can read them in your inbox.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-2 uppercase text-xs tracking-widest">Data Usage</h2>
              <p>
                We do **not** sell your data. We use it strictly to operate the TBH service and provide you with your unique sharing link.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-2 uppercase text-xs tracking-widest">Cookies</h2>
              <p>
                We use cookies (via Supabase) to keep you logged in. These are necessary for the app to function.
              </p>
            </div>

            <p className="text-xs text-gray-400 italic">
              Questions? Contact us at: support@tbhonest.net
            </p>
          </div>
        </section>

        {/* Back to App */}
        <div className="pt-10 pb-20">
          <Link href="/" className="text-sm font-bold text-black bg-gray-100 px-6 py-3 rounded-full hover:bg-gray-200 transition-all">
            ← Back to App
          </Link>
        </div>
      </div>
    </main>
  )
}