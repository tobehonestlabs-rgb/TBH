'use client';

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

// ────────────────────────────────────────────────────────────
// data
// ────────────────────────────────────────────────────────────

// The "note wall": real anonymous-message examples, pinned at hand-set
// angles. This is the page's signature element — it visualizes the actual
// product (anonymous notes from people you know) instead of a generic
// badge/pill list.
const notes = [
  { text: "ok but why are you always this funny 😭", rotate: -6, top: "4%", left: "56%" },
  { text: "who ru texting rn... spill", rotate: 5, top: "0%", left: "80%" },
  { text: "not me thinking about what you said all week", rotate: -3, top: "32%", left: "66%" },
  { text: "rate my fit check, be honest", rotate: 7, top: "28%", left: "88%" },
  { text: "you're giving main character energy fr", rotate: -8, top: "60%", left: "58%" },
  { text: "had a crush on you since forever, ngl 👀", rotate: 4, top: "64%", left: "82%" },
];

const steps = [
  { n: "01", title: "make your link", body: "sign up and get your own tbh link in about 10 seconds." },
  { n: "02", title: "post it everywhere", body: "story, bio, group chat — wherever your people already are." },
  { n: "03", title: "catch what comes back", body: "anonymous notes roll in. read them, reply, or just vibe." },
];

const reasons = [
  { n: "01", title: "fully anonymous, actually", body: "no usernames, no receipts, no \"who sent this\" energy. ever." },
  { n: "02", title: "it's still your people", body: "notes come from your circle, not randoms across the internet." },
  { n: "03", title: "say something back", body: "reply, react, keep it going — it's a conversation, not a drop box." },
  { n: "04", title: "make it yours", body: "customize your page so it actually feels like you." },
];

const feed = [
  "ok your playlist is unreal, send the link",
  "not gonna lie you've been on my mind all day",
  "who taught you to dress like that 😭 (compliment)",
  "you always know what to say, how",
];

// ────────────────────────────────────────────────────────────
// sections
// ────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-[#F5F4F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF4FA0] rounded-sm"
        >
          tbh
        </Link>
        <Link
          href="/sign-up"
          className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#F5F4F2] text-[#0B0B10] hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
        >
          get my link
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen pt-32 pb-20 px-6 overflow-hidden bg-[#0B0B10]">
      <div className="pointer-events-none absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,79,160,0.16),transparent_70%)] blur-2xl" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-[#F5F4F2]">
            turns out,<br />
            you're kind of a{" "}
            <span className="bg-gradient-to-r from-[#FF6B4D] via-[#FF4FA0] to-[#8B5CF6] bg-clip-text text-transparent">
              big deal.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-[#8B8894]">
            Drop your link. Get anonymous notes, questions, and hype from people
            who already can't stop thinking about you.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-4 rounded-full bg-[#F5F4F2] text-[#0B0B10] font-semibold hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
            >
              get my link
            </Link>
            <a
              href="#live"
              className="px-8 py-4 rounded-full border border-white/15 text-[#F5F4F2] font-semibold hover:bg-white/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
            >
              see it live
            </a>
          </div>
        </motion.div>

        {/* note wall — desktop: scattered, hand-tilted, "picks up" flat on hover */}
        <div className="relative hidden md:block h-[480px]">
          {notes.map((note, i) => (
            <motion.div
              key={note.text}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, rotate: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate: note.rotate }}
              whileHover={reduceMotion ? {} : { scale: 1.06, rotate: 0, zIndex: 20 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              style={{ top: note.top, left: note.left }}
              className="absolute w-56 rounded-sm bg-[#F5EFE3] text-[#1B1810] p-4 text-sm font-medium leading-snug shadow-[0_10px_30px_rgba(0,0,0,0.4)] cursor-default"
            >
              <span
                aria-hidden
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 rotate-[-3deg]"
                style={{ background: "rgba(255,79,160,0.65)" }}
              />
              {note.text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* note wall — mobile: horizontal scroll strip */}
      <div className="md:hidden mt-12 flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1 snap-x snap-mandatory">
        {notes.map((note) => (
          <div
            key={note.text}
            className="snap-start shrink-0 w-64 rounded-sm bg-[#F5EFE3] text-[#1B1810] p-4 text-sm font-medium leading-snug"
          >
            {note.text}
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative bg-[#0B0B10] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2] mb-16">
          how it actually works
        </h2>
        <div className="grid sm:grid-cols-3 gap-10 relative">
          <div className="hidden sm:block absolute top-6 left-0 right-0 h-px bg-white/10" />
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative"
            >
              <span className="font-display text-sm text-[#8B8894] block mb-4 bg-[#0B0B10] w-fit pr-3">
                {step.n}
              </span>
              <h3 className="text-xl font-semibold text-[#F5F4F2] mb-2">{step.title}</h3>
              <p className="text-[#8B8894] leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="bg-[#0B0B10] px-6 py-24 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2] mb-16">
          why it hits different
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-12">
          {reasons.map((r, i) => (
            <motion.div
              key={r.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-5"
            >
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-[#FF6B4D] to-[#8B5CF6] bg-clip-text text-transparent">
                {r.n}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-[#F5F4F2] mb-1">{r.title}</h3>
                <p className="text-[#8B8894] leading-relaxed">{r.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LovedSection() {
  return (
    <section className="relative bg-[#0B0B10] px-6 py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.14),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto text-center"
      >
        <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#F5F4F2]">
          you're more loved
          <br />
          than you think.
        </p>
        <p className="mt-6 text-lg text-[#8B8894] max-w-xl mx-auto">
          Every note in your inbox is proof someone was thinking about you today.
          That's kind of the whole point.
        </p>
      </motion.div>
    </section>
  );
}

function LiveDemo() {
  return (
    <section id="live" className="bg-[#0B0B10] px-6 py-24 border-t border-white/5">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2] mb-4">
            here's what it looks like
          </h2>
          <p className="text-[#8B8894] max-w-md leading-relaxed">
            No names attached. Just the message. You decide what to do with it —
            reply, screenshot it, or let it sit in your inbox as proof.
          </p>
        </div>

        <div className="relative mx-auto w-[280px] h-[560px] rounded-[2.5rem] border border-white/10 bg-[#111017] shadow-2xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
            <div className="w-24 h-5 bg-[#0B0B10] rounded-b-2xl" />
          </div>
          <div className="pt-12 px-4 space-y-3 h-full overflow-hidden">
            {feed.map((msg, i) => (
              <motion.div
                key={msg}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.25, duration: 0.4 }}
                className="bg-[#1D1B24] text-[#F5F4F2] text-sm rounded-2xl rounded-tl-sm px-4 py-3 leading-snug max-w-[85%]"
              >
                {msg}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="relative bg-[#0B0B10] px-6 py-28 text-center overflow-hidden border-t border-white/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,79,160,0.15),transparent_60%)]" />
      <div className="relative max-w-2xl mx-auto">
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#F5F4F2] mb-6 leading-tight">
          ready to find out
          <br />
          how loved you actually are?
        </h2>
        <Link
          href="/sign-up"
          className="inline-block mt-4 px-10 py-4 rounded-full bg-gradient-to-r from-[#FF6B4D] via-[#FF4FA0] to-[#8B5CF6] text-white font-semibold hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          create my tbh
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0B0B10] border-t border-white/5 px-6 py-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-center sm:text-left">
          <span className="font-display text-xl font-bold text-[#F5F4F2]">tbh</span>
          <p className="text-sm text-[#8B8894] mt-1">real notes. real people. real you.</p>
        </div>
        <div className="flex gap-6 text-sm text-[#8B8894]">
          <Link href="/about" className="hover:text-[#F5F4F2] transition-colors">about</Link>
          <Link href="/legal" className="hover:text-[#F5F4F2] transition-colors">legal</Link>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────
// page
// ────────────────────────────────────────────────────────────
// Note: this file uses 'use client' (framer-motion needs it), so it can't
// also export `metadata` — Next.js only allows metadata exports from Server
// Components. Put your title/description in app/layout.tsx instead.

export default function Home() {
  return (
    <main className="bg-[#0B0B10]">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <LovedSection />
      <LiveDemo />
      <CallToAction />
      <Footer />
    </main>
  );
}
