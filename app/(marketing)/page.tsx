'use client';

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

// ────────────────────────────────────────────────────────────
// data
// ────────────────────────────────────────────────────────────

type Locale = 'en' | 'fr' | 'es'

type LandingCopy = {
  nav: { how: string; features: string; live: string; about: string; logIn: string; getMyLink: string }
  hero: {
    badge: string
    title: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
  }
  sections: {
    lowEffort: string
    howTitle: string
    steps: { n: string; title: string; body: string }[]
    featuresEyebrow: string
    featuresTitle: string
    reasons: { n: string; title: string; body: string }[]
    lovedTitle: string
    lovedBody: string
    liveTitle: string
    liveBody: string
    ctaTitle: string
    ctaBody: string
    ctaButton: string
    footerTagline: string
    legal: string
  }
  notes: string[]
}

const notesByLocale: Record<Locale, string[]> = {
  en: [
    "ok but why are you always this funny 😭",
    "who ru texting rn... spill",
    "not me thinking about what you said all week",
    "rate my fit check, be honest",
    "you're giving main character energy fr",
    "had a crush on you since forever, ngl 👀",
    "send help i can't stop laughing at your story",
    "be honest, do you even remember me 💀",
  ],
  fr: [
    "ok mais pourquoi tu es toujours aussi drôle 😭",
    "qui tu messages là... balance",
    "pas moi qui pense à ce que tu as dit toute la semaine",
    "note mon look, sois honnête",
    "tu as une énergie de personnage principal en vrai",
    "je te kiffais depuis toujours, sans mentir 👀",
    "aide-moi, je peux pas arrêter de rire à ton histoire",
    "sois honnête, tu te souviens encore de moi 💀",
  ],
  es: [
    "ok pero ¿por qué siempre eres tan gracioso 😭",
    "a quién le estás escribiendo ahora... cuéntalo",
    "yo no, pensando en lo que me dijiste toda la semana",
    "califica mi look, sé honesto",
    "estás dando energía de protagonista, de verdad",
    "he tenido crush por ti desde siempre, en serio 👀",
    "ayuda, no puedo parar de reír con tu historia",
    "sé honesto, ¿te acuerdas de mí? 💀",
  ],
}

const landingCopy: Record<Locale, LandingCopy> = {
  en: {
    nav: { how: 'how it works', features: 'features', live: 'see it live', about: 'about', logIn: 'log in', getMyLink: 'get my link' },
    hero: { badge: 'real friends. real fun. real you.', title: 'have real fun with\n your real friends.', subtitle: 'Drop your link. Get anonymous notes from people who already care about you. Spoiler: you\'re probably more popular than you think.', ctaPrimary: 'get my link →', ctaSecondary: 'see it live' },
    sections: {
      lowEffort: 'low effort, high reward',
      howTitle: 'how it actually works',
      steps: [
        { n: '01', title: 'make your link', body: 'takes like 10 secs. no cap.' },
        { n: '02', title: 'drop it everywhere', body: 'story, bio, group chat — wherever your people already hang.' },
        { n: '03', title: 'watch the notes roll in', body: 'anonymous messages from your actual circle. read, reply, vibe.' },
      ],
      featuresEyebrow: 'why tbh hits different',
      featuresTitle: 'your social life, but louder',
      reasons: [
        { n: '01', title: 'fully anonymous, fr', body: 'no usernames, no receipts. just the message.' },
        { n: '02', title: 'it\'s your people', body: 'notes come from your circle — not randoms on the internet.' },
        { n: '03', title: 'say something back', body: 'reply, react, keep the convo going. it\'s social, not a drop box.' },
        { n: '04', title: 'make it yours', body: 'customize your page so it actually feels like you.' },
        { n: '05', title: 'pics & voice notes', body: 'send photos, memes, and voice messages — pitch-shifted for extra mystery.' },
        { n: '06', title: 'keep the thread alive', body: 'one note can turn into a whole convo. lowkey addictive.' },
      ],
      lovedTitle: 'you\'re more loved\nthan you think.',
      lovedBody: 'Every note in your inbox is proof someone was thinking about you today. That\'s literally the whole point — we\'re here to show you how loved you actually are.',
      liveTitle: 'here\'s what it looks like',
      liveBody: 'No names attached. Just the message. Reply, screenshot it, or let it sit in your inbox as proof someone cares.',
      ctaTitle: 'ready to find out\n how loved you actually are?',
      ctaBody: 'it\'s free. your friends are already waiting.',
      ctaButton: 'create my tbh →',
      footerTagline: 'real notes. real people. real excitement.',
      legal: 'legal',
    },
    notes: [
      'ok your playlist is unreal, send the link',
      'not gonna lie you\'ve been on my mind all day',
      'who taught you to dress like that 😭 (compliment)',
      'you always know what to say, how',
    ],
  },
  fr: {
    nav: { how: 'comment ça marche', features: 'fonctionnalités', live: 'voir en direct', about: 'à propos', logIn: 'connexion', getMyLink: 'obtenir mon lien' },
    hero: { badge: 'de vrais amis. du vrai fun. toi, vraiment.', title: 'amuse-toi vraiment\n avec tes vrais amis.', subtitle: 'Partage ton lien. Reçois des messages anonymes de personnes qui se soucient déjà de toi. Spoiler : tu es probablement plus populaire que tu penses.', ctaPrimary: 'obtenir mon lien →', ctaSecondary: 'voir en direct' },
    sections: {
      lowEffort: 'peu d’effort, gros bénéfice',
      howTitle: 'comment ça marche vraiment',
      steps: [
        { n: '01', title: 'crée ton lien', body: 'ça prend 10 secondes. sans blague.' },
        { n: '02', title: 'partage-le partout', body: 'story, bio, groupe — là où tes gens se trouvent déjà.' },
        { n: '03', title: 'regarde les notes arriver', body: 'des messages anonymes de ton cercle. lis, réponds, profites.' },
      ],
      featuresEyebrow: 'pourquoi tbh ça déchire',
      featuresTitle: 'ta vie sociale, mais plus forte',
      reasons: [
        { n: '01', title: 'entièrement anonyme', body: 'pas de pseudos, pas de traces. juste le message.' },
        { n: '02', title: 'ce sont tes gens', body: 'les notes viennent de ton cercle — pas de gens aléatoires sur internet.' },
        { n: '03', title: 'réponds en retour', body: 'réponds, réagis, garde la conversation. c\'est social, pas une boîte.' },
        { n: '04', title: 'fais-le à ton image', body: 'personnalise ta page pour qu\'elle te ressemble vraiment.' },
        { n: '05', title: 'photos et voix', body: 'envoie des photos, memes et messages vocaux — déformés pour plus de mystère.' },
        { n: '06', title: 'garde la discussion vivante', body: 'une note peut devenir une vraie conversation. addictif, vraiment.' },
      ],
      lovedTitle: 'tu es plus aimé\n que tu le penses.',
      lovedBody: 'Chaque note dans ta boîte est la preuve que quelqu’un pensait à toi aujourd’hui. C\'est précisément le but — on est là pour te montrer à quel point tu es aimé.',
      liveTitle: 'voilà à quoi ça ressemble',
      liveBody: 'Pas de noms. Juste le message. Réponds, prends une capture, ou laisse-le dans ta boîte comme preuve que quelqu\'un se soucie de toi.',
      ctaTitle: 'prêt à savoir\n à quel point tu es aimé ?',
      ctaBody: 'c\'est gratuit. tes amis t\'attendent déjà.',
      ctaButton: 'crée mon tbh →',
      footerTagline: 'de vraies notes. de vraies personnes. de vrai buzz.',
      legal: 'légal',
    },
    notes: [
      'ta playlist est incroyable, envoie le lien',
      'à vrai dire, tu m\'es dans la tête toute la journée',
      'qui t\'a appris à t\'habiller comme ça 😭 (compliment)',
      'tu sais toujours quoi dire, tu vois',
    ],
  },
  es: {
    nav: { how: 'cómo funciona', features: 'características', live: 'ver en vivo', about: 'sobre nosotros', logIn: 'iniciar sesión', getMyLink: 'obtener mi enlace' },
    hero: { badge: 'amigos reales. diversión real. tú.', title: 'diviértete de verdad\n con tus amigos reales.', subtitle: 'Comparte tu enlace. Recibe notas anónimas de gente que ya se preocupa por ti. Spoiler: probablemente eres más popular de lo que crees.', ctaPrimary: 'obtener mi enlace →', ctaSecondary: 'ver en vivo' },
    sections: {
      lowEffort: 'poco esfuerzo, gran premio',
      howTitle: 'cómo funciona de verdad',
      steps: [
        { n: '01', title: 'crea tu enlace', body: 'toma 10 segundos. sin drama.' },
        { n: '02', title: 'compártelo por todos lados', body: 'stories, bio, grupo — donde ya estén tus personas.' },
        { n: '03', title: 'mira llegar las notas', body: 'mensajes anónimos de tu círculo. lee, responde y disfruta.' },
      ],
      featuresEyebrow: 'por qué tbh es distinto',
      featuresTitle: 'tu vida social, pero más fuerte',
      reasons: [
        { n: '01', title: 'totalmente anónimo', body: 'sin nombres, sin rastros. solo el mensaje.' },
        { n: '02', title: 'son tu gente', body: 'las notas vienen de tu círculo — no de cualquiera en internet.' },
        { n: '03', title: 'responde', body: 'responde, reacciona y sigue la conversación. es social, no una caja.' },
        { n: '04', title: 'hazlo tuyo', body: 'personaliza tu página para que se sienta como tú.' },
        { n: '05', title: 'fotos y notas de voz', body: 'envía fotos, memes y mensajes de voz — con efecto para más misterio.' },
        { n: '06', title: 'mantén la conversación viva', body: 'una nota puede volverse en toda una charla. bastante adictivo.' },
      ],
      lovedTitle: 'eres más querido\n de lo que piensas.',
      lovedBody: 'Cada nota en tu bandeja es la prueba de que alguien pensó en ti hoy. Ese es el punto — estamos aquí para mostrarte cuánto te quieren.',
      liveTitle: 'así es como se ve',
      liveBody: 'Sin nombres. Solo el mensaje. Responde, haz captura o déjalo en la bandeja como prueba de que alguien te quiere.',
      ctaTitle: '¿listo para descubrir\n cuánto te quieren de verdad?',
      ctaBody: 'es gratis. tus amigos ya te están esperando.',
      ctaButton: 'crear mi tbh →',
      footerTagline: 'notas reales. personas reales. emoción real.',
      legal: 'legal',
    },
    notes: [
      'tu playlist está increíble, envía el enlace',
      'la verdad es que te he tenido en la cabeza todo el día',
      '¿quién te enseñó a vestir así 😭 (complimento)',
      'siempre sabes qué decir, en serio',
    ],
  },
}

const navLinks = (locale: Locale) => [
  { href: '#how', label: landingCopy[locale].nav.how },
  { href: '#features', label: landingCopy[locale].nav.features },
  { href: '#live', label: landingCopy[locale].nav.live },
];

const languageOptions: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
];

const getStoredLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem('tbh-locale');
  if (stored === 'en' || stored === 'fr' || stored === 'es') return stored;
  const lang = window.navigator.language?.toLowerCase() ?? 'en';
  if (lang.startsWith('fr')) return 'fr';
  if (lang.startsWith('es')) return 'es';
  return 'en';
};

const isIvoryCoast = (): boolean => {
  if (typeof window === 'undefined') return false;
  const country = window.navigator.language?.split('-')[1]?.toUpperCase() ?? '';
  return country === 'CI';
};

// ────────────────────────────────────────────────────────────
// nav
// ────────────────────────────────────────────────────────────

function Nav({ locale, onLocaleChange }: { locale: Locale; onLocaleChange: (value: Locale) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = landingCopy[locale];

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
            {navLinks(locale).map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[#8B8894] hover:text-[#F5F4F2] rounded-full hover:bg-white/[0.05] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
              >
                {link.label}
              </a>
            ))}
            <div className="ml-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
              {languageOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onLocaleChange(option.value)}
                  className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${locale === option.value ? 'bg-white text-[#0B0B10]' : 'text-[#8B8894] hover:text-[#F5F4F2]'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Link
              href="/about"
              className="px-4 py-2 text-sm font-medium text-[#8B8894] hover:text-[#F5F4F2] rounded-full hover:bg-white/[0.05] transition-all"
            >
              {copy.nav.about}
            </Link>
            <Link
              href="/sign-up"
              className="ml-2 px-4 py-2 text-sm font-medium text-[#8B8894] hover:text-[#F5F4F2] transition-colors"
            >
              {copy.nav.logIn}
            </Link>
            <Link
              href="/sign-up"
              className="ml-1 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#F5F4F2] text-[#0B0B10] hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
            >
              {copy.nav.getMyLink}
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
                {navLinks(locale).map((link, i) => (
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
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                  <div className="flex gap-2">
                    {languageOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => { onLocaleChange(option.value); closeMenu(); }}
                        className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${locale === option.value ? 'bg-white text-[#0B0B10]' : 'text-[#8B8894] bg-transparent'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <Link href="/about" onClick={closeMenu} className="block px-4 py-3.5 text-lg font-semibold text-[#8B8894] rounded-2xl hover:bg-white/[0.06] transition-colors">
                    {copy.nav.about}
                  </Link>
                </motion.div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="w-full py-4 rounded-full text-center text-sm font-semibold border border-white/15 text-[#F5F4F2] hover:bg-white/[0.05] transition-colors"
                >
                  {copy.nav.logIn}
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="w-full py-4 rounded-full text-center text-sm font-bold bg-gradient-to-r from-[#FF6B4D] via-[#FF4FA0] to-[#8B5CF6] text-white hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  {copy.nav.getMyLink} →
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

function Hero({ locale }: { locale: Locale }) {
  const copy = landingCopy[locale];
  const marqueeNotes = [...copy.notes, ...copy.notes];

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
          {copy.hero.badge}
        </div>

        <div className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B4D] via-[#FF4FA0] to-[#8B5CF6] flex items-center justify-center shadow-[0_10px_30px_rgba(255,79,160,0.35)]">
          <span className="font-display text-xl font-bold text-[#0B0B10]">tbh</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-[#F5F4F2]">
          {copy.hero.title.split('\n').map((line, index) => (
            <span key={line + index} className="block">
              {index === 1 ? <span className="gradient-text">{line}</span> : line}
            </span>
          ))}
        </h1>
        <p className="mt-6 text-lg text-[#8B8894] max-w-md mx-auto leading-relaxed">
          {copy.hero.subtitle}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-up"
            className="px-8 py-4 rounded-full bg-[#F5F4F2] text-[#0B0B10] font-semibold hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
          >
            {copy.hero.ctaPrimary}
          </Link>
          <a
            href="#live"
            className="px-8 py-4 rounded-full border border-white/15 text-[#F5F4F2] font-semibold hover:bg-white/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4FA0]"
          >
            {copy.hero.ctaSecondary}
          </a>
        </div>
      </motion.div>

      <div className="relative mt-20 -mx-6 overflow-hidden">
        <div className="marquee-track flex w-max gap-4">
          {marqueeNotes.map((note, i) => (
            <div
              key={`${note}-${i}`}
              className="relative shrink-0 w-64 rounded-xl bg-[#F5EFE3] text-[#1B1810] p-4 text-sm font-medium leading-snug shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              style={{ transform: `rotate(${i % 2 === 0 ? "-1.5deg" : "1.5deg"})` }}
            >
              <span
                aria-hidden
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-9 h-3.5 rotate-[-3deg]"
                style={{ background: "rgba(255,79,160,0.65)" }}
              />
              {note}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0B0B10] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0B0B10] to-transparent" />
      </div>
    </section>
  );
}

function HowItWorks({ locale }: { locale: Locale }) {
  const copy = landingCopy[locale];
  return (
    <section id="how" className="relative bg-[#0B0B10] px-6 py-24 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#FF4FA0] mb-3">{copy.sections.lowEffort}</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2]">
          {copy.sections.howTitle}
        </h2>
        <div className="grid sm:grid-cols-3 gap-10 relative mt-16">
          <div className="hidden sm:block absolute top-6 left-0 right-0 h-px bg-white/10" />
          {copy.sections.steps.map((step, i) => (
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

function Features({ locale }: { locale: Locale }) {
  const copy = landingCopy[locale];
  return (
    <section id="features" className="bg-[#0B0B10] px-6 py-24 border-t border-white/5 scroll-mt-24">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#8B5CF6] mb-3">{copy.sections.featuresEyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2]">
          {copy.sections.featuresTitle}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
          {copy.sections.reasons.map((r, i) => (
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

function LovedSection({ locale }: { locale: Locale }) {
  const copy = landingCopy[locale];
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
          {copy.sections.lovedTitle.split('\n').map((line, index) => (
            <span key={line + index} className="block">{line}</span>
          ))}
        </p>
        <p className="mt-6 text-lg text-[#8B8894] max-w-xl mx-auto leading-relaxed">
          {copy.sections.lovedBody}
        </p>
      </motion.div>
    </section>
  );
}

function LiveDemo({ locale }: { locale: Locale }) {
  const copy = landingCopy[locale];
  return (
    <section id="live" className="bg-[#0B0B10] px-6 py-24 border-t border-white/5 scroll-mt-24">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F4F2] mb-4">
          {copy.sections.liveTitle}
        </h2>
        <p className="text-[#8B8894] leading-relaxed">
          {copy.sections.liveBody}
        </p>
      </div>

      <div className="relative mx-auto mt-14 w-[280px] h-[560px] rounded-[2.5rem] border border-white/10 bg-[#111017] shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
          <div className="w-24 h-5 bg-[#0B0B10] rounded-b-2xl" />
        </div>
        <div className="pt-12 px-4 space-y-3 h-full overflow-hidden">
          {copy.notes.map((msg, i) => (
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

function CallToAction({ locale }: { locale: Locale }) {
  const copy = landingCopy[locale];
  return (
    <section className="relative bg-[#0B0B10] px-6 py-28 text-center overflow-hidden border-t border-white/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,79,160,0.15),transparent_60%)]" />
      <div className="relative max-w-2xl mx-auto">
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#F5F4F2] mb-6 leading-tight">
          {copy.sections.ctaTitle.split('\n').map((line, index) => (
            <span key={line + index} className="block">{line}</span>
          ))}
        </h2>
        <p className="text-[#8B8894] mb-8">{copy.sections.ctaBody}</p>
        <Link
          href="/sign-up"
          className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-[#FF6B4D] via-[#FF4FA0] to-[#8B5CF6] text-white font-semibold hover:scale-105 active:scale-95 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {copy.sections.ctaButton}
        </Link>
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: Locale }) {
  const copy = landingCopy[locale];
  return (
    <footer className="bg-[#0B0B10] border-t border-white/5 px-6 py-14">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-3">
        <span className="font-display text-xl font-bold text-[#F5F4F2]">tbh</span>
        <p className="text-sm text-[#8B8894]">{copy.sections.footerTagline}</p>
        <div className="flex gap-6 text-sm text-[#8B8894] mt-3">
          <Link href="/about" className="hover:text-[#F5F4F2] transition-colors">{copy.nav.about}</Link>
          <Link href="/legal" className="hover:text-[#F5F4F2] transition-colors">{copy.sections.legal}</Link>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const initialLocale = getStoredLocale();
    if (initialLocale === 'fr' || initialLocale === 'es') {
      setLocale(initialLocale);
      return;
    }
    const defaultLocale = isIvoryCoast() || window.navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    setLocale(defaultLocale);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tbh-locale', locale);
    }
  }, [locale]);

  return (
    <main className="bg-[#0B0B10]">
      <Nav locale={locale} onLocaleChange={setLocale} />
      <Hero locale={locale} />
      <HowItWorks locale={locale} />
      <Features locale={locale} />
      <LovedSection locale={locale} />
      <LiveDemo locale={locale} />
      <CallToAction locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}
