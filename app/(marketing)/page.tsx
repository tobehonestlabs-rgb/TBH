'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import './landing.css'

const A = '/assets'

// ─── Prompts Data ─────────────────────────────────────────────────────────────
const prompts = [
  [
    'A LITTLE CURIOSITY',
    'What was your first impression of me?',
    'Start with a question.',
  ],
  [
    'SOMETHING UNSAID',
    'Tell me something you’ve never told me.',
    'Make room for honesty.',
  ],
  [
    'JUST FOR FUN',
    'Be honest. What’s my most iconic habit?',
    'Keep it light.',
  ],
]

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const faqs = [
  [
    'What is TBH?',
    'TBH is an app for sharing an anonymous-message link, receiving replies, and chatting with those replies.',
  ],
  [
    'How do I start receiving messages?',
    'Get your link in TBH and share it. People can open that link to send you an anonymous message.',
  ],
  [
    'Where can I share my TBH link?',
    'Try a social bio, a story, or a chat. Share it wherever you want to invite people to message you.',
  ],
  [
    'Where do my replies appear?',
    'Open the Inbox in TBH to see the replies to your link. Open a message to read it.',
  ],
  [
    'Can I chat with my replies?',
    'Yes. TBH lets you chat with your replies, so the conversation can continue after the first message.',
  ],
]

// ─── Floating People Configuration ────────────────────────────────────────────
const PEOPLE = [
  {
    id: 'lucie',
    name: 'Lucie',
    src: `${A}/people/Lucie.svg`,
    className: 'person-lucie',
    baseRot: -6,
    animDelay: 0,
    maxRadius: 36,
  },
  {
    id: 'helton',
    name: 'Helton',
    src: `${A}/people/Helton.svg`,
    className: 'person-helton',
    baseRot: 5,
    animDelay: 1.2,
    maxRadius: 34,
  },
  {
    id: 'ella',
    name: 'Ella',
    src: `${A}/people/Ella.svg`,
    className: 'person-ella',
    baseRot: 7,
    animDelay: 0.6,
    maxRadius: 38,
  },
  {
    id: 'annasthasie',
    name: 'Annasthasie',
    src: `${A}/people/Annasthasie.svg`,
    className: 'person-annasthasie',
    baseRot: -5,
    animDelay: 1.8,
    maxRadius: 35,
  },
  {
    id: 'yvhann',
    name: 'Yvhann',
    src: `${A}/people/Yvhann.svg`,
    className: 'person-yvhann',
    baseRot: 4,
    animDelay: 0.9,
    maxRadius: 32,
  },
]

// ─── Interactive Floating Person Card Component ───────────────────────────────
function FloatingHeroPersonCard({
  person,
}: {
  person: typeof PEOPLE[0]
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if fine pointer device (PC mouse / trackpad)
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    let animId: number
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let currentTiltX = 0
    let currentTiltY = 0
    let targetTiltX = 0
    let targetTiltY = 0
    let currentRotZ = person.baseRot
    let targetRotZ = person.baseRot

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const dist = Math.hypot(deltaX, deltaY)

      if (dist > 0) {
        const angle = Math.atan2(deltaY, deltaX)
        // Constrained circular orbit: displacement vector strictly clamped within maxRadius
        const effectiveRadius = Math.min(person.maxRadius, dist * 0.09)
        targetX = Math.cos(angle) * effectiveRadius
        targetY = Math.sin(angle) * effectiveRadius

        // 3D Pointing effect toward the cursor (tilts face toward pointer)
        targetTiltX = -(targetY / person.maxRadius) * 16
        targetTiltY = (targetX / person.maxRadius) * 16
        targetRotZ = person.baseRot + (targetX / person.maxRadius) * 4
      }
    }

    const render = () => {
      // Smooth lerp for fluid, jitter-free 60/120fps motion
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      currentTiltX += (targetTiltX - currentTiltX) * 0.12
      currentTiltY += (targetTiltY - currentTiltY) * 0.12
      currentRotZ += (targetRotZ - currentRotZ) * 0.12

      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) rotateZ(${currentRotZ.toFixed(2)}deg)`
      }
      animId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [person])

  return (
    <div
      className={`hero-person-wrapper ${person.className} floating`}
      style={{ animationDelay: `${person.animDelay}s` }}
    >
      <div
        ref={cardRef}
        className="hero-person-card"
        style={{
          transform: `rotateZ(${person.baseRot}deg)`,
        }}
        title={person.name}
      >
        <img src={person.src} alt={person.name} />
      </div>
    </div>
  )
}

// ─── Download Button ──────────────────────────────────────────────────────────
function DownloadButton({ dark = false }: { dark?: boolean }) {
  const router = useRouter()
  return (
    <button
      className={`download-button ${dark ? 'download-button--dark' : ''}`}
      onClick={() => {
        const el = document.querySelector('#download')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        } else {
          router.push('/sign-up')
        }
      }}
    >
      <span>Download TBH</span>
      <span className="button-arrow">↗</span>
    </button>
  )
}

// ─── High-Fidelity Phone Mockup Component ─────────────────────────────────────
function Phone({
  kind,
  compact = false,
  className = "",
}: {
  kind: "profile" | "inbox"
  compact?: boolean
  className?: string
}) {
  const profile = kind === "profile"
  return (
    <div
      className={`phone ${profile ? "phone--profile" : "phone--inbox"} ${
        compact ? "phone--compact" : ""
      } ${className}`}
    >
      <div className="phone-screen">
        {profile ? (
          /* Profile Screen Mockup */
          <div className="mockup-inner">
            <div className="mockup-header">
              <span className="mockup-chip">tbh</span>
              <span style={{ fontSize: '11px', color: '#30D158' }}>● Live</span>
            </div>
            <img
              src="/assets/people/Lucie.svg"
              alt="Profile"
              className="mockup-pfp"
            />
            <h4 className="mockup-name">Lucie</h4>
            <p className="mockup-handle">@lucie_tbh</p>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="mockup-inbox-item">
                <div className="mockup-inbox-tag">Question anonyme</div>
                <div className="mockup-inbox-text">"Avoue tu penses à qui en ce moment ? 👀"</div>
              </div>
              <div className="mockup-link-pill">
                <span style={{ color: '#fff', fontWeight: 600 }}>tbht.link/send/lucie</span>
                <span style={{ color: '#8e8e93' }}>Partager ↗</span>
              </div>
            </div>
          </div>
        ) : (
          /* Inbox Screen Mockup */
          <div className="mockup-inner">
            <div className="mockup-header">
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>Boîte de réception</span>
              <span className="mockup-chip" style={{ background: '#fff', color: '#0d0d0d', fontWeight: 700 }}>14 nouveaux</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              <div className="mockup-inbox-item">
                <div className="mockup-inbox-tag">Il y a 2m · Secret</div>
                <div className="mockup-inbox-text">"Ton rire illumine littéralement toute la pièce ✨"</div>
              </div>

              <div className="mockup-inbox-item">
                <div className="mockup-inbox-tag">Il y a 14m · Flirt</div>
                <div className="mockup-inbox-text">"J'ai un crush sur toi depuis le début de l'année 🤫"</div>
              </div>

              <div className="mockup-inbox-item" style={{ opacity: 0.85 }}>
                <div className="mockup-inbox-tag">Il y a 1h · Question</div>
                <div className="mockup-inbox-text">"Quelle est ta plus grande peur inavouée ?"</div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '10px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#8e8e93' }}>Chatter en direct avec les réponses →</span>
            </div>
          </div>
        )}
      </div>

      {/* Modern Sleek Phone Bezel Frame */}
      <svg
        className="phone-frame"
        viewBox="0 0 320 650"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="4"
          y="4"
          width="312"
          height="642"
          rx="44"
          stroke="url(#frame_stroke)"
          strokeWidth="6"
        />
        {/* Dynamic Island */}
        <rect x="110" y="16" width="100" height="26" rx="13" fill="#000" />
        <circle cx="190" cy="29" r="5" fill="#18181b" />
        <defs>
          <linearGradient id="frame_stroke" x1="0" y1="0" x2="320" y2="650" gradientUnits="userSpaceOnUse">
            <stop stopColor="#55555c" />
            <stop offset="0.5" stopColor="#222226" />
            <stop offset="1" stopColor="#44444a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function Label({
  children,
  light = false,
}: {
  children: React.ReactNode
  light?: boolean
}) {
  return (
    <p className={`eyebrow ${light ? "eyebrow--light" : ""}`}>{children}</p>
  )
}

// ─── Main Landing Page Component ──────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(1)
  const [openFaq, setOpenFaq] = useState(0)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://tbht.link/send/yourname")
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="landing-main">
      {/* ── 1. HERO SECTION ──────────────────────────────────────────── */}
      <section className="hero" id="top">
        <nav className="nav shell" aria-label="Main navigation">
          <a href="#top" aria-label="TBH home">
            <img
              className="logo--light"
              src={`${A}/TBH_Simple_Logo.svg`}
              alt="TBH"
              style={{ filter: 'invert(1)' }}
            />
          </a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#app">The app</a>
            <a href="#faq">FAQ</a>
          </div>
          <DownloadButton />
        </nav>

        <div className="hero-content shell">
          {/* Floating People Cards in Hero (PC cursor constrained orbit) */}
          <div className="hero-people-layer">
            {PEOPLE.map(person => (
              <FloatingHeroPersonCard key={person.id} person={person} />
            ))}
          </div>

          <div className="hero-copy">
            <Label light>LESS OVERTHINKING. MORE HONESTY.</Label>
            <h1>
              Your link.
              <br />
              Their thoughts.
              <br />
              Real talk.
            </h1>
            <p className="hero-intro">
              Share your anonymous link. Receive honest messages. Turn a reply
              into a conversation.
            </p>
            <div className="hero-actions">
              <DownloadButton />
              <a href="#how">See how it works ↓</a>
            </div>
          </div>

          <div className="hero-stage" aria-label="TBH app preview">
            <div className="halo" />
            <Phone
              kind="profile"
              compact
              className="hero-phone hero-phone--profile"
            />
            <Phone
              kind="inbox"
              compact
              className="hero-phone hero-phone--inbox"
            />
            <img
              className="basketball hero-ball floating"
              src={`${A}/basketBall.svg`}
              alt=""
            />
            <img
              className="paper-plane hero-plane drifting"
              src={`${A}/BrokenHeart.svg`}
              alt=""
            />
          </div>
        </div>

        <div className="promise shell">
          <p>TO BE HONEST, IT STARTS WITH A LINK.</p>
          <div>
            <span>01&nbsp;&nbsp; Share</span>
            <span>02&nbsp;&nbsp; Receive</span>
            <span>03&nbsp;&nbsp; Chat</span>
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS SECTION ──────────────────────────────────── */}
      <section className="how section-dark" id="how">
        <div className="shell">
          <div className="section-intro">
            <Label light>THE SHORT VERSION</Label>
            <h2>Three steps. Zero big speeches.</h2>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Put your link out there.",
                "Get your TBH link and share it in your story, your bio, or a chat.",
              ],
              [
                "02",
                "Let the messages in.",
                "People open your link and send you an anonymous message. Find their replies in your inbox.",
              ],
              [
                "03",
                "Keep the chat going.",
                "Open a reply and chat. A little curiosity can turn into a real conversation.",
              ],
            ].map(([number, title, text]) => (
              <article className="step" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STORY: SHARE YOUR LINK ────────────────────────────────── */}
      <section className="story story--share" id="app">
        <div className="shell story-grid">
          <div className="story-copy story-copy--light">
            <Label light>01 / YOUR LINK, YOUR INVITATION</Label>
            <h2>
              A small link.
              <br />A lot to say.
            </h2>
            <p>
              Your TBH profile is the starting point. Share your
              anonymous-message link wherever your people already are. Give them
              a new way to say hello.
            </p>
            <button className="link-pill" onClick={copyLink} aria-live="polite">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>tbht.link/send/…</span>
              <small>{copied ? "COPIED ✓" : "YOUR TBH LINK"}</small>
            </button>
            <p className="microcopy">Your story. Your bio. Your group chat.</p>
          </div>
          <div className="product-stage product-stage--share">
            <Phone
              kind="profile"
              className="feature-phone feature-phone--left"
            />
            <img className="metal-can floating" src={`${A}/crown.svg`} alt="" />
            <div className="product-caption">
              <span>THE APP / SHARE YOUR LINK</span>
              <span>01—03</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. STORY: INBOX ──────────────────────────────────────────── */}
      <section className="story story--inbox">
        <div className="shell story-grid story-grid--reverse">
          <div className="product-stage product-stage--inbox">
            <Phone
              kind="inbox"
              className="feature-phone feature-phone--right"
            />
            <img
              className="basketball inbox-ball floating"
              src={`${A}/basketBall.svg`}
              alt=""
            />
            <div className="product-caption product-caption--dark">
              <span>THE APP / YOUR REPLIES IN ONE PLACE</span>
            </div>
          </div>
          <div className="story-copy">
            <Label>02 / A LITTLE MYSTERY IN YOUR INBOX</Label>
            <h2>
              The message is
              <br />
              just the beginning.
            </h2>
            <p>
              A question. A compliment. Something they’ve been meaning to say.
              Open your TBH inbox to see the anonymous replies to your link.
            </p>
            <div className="feature-note">
              <span>↳</span>
              <div>
                <h3>Read it. Then reply.</h3>
                <p>Go from checking a message to chatting about it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. STORY: CHAT ───────────────────────────────────────────── */}
      <section className="story story--chat">
        <div className="shell story-grid story-grid--chat">
          <div className="story-copy">
            <Label>03 / DON’T LEAVE IT AT HELLO</Label>
            <h2>
              Less “who’s this?”
              <br />
              More “tell me more.”
            </h2>
            <p>
              TBH isn’t just a place to collect messages. Chat with your replies
              and give a one-line thought somewhere to go.
            </p>
            <div className="journey">
              <span>A message</span>
              <i>→</i>
              <span>Your reply</span>
              <i>→</i>
              <span>A conversation</span>
            </div>
          </div>
          <div className="chat-art">
            <img className="drifting" src={`${A}/BrokenHeart.svg`} alt="" />
          </div>
        </div>
      </section>

      {/* ── 6. PROMPTS CAROUSEL ──────────────────────────────────────── */}
      <section className="prompts">
        <div className="shell">
          <div className="prompts-intro">
            <div>
              <Label>GIVE THEM SOMETHING TO TALK ABOUT</Label>
              <h2>
                Big feelings.
                <br />
                Small icebreakers.
              </h2>
            </div>
            <p>
              Not sure what to post with your link? Borrow a line. See where it
              takes you.
            </p>
          </div>
          <div className="prompt-cards">
            {prompts.map(([label, title, foot], index) => (
              <button
                className={`prompt-card ${
                  selectedPrompt === index ? "prompt-card--active" : ""
                }`}
                key={label}
                onClick={() => setSelectedPrompt(index)}
              >
                <small>{label}</small>
                <strong>{title}</strong>
                <span>{foot}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. KINDNESS SECTION ──────────────────────────────────────── */}
      <section className="kindness">
        <div className="shell kindness-inner">
          <div>
            <Label>A NOTE ON BEING HONEST</Label>
            <h2>Anonymous ≠ unkind.</h2>
          </div>
          <div>
            <p>
              There’s a person on the other side of every message. Be curious.
              Be thoughtful. Say what you mean without making it mean.
            </p>
            <strong>Real talk. Real people. A little more kindness.</strong>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ACCORDION ─────────────────────────────────────────── */}
      <section className="faq" id="faq">
        <div className="shell faq-grid">
          <div className="faq-intro">
            <Label>GOOD QUESTIONS</Label>
            <h2>
              A little
              <br />
              more clarity.
            </h2>
            <p>The basics, before you send your link into the world.</p>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => {
              const open = openFaq === index
              return (
                <article className="faq-item" key={question}>
                  <button
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? -1 : index)}
                  >
                    <span>{question}</span>
                    <i>{open ? "−" : "+"}</i>
                  </button>
                  <div
                    className={`faq-answer ${open ? "faq-answer--open" : ""}`}
                  >
                    <p>{answer}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 9. DOWNLOAD CTA ──────────────────────────────────────────── */}
      <section className="cta" id="download">
        <img className="cta-plane drifting" src={`${A}/BrokenHeart.svg`} alt="" />
        <img className="cta-can floating" src={`${A}/crown.svg`} alt="" />
        <Label>YOUR NEXT CONVERSATION STARTS HERE</Label>
        <h2>
          Go on.
          <br />
          Put your link out there.
        </h2>
        <p>Share your anonymous link. See what comes back.</p>
        <DownloadButton dark />
        <small>TO BE HONEST, WE’RE CURIOUS TOO.</small>
      </section>

      {/* ── 10. FOOTER ──────────────────────────────────────────────── */}
      <footer>
        <div className="shell">
          <div className="footer-main">
            <div className="footer-brand">
              <img src={`${A}/TBH_Title_Logo.svg`} alt="TBH" style={{ height: '44px' }} />
              <p>Honest messages. Unexpected conversations.</p>
            </div>
            <div className="footer-links">
              <div>
                <small>EXPLORE</small>
                <a href="#how">How it works</a>
                <a href="#app">The app</a>
                <a href="#download">Download TBH</a>
              </div>
              <div>
                <small>THE DETAILS</small>
                <a href="#faq">FAQ</a>
                <a href="/safety">Privacy policy</a>
                <a href="/legal">Terms of use</a>
              </div>
            </div>
          </div>
          <div className="footer-legal">
            <span>© 2026 TBH. All rights reserved.</span>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
