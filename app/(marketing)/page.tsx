'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import './landing.css'

const A = '/assets'

// ─── Motion & Decorative Assets ───────────────────────────────────────────────
const OBJ = {
  basketball: `${A}/objects/basketball.svg`,
  paperPlane: `${A}/objects/paper-plane.svg`,
  can: `${A}/objects/can.svg`,
  crown: `${A}/objects/crown.svg`,
  discord: `${A}/objects/discord.svg`,
  disk: `${A}/objects/disk.svg`,
  earphones: `${A}/objects/earphones.svg`,
  snap: `${A}/objects/snap_logo.svg`,
  whatsapp: `${A}/objects/whatsapp_logo.svg`,
}

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

// ─── Floating People Configuration (Fast Loading PNGs) ────────────────────────
const PEOPLE = [
  {
    id: 'lucie',
    name: 'Lucie',
    src: `${A}/people/Lucie.png`,
    className: 'person-lucie',
    baseRot: -6,
    animDelay: 0,
    maxRadius: 36,
  },
  {
    id: 'helton',
    name: 'Helton',
    src: `${A}/people/Helton.png`,
    className: 'person-helton',
    baseRot: 5,
    animDelay: 1.2,
    maxRadius: 34,
  },
  {
    id: 'ella',
    name: 'Ella',
    src: `${A}/people/Ella.png`,
    className: 'person-ella',
    baseRot: 7,
    animDelay: 0.6,
    maxRadius: 38,
  },
  {
    id: 'annasthasie',
    name: 'Annasthasie',
    src: `${A}/people/Annasthasie.png`,
    className: 'person-annasthasie',
    baseRot: -5,
    animDelay: 1.8,
    maxRadius: 35,
  },
  {
    id: 'yvhann',
    name: 'Yvhann',
    src: `${A}/people/Yvhann.png`,
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

function Label({
  children,
  light = false,
}: {
  children: React.ReactNode
  light?: boolean
}) {
  return (
    <p className={`eyebrow ${light ? 'eyebrow--light' : ''}`}>{children}</p>
  )
}

// ─── Main Landing Page Component ──────────────────────────────────────────────
export default function LandingPage() {
  const [copied, setCopied] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(1)
  const [openFaq, setOpenFaq] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  // Track scroll position to drop the navbar down gracefully
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://tbht.link/send/yourname')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="landing-main">
      {/* ── Fixed Sticky Navigation (Drops down on scroll) ─────────────── */}
      <header className={`nav-wrapper ${scrolled ? 'nav-wrapper--scrolled' : ''}`}>
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
      </header>

      {/* ── 1. HERO SECTION ──────────────────────────────────────────── */}
      <section className="hero" id="top">
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

          <div className="hero-stage" aria-label="TBH Hero Stage">
            <div className="halo" />
            
            {/* Centerpiece honest talk prompt card */}
            <div className="hero-center-card floating">
              <div className="hero-card-header">
                <span className="hero-card-badge">tbh • anonymous</span>
                <span className="hero-card-status">● Live</span>
              </div>
              <p className="hero-card-question">
                "Tell me something you've never told me before."
              </p>
              <div className="hero-card-footer">
                <span>14 unread honest replies</span>
                <span className="hero-card-action">Reply ↗</span>
              </div>
            </div>

            {/* Motion Assets */}
            <img
              className="basketball hero-ball floating"
              src={OBJ.basketball}
              alt=""
            />
            <img
              className="paper-plane hero-plane drifting"
              src={OBJ.paperPlane}
              alt=""
            />
            <img
              className="hero-earphones floating"
              src={OBJ.earphones}
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
                '01',
                'Put your link out there.',
                'Get your TBH link and share it in your story, your bio, or a chat.',
              ],
              [
                '02',
                'Let the messages in.',
                'People open your link and send you an anonymous message. Find their replies in your inbox.',
              ],
              [
                '03',
                'Keep the chat going.',
                'Open a reply and chat. A little curiosity can turn into a real conversation.',
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
              <small>{copied ? 'COPIED ✓' : 'YOUR TBH LINK'}</small>
            </button>
            <p className="microcopy">Your story. Your bio. Your group chat.</p>
          </div>

          <div className="stage-share-composition">
            <div className="share-central-card">
              <div className="share-card-top">
                <img src={PEOPLE[0].src} alt="Lucie" className="share-avatar" />
                <div>
                  <h4>tbht.link/send/lucie</h4>
                  <span>Ready for honest thoughts</span>
                </div>
              </div>
              <div className="share-channels">
                <div className="share-channel-pill">
                  <img src={OBJ.snap} alt="Snapchat" />
                  <span>Snap Story</span>
                </div>
                <div className="share-channel-pill">
                  <img src={OBJ.whatsapp} alt="WhatsApp" />
                  <span>WhatsApp Status</span>
                </div>
                <div className="share-channel-pill">
                  <img src={OBJ.discord} alt="Discord" />
                  <span>Discord Bio & DM</span>
                </div>
              </div>
            </div>

            {/* Motion & Channel Decorative Badges */}
            <img className="floating-can floating" src={OBJ.can} alt="" />
            <img className="floating-snap drifting" src={OBJ.snap} alt="" />
            <img className="floating-whatsapp floating" src={OBJ.whatsapp} alt="" />
            <img className="floating-discord drifting" src={OBJ.discord} alt="" />
          </div>
        </div>
      </section>

      {/* ── 4. STORY: INBOX ──────────────────────────────────────────── */}
      <section className="story story--inbox">
        <div className="shell story-grid story-grid--reverse">
          <div className="stage-inbox-composition">
            <div className="inbox-card-stack">
              <div className="inbox-float-card card-top">
                <div className="inbox-tag">2m ago • Secret</div>
                <div className="inbox-text">"Ton rire illumine littéralement toute la pièce ✨"</div>
                <div className="inbox-reply-btn">Chat anonymously →</div>
              </div>

              <div className="inbox-float-card card-middle">
                <div className="inbox-tag">14m ago • Flirt</div>
                <div className="inbox-text">"J'ai un crush sur toi depuis le début de l'année 🤫"</div>
                <div className="inbox-reply-btn">Chat anonymously →</div>
              </div>

              <div className="inbox-float-card card-bottom">
                <div className="inbox-tag">1h ago • Question</div>
                <div className="inbox-text">"Quelle est ta plus grande peur inavouée ?"</div>
                <div className="inbox-reply-btn">Chat anonymously →</div>
              </div>
            </div>

            <img
              className="inbox-ball-float floating"
              src={OBJ.basketball}
              alt=""
            />
            <img
              className="inbox-crown-float drifting"
              src={OBJ.crown}
              alt=""
            />
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

          <div className="chat-art-composition">
            <div className="chat-bubbles-card floating">
              <div className="chat-bubble chat-bubble--incoming">
                <span className="bubble-sender">Anonymous</span>
                <p>"J'avais trop peur de venir te parler en vrai..."</p>
              </div>
              <div className="chat-bubble chat-bubble--outgoing">
                <p>"Fallait pas ! Tu aurais dû venir me voir haha 😅"</p>
              </div>
              <div className="chat-bubble chat-bubble--incoming">
                <p>"Promis la prochaine fois je viens ! 👀"</p>
              </div>
            </div>

            <img className="floating-disk rotating" src={OBJ.disk} alt="" />
            <img className="floating-earphones drifting" src={OBJ.earphones} alt="" />
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
                  selectedPrompt === index ? 'prompt-card--active' : ''
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
                    <i>{open ? '−' : '+'}</i>
                  </button>
                  <div
                    className={`faq-answer ${open ? 'faq-answer--open' : ''}`}
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
        <img className="cta-plane drifting" src={OBJ.paperPlane} alt="" />
        <img className="cta-can floating" src={OBJ.can} alt="" />
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
