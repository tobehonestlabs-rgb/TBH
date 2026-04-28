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

      <div className="w-full max-w-2xl space-y-10" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
        
        {/* --- TERMS OF SERVICE --- */}
        <section>
          <h1 className="text-4xl font-black tracking-tighter mb-8 italic">Terms of Service</h1>
          <p className="text-xs text-gray-400 mb-8 font-semibold uppercase tracking-widest">Last Updated: April 28, 2026</p>
          
          <div className="space-y-8 text-[15px] leading-relaxed text-gray-600">
            <p>
              Welcome to <span className="font-bold text-black">TBH</span>. By accessing our platform, you agree to the following terms. We’ve kept this short and clear because we know you have better things to do.
            </p>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">1. User Responsibility</h2>
              <p>
                TBH is a medium for receiving messages and other media from other anynonymous users. You acknowledge that <span className="font-bold text-black text-gray-800">you are solely responsible</span> for your interactions and any content sent to you by acquaintances or third parties. We provide the platform; you manage your link and your inbox.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">2. Prohibited Conduct</h2>
              <p>
                You are strictly <span className="font-bold text-black">prohibited from using TBH to harass, bully, or threaten</span> any other user. We maintain a zero-tolerance policy for targeted abuse. We reserve the right to terminate access for any account violating these community standards.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">3. Sensitive & Sexual Content</h2>
              <p>
                TBH is built for respectful connection. <span className="font-bold text-black">Users are completely responsible</span> if they receive or engage with sexual content. We do not proactively monitor private messages, but we will cooperate with legal requests regarding illegal activity.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">4. Account Control</h2>
              <p>
                You are <span className="font-bold text-black">free to log out</span> of your account at any time. While automated "Delete Account" functionality is currently in development, you may contact our support to request manual data removal.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* --- PRIVACY POLICY --- */}
        <section>
          <h1 className="text-4xl font-black tracking-tighter mb-8 italic">Privacy Policy</h1>
          
          <div className="space-y-8 text-[15px] leading-relaxed text-gray-600">
            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">Data We Collect</h2>
              <p>
                To create your account, we collect your <span className="font-bold text-black">Google profile information</span> (Email, Name, Profile Picture). Additionally, we automatically collect <span className="font-bold text-black">IP addresses and device information</span> (such as browser type and operating system) to ensure platform security, prevent abuse, and optimize performance.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">Our Data Promise</h2>
              <p>
                We <span className="font-bold text-black">do not sell your data</span>. Your information is used strictly to operate TBH, protect against fraudulent activity, and provide your unique sharing link.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">Cookies</h2>
              <p>
                We use secure cookies to keep you authenticated. These are mandatory for the application to function.
              </p>
            </div>

            <p className="text-xs text-gray-400 font-medium">
              Questions? Reach out: tobehonestlabs@gmail.com
            </p>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-12 pb-24">
          <Link href="/" className="inline-block text-sm font-black text-white bg-black px-10 py-4 rounded-2xl active:scale-95 transition-transform shadow-lg">
            BACK TO TBH
          </Link>
        </div>
      </div>
    </main>
  )
}
