'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const sampleQuestions = [
  "wyd rn? 👀",
  "if u could ghost anyone, who & why? 💀",
  "spill: last time u simped hard? 😳",
  "what's ur most used emoji? drop it! 🫣",
]

export default function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center px-6 pt-16 bg-[#0D0D0D] text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,rgba(249,115,22,0.08) 0%,transparent_50%)]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none mb-8">
            pose la question.<br />
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              reçois la vérité.
            </span>
          </h1>

          <p className="max-w-lg mx-auto text-xl text-neutral-400 mb-10">
            Partage ton lien. Reçois des questions honnêtes, en toute anonymité.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/sign-up"
            className="group relative px-10 py-4 text-lg font-medium rounded-2xl overflow-hidden bg-white text-black hover:scale-105 transition-all active:scale-95"
          >
            Join the fun
            <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-10 transition" />
          </Link>

          <Link
            href="https://tbhonest.net/home"
            className="px-10 py-4 text-lg font-medium rounded-2xl border border-white/20 hover:bg-white/5 transition-all"
          >
            Voir un exemple
          </Link>
        </div>

        {/* Sample Questions */}
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
          {sampleQuestions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass px-6 py-4 rounded-3xl text-left max-w-[280px] hover:-rotate-2 transition-transform cursor-pointer border border-white/10"
            >
              {question}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-neutral-500 text-sm flex flex-col items-center gap-1 animate-bounce">
        scroll to explore
        <span>↓</span>
      </div>
    </section>
  )
}
