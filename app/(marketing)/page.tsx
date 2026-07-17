'use client';

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

// ────────────────────────────────────────────────────────────
// data
// ────────────────────────────────────────────────────────────

const notes = [
  { text: "ok but why are you always this funny 😭" },
  { text: "who ru texting rn... spill" },
  { text: "not me thinking about what you said all week" },
  { text: "rate my fit check, be honest" },
  { text: "you're giving main character energy fr" },
  { text: "had a crush on you since forever, ngl 👀" },
  { text: "send help i can't stop laughing at your story" },
  { text: "be honest, do you even remember me 💀" },
];

const steps = [
  { n: "01", title: "make your link", body: "takes like 10 secs. no cap." },
  { n: "02", title: "drop it everywhere", body: "story, bio, group chat — wherever your people already hang." },
  { n: "03", title: "watch the notes roll in", body: "anonymous messages from your actual circle. read, reply, vibe." },
];

const reasons = [
  { n: "01", title: "fully anonymous, fr", body: "no usernames, no receipts. just the message." },
  { n: "02", title: "it's your people", body: "notes come from your circle — not randoms on the internet." },
  { n: "03", title: "say something back", body: "reply, react, keep the convo going. it's social, not a drop box." },
  { n: "04", title: "make it yours", body: "customize your page so it actually feels like you." },
  { n: "05", title: "pics & voice notes", body: "send photos, memes, and voice messages — pitch-shifted for extra mystery." },
  { n: "06", title: "keep the thread alive", body: "one note can turn into a whole convo. lowkey addictive." },
];

const feed = [
  "ok your playlist is unreal, send the link",
  "not gonna lie you've been on my mind all day",
  "who taught you to dress like that 😭 (compliment)",
  "you always know what to say, how",
];

const navLinks = [
  { href: "#how", label: "how it works" },
  { href: "#features", label: "features" },
  { href: "#live", label: "see it live" },
];

// ────────────────────────────────────────────────────────────
// nav
// ────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-[#0B0B10]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-[#F5F4F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF4FA0] rounded-sm"
            onClick={closeMenu}
          >
            tbh
          </Link>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[#8B8894] hover:text-[#F5F4F2] rounded-full hover:bg-white/[0.05] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/about"
              className="px-4 py-2 text-sm font-medium text-[#8B8894] hover:text-[#F5F4F2] rounded-full hover:bg-white/[0.05] transition-all"
            >
              about
            </Link>
            <Link
              href="/sign-up"
              className="ml-2 px-4 py-2 text-sm font-medium text-[#8B8894] hover:text-[#F5F4F2] transition-colors"
            >
              log in
            </Link>
            <Link
              href="/sign-up"
              className="ml-1 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#F5F4F2] text-[#0B0B10] hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
            >
              get my link
            </Link>
          </nav>

          {/* mobile menu button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 active:scale-95 transition-transform"
          >
            <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
            <div className="w-5 h-3.5 relative flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-[#F5F4F2] rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block h-0.5 w-full bg-[#F5F4F2] rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 w-full bg-[#F5F4F2] rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
            </div>
          </button>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMenu}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[min(320px,85vw)] md:hidden bg-[#111017] border-l border-white/10 flex flex-col pt-24 px-6 pb-8"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-4 py-3.5 text-lg font-semibold text-[#F5F4F2] rounded-2xl hover:bg-white/[0.06] transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <Link href="/about" onClick={closeMenu} className="block px-4 py-3.5 text-lg font-semibold text-[#8B8894] rounded-2xl hover:bg-white/[0.06] transition-colors">
                    about
                  </Link>
                </motion.div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="w-full py-4 rounded-full text-center text-sm font-semibold border border-white/15 text-[#F5F4F2] hover:bg-white/[0.05] transition-colors"
                >
                  log in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="w-full py-4 rounded-full text-center text-sm font-bold bg-gradient-to-r from-[#FF6B4D] via-[#FF4FA0] to-[#8B5CF6] text-white hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  get my link →
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// sections
// ────────────────────────────────────────────────────────────

function Hero() {
  const marqueeNotes = [...notes, ...notes];

  return (
    <section className="relative overflow-hidden bg-[#0B0B10] pt-36 sm:pt-40 pb-8 px-6">
      <div className="grid-bg absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(255,79,160,0.16),transparent_70%)] blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-2xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-[#8B8894] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
          real friends. real fun. real you.
        </div>

        <div className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B4D] via-[#FF4FA0] to-[#8B5CF6] flex items-center justify-center shadow-[0_10px_30px_rgba(255,79,160,0.35)]">
          <span className="font-display text-xl font-bold text-[#0B0B10]">tbh</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-[#F5F4F2]">
          have real fun with
          <br />
          your <span className="gradient-text">real friends.</span>
        </h1>
        <p className="mt-6 text-lg text-[#8B8894] max-w-md mx-auto leading-relaxed">
          Drop your link. Get anonymous notes from people who already care about you.
          Spoiler: you&apos;re probably more popular than you think.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-up"
            className="px-8 py-4 rounded-full bg-[#F5F4F2] text-[#0B0B10] font-semibold hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
          >
            get my link →
          </Link>
          <a
            href="#live"
            className="px-8 py-4 rounded-full border border-white/15 text-[#F5F4F2] font-semibold hover:bg-white/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
          >
            see it live
          </a>
        </div>
      </motion.div>

      <div className="relative mt-20 -mx-6 overflow-hidden">
        <div className="marquee-track flex w-max gap-4">
          {marqueeNotes.map((note, i) => (
            <div
              key={`${note.text}-${i}`}
              className="relative shrink-0 w-64 rounded-xl bg-[#F5EFE3] text-[#1B1810] p-4 text-sm font-medium leading-snug shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              style={{ transform: `rotate(${i % 2 === 0 ? "-1.5deg" : "1.5deg"})` }}
            >
              <span
                aria-hidden
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-9 h-3.5 rotate-[-3deg]"
                style={{ background: "rgba(255,79,160,0.65)" }}
              />
              {note.text}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0B0B10] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0B0B10] to-transparent" />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="relative bg-[#0B0B10] px-6 py-24 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#FF4FA0] mb-3">low effort, high reward</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2]">
          how it actually works
        </h2>
        <div className="grid sm:grid-cols-3 gap-10 relative mt-16">
          <div className="hidden sm:block absolute top-6 left-0 right-0 h-px bg-white/10" />
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative text-center"
            >
              <span className="font-display text-sm text-[#8B8894] block mb-4 bg-[#0B0B10] w-fit mx-auto px-3">
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
    <section id="features" className="bg-[#0B0B10] px-6 py-24 border-t border-white/5 scroll-mt-24">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#8B5CF6] mb-3">why tbh hits different</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2]">
          your social life, but louder
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
          {reasons.map((r, i) => (
            <motion.div
              key={r.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-left hover:border-white/20 hover:bg-white/[0.05] transition-all"
            >
              <span className="gradient-text font-display text-2xl font-bold block mb-3">
                {r.n}
              </span>
              <h3 className="text-lg font-semibold text-[#F5F4F2] mb-2">{r.title}</h3>
              <p className="text-[#8B8894] leading-relaxed text-sm">{r.body}</p>
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.14),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto text-center"
      >
        <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#F5F4F2]">
          you&apos;re more loved
          <br />
          than you think.
        </p>
        <p className="mt-6 text-lg text-[#8B8894] max-w-xl mx-auto leading-relaxed">
          Every note in your inbox is proof someone was thinking about you today.
          That&apos;s literally the whole point — we&apos;re here to show you how loved you actually are.
        </p>
      </motion.div>
    </section>
  );
}

function LiveDemo() {
  return (
    <section id="live" className="bg-[#0B0B10] px-6 py-24 border-t border-white/5 scroll-mt-24">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2] mb-4">
          here&apos;s what it looks like
        </h2>
        <p className="text-[#8B8894] leading-relaxed">
          No names attached. Just the message. Reply, screenshot it, or let it sit
          in your inbox as proof someone cares.
        </p>
      </div>

      <div className="relative mx-auto mt-14 w-[280px] h-[560px] rounded-[2.5rem] border border-white/10 bg-[#111017] shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden">
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
              className="bg-[#1D1B24] text-[#F5F4F2] text-sm rounded-2xl rounded-tl-sm px-4 py-3 leading-snug max-w-[85%] mx-auto"
            >
              {msg}
            </motion.div>
          ))}
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
        <p className="text-[#8B8894] mb-8">it&apos;s free. your friends are already waiting.</p>
        <Link
          href="/sign-up"
          className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-[#FF6B4D] via-[#FF4FA0] to-[#8B5CF6] text-white font-semibold hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          create my tbh →
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0B0B10] border-t border-white/5 px-6 py-14">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-3">
        <span className="font-display text-xl font-bold text-[#F5F4F2]">tbh</span>
        <p className="text-sm text-[#8B8894]">real notes. real people. real excitement.</p>
        <div className="flex gap-6 text-sm text-[#8B8894] mt-3">
          <Link href="/about" className="hover:text-[#F5F4F2] transition-colors">about</Link>
          <Link href="/legal" className="hover:text-[#F5F4F2] transition-colors">legal</Link>
        </div>
      </div>
    </footer>
  );
}

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
