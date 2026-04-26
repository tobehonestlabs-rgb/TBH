'use client'

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Reviews from '@/components/Reviews'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function About() {
  return (
    <main className="min-h-screen bg-black text-white">
     
      
  
      <HowItWorks />
      <Reviews />
    
      <Footer />
    </main>
  )
}