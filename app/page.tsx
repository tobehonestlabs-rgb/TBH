'use client'

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import AppScreenshots from '@/components/AppScreenshots'
import Reviews from '@/components/Reviews'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <AppScreenshots />
      <Reviews />
      <CTA />
      <Footer />
    </main>
  )
}

