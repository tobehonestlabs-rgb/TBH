'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function SafetyPage() {
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
        
        {/* Header */}
        <section>
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic">
            Child Safety & Protection Standards
          </h1>
          <p className="text-xs text-gray-400 mb-8 font-semibold uppercase tracking-widest">
            Policy Against Child Sexual Exploitation and Abuse (CSAE) and CSAM • Last Updated: October 25, 2026
          </p>
          
          <div className="space-y-8 text-[15px] leading-relaxed text-gray-600">
            <p>
              At <span className="font-bold text-black">TBH</span>, we are unequivocally dedicated to maintaining a safe, respectful, and secure environment for all our users. We maintain a <span className="font-bold text-black">strict Zero-Tolerance Policy</span> regarding Child Sexual Exploitation and Abuse (CSAE), Child Sexual Abuse Material (CSAM), and any form of predatory conduct involving minors.
            </p>

            {/* Zero Tolerance Notice */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-2 text-red-900">
              <h2 className="font-bold text-sm uppercase tracking-wide">
                Zero Tolerance Commitment
              </h2>
              <p className="text-[14px] leading-relaxed">
                TBH strictly prohibits the creation, transmission, solicitation, possession, or distribution of Child Sexual Abuse Material (CSAM) or any behavior that exploits, harms, or endangers minors. Any violation results in immediate account termination, device banning, and referral to law enforcement agencies and child protection authorities worldwide.
              </p>
            </div>

            {/* 1. Prohibited Actions */}
            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">
                1. Strictly Prohibited Conduct
              </h2>
              <p className="mb-3">
                Users are strictly prohibited from engaging in any of the following activities on TBH:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[14px] text-gray-700">
                <li>
                  <span className="font-bold text-black">Child Sexual Abuse Material (CSAM):</span> Uploading, sending, requesting, viewing, storing, or sharing any imagery, video, illustration, or representation of child sexual abuse or exploitation.
                </li>
                <li>
                  <span className="font-bold text-black">Child Grooming & Predation:</span> Initiating contact or manipulating a minor for the purpose of sexual exploitation, abuse, or solicitation of sexual material.
                </li>
                <li>
                  <span className="font-bold text-black">Sextortion & Coercion:</span> Threatening, coercing, or blackmailing minors with intimate images or personal data.
                </li>
                <li>
                  <span className="font-bold text-black">Sexual Solicitation:</span> Asking minors for sexually explicit messages, photos, videos, or real-world meetings.
                </li>
                <li>
                  <span className="font-bold text-black">Harmful Content:</span> Promoting, glorifying, or encouraging sexual violence, trafficking, or self-harm involving minors.
                </li>
              </ul>
            </div>

            {/* 2. Detection & Moderation */}
            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">
                2. Moderation and Detection
              </h2>
              <p>
                TBH combines automated protection filters, keyword screening, image inspection, and human review systems to detect and block abusive content. We actively monitor reporting queues with the highest priority assigned to child protection and safety concerns.
              </p>
            </div>

            {/* 3. Reporting Mechanisms */}
            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">
                3. How to Report Violations
              </h2>
              <p className="mb-4">
                If you encounter any content or behavior on TBH that violates our child safety standards, please report it immediately:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mt-0.5">A</span>
                  <div>
                    <span className="font-bold text-black text-[14px]">In-App Reporting:</span>
                    <p className="text-[13px] text-gray-600 mt-1">
                      Tap the report/flag icon directly on any message or conversation inside the TBH mobile application.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mt-0.5">B</span>
                  <div>
                    <span className="font-bold text-black text-[14px]">Priority Safety Email:</span>
                    <p className="text-[13px] text-gray-600 mt-1">
                      Send an urgent report to our dedicated moderation team at <a href="mailto:tobehonestlabs@gmail.com?subject=URGENT%20Child%20Safety%20Report" className="font-bold text-black underline">tobehonestlabs@gmail.com</a> with the subject line <em>"URGENT: Child Safety Report"</em>. Please provide relevant usernames, links, or screenshots.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Enforcement & Law Enforcement Referral */}
            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">
                4. Enforcement and Legal Cooperation
              </h2>
              <p className="mb-3">
                When a violation involving minor safety is identified:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[14px] text-gray-700">
                <li>The offending content is permanently destroyed from our platform.</li>
                <li>The perpetrator's account is immediately terminated and their IP/device banned.</li>
                <li>
                  <span className="font-bold text-black">Mandatory Reporting:</span> In accordance with federal and international regulations, we report all suspected CSAM/CSAE instances to the <span className="font-bold text-black">National Center for Missing & Exploited Children (NCMEC)</span> via the CyberTipline and cooperate fully with law enforcement authorities worldwide.
                </li>
              </ul>
            </div>

            {/* 5. External Safety Resources */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-3">
              <h2 className="font-bold text-black text-sm uppercase tracking-wide">
                5. External Child Protection Resources
              </h2>
              <p className="text-[13px] text-gray-600">
                You can also report child sexual abuse material or exploitation directly to global organizations:
              </p>
              <ul className="space-y-2 text-[13px] font-medium text-gray-800">
                <li>
                  • <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer" className="underline font-bold text-black hover:text-gray-600">NCMEC CyberTipline (US & International)</a> — 1-800-843-5678 / report.cybertip.org
                </li>
                <li>
                  • <a href="https://www.iwf.org.uk" target="_blank" rel="noopener noreferrer" className="underline font-bold text-black hover:text-gray-600">Internet Watch Foundation (IWF)</a> — report.iwf.org.uk
                </li>
                <li>
                  • <a href="https://www.inhope.org" target="_blank" rel="noopener noreferrer" className="underline font-bold text-black hover:text-gray-600">INHOPE Global Hotlines Network</a> — inhope.org
                </li>
              </ul>
            </div>

            <p className="text-xs text-gray-400 font-medium">
              Questions regarding these standards or safety inquiries: tobehonestlabs@gmail.com
            </p>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-8 pb-24">
          <Link href="/" className="inline-block text-sm font-black text-white bg-black px-10 py-4 rounded-2xl active:scale-95 transition-transform shadow-lg">
            BACK TO TBH
          </Link>
        </div>
      </div>
    </main>
  )
}