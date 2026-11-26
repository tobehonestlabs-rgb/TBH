'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import './landing.css'

const A = '/assets'

// ─── Motion & Decorative Assets (Exclusively from /assets/objects) ────────────
const OBJ = {
  basketball: `${A}/objects/basketball.svg`,
  paperPlane: `${A}/objects/paper-plane.svg`,
  can: `${A}/objects/can.svg`,
  crown: `${A}/objects/crown.svg`,
  disk: `${A}/objects/disk.svg`,
  earphones: `${A}/objects/earphones.svg`,
  snap: `${A}/objects/snap_logo.svg`,
  whatsapp: `${A}/objects/whatsapp_logo.svg`,
  instagram: `${A}/objects/insta_logo.svg`,
  android: `${A}/objects/android.svg`,
}

// ─── Floating People Configuration (from /assets/people) ──────────────────────
// Anna (top-left), Helton (bottom-left), Ella (top-right), Yvann (mid-right), Lucie (bottom-right)
const PEOPLE = [
  {
    id: 'anna',
    name: 'Anna',
    src: `${A}/people/Annasthasie.png`,
    className: 'person-anna',
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
    id: 'yvhann',
    name: 'Yvann',
    src: `${A}/people/Yvhann.png`,
    className: 'person-yvhann',
    baseRot: -5,
    animDelay: 1.8,
    maxRadius: 35,
  },
  {
    id: 'lucie',
    name: 'Lucie',
    src: `${A}/people/Lucie.png`,
    className: 'person-lucie',
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

// ─── Android Button Component ─────────────────────────────────────────────────
function AndroidButton({ dark = false }: { dark?: boolean }) {
  const router = useRouter()
  return (
    <button
      className={`android-button ${dark ? 'android-button--dark' : ''}`}
      onClick={() => {
        const el = document.querySelector('#download')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        } else {
          router.push('/sign-up')
        }
      }}
      aria-label="TBH on Android"
      title="Download TBH on Android"
    >
      <img
        src={OBJ.android}
        alt="Android"
        className="android-btn-icon"
      />
      <span>Android</span>
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
  const [scrolled, setScrolled] = useState(false)

  // Recover from OAuth redirects that land on root
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search
      const hash = window.location.hash
      if (search.includes('code=') || hash.includes('access_token=') || search.includes('error=')) {
        window.location.href = `/auth/callback${search}${hash}`
      }
    }
  }, [])

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
          </div>
          <AndroidButton />
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
              <AndroidButton />
              <a href="#how">See how it works ↓</a>
            </div>
          </div>

          <div className="hero-stage" aria-label="TBH Hero Stage">
            <div className="halo" />

            {/* Motion Decorative Assets in Hero */}
            <img
              className="hero-ball floating"
              src={OBJ.basketball}
              alt=""
            />
            <img
              className="hero-plane drifting"
              src={OBJ.paperPlane}
              alt=""
            />
            <img
              className="hero-crown floating"
              src={OBJ.crown}
              alt=""
            />
            <img
              className="hero-earphones drifting"
              src={OBJ.earphones}
              alt=""
            />
            <img
              className="hero-disk rotating"
              src={OBJ.disk}
              alt=""
            />
          </div>
        </div>

        {/* ── Second Title (Positioned between Helton on left & Lucie on right) ── */}
        <div className="hero-second-title shell">
          <div className="hero-second-title-text">
            <Label light>01 / START THE CONVERSATION</Label>
            <h2>To be honest, it starts with a link.</h2>
          </div>
          <div className="hero-second-steps">
            <span>01&nbsp;&nbsp;Share</span>
            <i>→</i>
            <span>02&nbsp;&nbsp;Receive</span>
            <i>→</i>
            <span>03&nbsp;&nbsp;Chat</span>
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
                <img src={PEOPLE[0].src} alt="Anna" className="share-avatar" />
                <div>
                  <h4>tbht.link/send/anna</h4>
                  <span>Ready for honest thoughts</span>
                </div>
              </div>
              <div className="share-channels">
                <div className="share-channel-pill">
                  <img src={OBJ.instagram} alt="Instagram" />
                  <span>Instagram Story & Bio</span>
                </div>
                <div className="share-channel-pill">
                  <img src={OBJ.snap} alt="Snapchat" />
                  <span>Snap Story</span>
                </div>
                <div className="share-channel-pill">
                  <img src={OBJ.whatsapp} alt="WhatsApp" />
                  <span>WhatsApp Status</span>
                </div>
              </div>
            </div>

            {/* Motion & Channel Decorative Badges */}
            <img className="floating-can floating" src={OBJ.can} alt="" />
            <img className="floating-instagram drifting" src={OBJ.instagram} alt="" />
            <img className="floating-snap floating" src={OBJ.snap} alt="" />
            <img className="floating-whatsapp drifting" src={OBJ.whatsapp} alt="" />
          </div>
        </div>
      </section>

      {/* ── 4. STORY: INBOX & CHATS ──────────────────────────────────── */}
      <section className="story story--inbox">
        <div className="shell story-grid story-grid--reverse">
          <div className="stage-inbox-composition">
            {/* Active Chat Cards Stack */}
            <div className="inbox-card-stack">
              <div className="inbox-chat-card card-top">
                <div className="chat-card-meta">
                  <div className="chat-user">
                    <span className="anon-avatar">🤫</span>
                    <span className="anon-name">Anonymous</span>
                  </div>
                  <span className="chat-time">2m ago</span>
                </div>
                <div className="chat-preview-bubbles">
                  <div className="bubble-snippet bubble-incoming">"I like you since we met"</div>
                  <div className="bubble-snippet bubble-outgoing">"Ow really? And are we close?"</div>
                  <div className="bubble-snippet bubble-incoming">"That's a secret 🤭"</div>
                </div>
              </div>

              <div className="inbox-chat-card card-middle">
                <div className="chat-card-meta">
                  <div className="chat-user">
                    <span className="anon-avatar">✨</span>
                    <span className="anon-name">Anonymous</span>
                  </div>
                  <span className="chat-time">14m ago</span>
                </div>
                <div className="chat-preview-bubbles">
                  <div className="bubble-snippet bubble-incoming">"You're honestly the most iconic person in class"</div>
                  <div className="bubble-snippet bubble-outgoing">"Haha wait, do I know you well?"</div>
                  <div className="bubble-snippet bubble-incoming">"More than you think 👀"</div>
                </div>
              </div>

              <div className="inbox-chat-card card-bottom">
                <div className="chat-card-meta">
                  <div className="chat-user">
                    <span className="anon-avatar">🎲</span>
                    <span className="anon-name">Anonymous</span>
                  </div>
                  <span className="chat-time">1h ago</span>
                </div>
                <div className="chat-preview-bubbles">
                  <div className="bubble-snippet bubble-incoming">"Be honest, what's your biggest guilty pleasure?"</div>
                  <div className="bubble-snippet bubble-outgoing">"Late night matcha and bad rom-coms 🍵"</div>
                  <div className="bubble-snippet bubble-incoming">"I knew it! 😂"</div>
                </div>
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
              A compliment. A confession. Something they’ve been meaning to ask.
              Open your TBH inbox to see the anonymous chats waiting for you.
            </p>
            <div className="feature-note">
              <span>↳</span>
              <div>
                <h3>Read it. Then chat.</h3>
                <p>Go from receiving a reply to an active anonymous conversation.</p>
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
                <p>"I like you since we met"</p>
              </div>
              <div className="chat-bubble chat-bubble--outgoing">
                <p>"Ow really? And are we close?"</p>
              </div>
              <div className="chat-bubble chat-bubble--incoming">
                <span className="bubble-sender">Anonymous</span>
                <p>"That's a secret 🤭"</p>
              </div>
            </div>

            <img className="floating-disk rotating" src={OBJ.disk} alt="" />
            <img className="floating-earphones drifting" src={OBJ.earphones} alt="" />
          </div>
        </div>
      </section>

      {/* ── 6. KINDNESS SECTION ──────────────────────────────────────── */}
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

      {/* ── 7. DOWNLOAD CTA ──────────────────────────────────────────── */}
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
        <AndroidButton dark />
        <small>TO BE HONEST, WE’RE CURIOUS TOO.</small>
      </section>

      {/* ── 8. FOOTER ──────────────────────────────────────────────── */}
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
                <a href="#download">Android App</a>
              </div>
              <div>
                <small>THE DETAILS</small>
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
