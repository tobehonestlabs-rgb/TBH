'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function AccountDeletionPage() {
  return (
    <main className="legal-scroll h-full overflow-y-auto bg-white text-gray-900 px-6 py-12 flex flex-col items-center">
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
        
        {/* --- ACCOUNT DELETION --- */}
        <section>
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic">TBH Account Deletion</h1>
          <p className="text-xs text-gray-400 mb-8 font-semibold uppercase tracking-widest">Data Privacy & Account Removal</p>
          
          <div className="space-y-8 text-[15px] leading-relaxed text-gray-600">
            <p>
              At <span className="font-bold text-black">TBH</span>, we respect your privacy and give you full control over your personal data. If you wish to delete your account and all associated data, we are committed to processing your request quickly and thoroughly.
            </p>

            {/* What is deleted */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-3">
              <h2 className="font-bold text-black text-sm uppercase tracking-wide">Data Deleted Upon Request</h2>
              <p className="text-[14px] text-gray-600">
                When your account deletion is processed, the following data is permanently purged from our servers:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[14px] text-gray-700 font-medium">
                <li>Your profile credentials (username, public slug link, email, birthdate, and avatar)</li>
                <li>All received anonymous messages and uploaded photos</li>
                <li>All direct chat conversation history and messages</li>
                <li>Push notification registration tokens (FCM) and device associations</li>
              </ul>
            </div>

            {/* How to request */}
            <div>
              <h2 className="font-bold text-black mb-4 text-sm uppercase tracking-wide">How to Request Account Deletion</h2>
              <p className="mb-4">
                To request the permanent deletion of your account and all associated data, please follow these steps:
              </p>
              
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                  <span>
                    Send an email to <a href="mailto:tobehonestlabs@gmail.com" className="font-bold text-black underline hover:text-gray-700">tobehonestlabs@gmail.com</a> from the email address linked to your TBH account.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                  <span>
                    Set the email subject to: <span className="font-bold text-black">"Account Deletion Request"</span>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                  <span>
                    State your TBH username or link (<span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">tbhonest.net/send/yourname</span>) and specify the reason for your departure (this helps us improve TBH).
                  </span>
                </li>
              </ol>
            </div>

            {/* Processing timeframe */}
            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">Processing Timeframe</h2>
              <p>
                Our privacy team will verify ownership and complete the permanent deletion of your account within <span className="font-bold text-black">48 to 72 hours</span>. Once completed, all your messages, chat history, and profile data will be permanently removed and cannot be recovered.
              </p>
            </div>

            {/* Legal & Billing retention notice */}
            <div className="border-l-2 border-black pl-4 py-1 space-y-2">
              <h2 className="font-bold text-black text-xs uppercase tracking-widest">Notice regarding billing & legal retention</h2>
              <p className="text-[13px] text-gray-500 leading-normal">
                Financial transaction records (such as Google Play subscription payment receipts) will be retained for the minimum statutory period required by applicable accounting and tax laws. If you have an active TBH Pro subscription, please cancel it directly in Google Play Subscriptions to prevent recurring charges.
              </p>
            </div>

            <p className="text-xs text-gray-400 font-medium pt-2">
              Questions regarding your data? Reach out directly to <a href="mailto:tobehonestlabs@gmail.com" className="text-black font-semibold underline">tobehonestlabs@gmail.com</a>
            </p>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-6 pb-24">
          <Link href="/" className="inline-block text-sm font-black text-white bg-black px-10 py-4 rounded-2xl active:scale-95 transition-transform shadow-lg">
            BACK TO TBH
          </Link>
        </div>
      </div>
    </main>
  )
}
