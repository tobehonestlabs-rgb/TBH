'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

const SUGGESTIONS = [
  "Tell them something you've never had the courage to say 🤫",
  "Send a genuine compliment — it might make their whole day 🌟",
  "Share an honest opinion they probably don't expect 👀",
  "Ask them something you've always been curious about 🎯",
  "Tell them what you truly think of them 💬",
  "Send a photo of something that reminds you of them 📷",
  "Be real — what's one thing they should know? 🔥",
]

export default function SendMessagePage() {
  const { slug } = useParams<{ slug: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [popupVisible, setPopupVisible] = useState(false)
  const [suggIndex, setSuggIndex] = useState(0)
  const [suggVisible, setSuggVisible] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Animate popup in
  useEffect(() => {
    const t = setTimeout(() => setPopupVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Rotate suggestions
  useEffect(() => {
    if (!agreedToTerms) return
    const interval = setInterval(() => {
      setSuggVisible(false)
      setTimeout(() => {
        setSuggIndex(i => (i + 1) % SUGGESTIONS.length)
        setSuggVisible(true)
      }, 500)
    }, 6000)
    return () => clearInterval(interval)
  }, [agreedToTerms])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImagePreview(URL.createObjectURL(file))
    else setImagePreview(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSending(true)
    try {
      const formData = new FormData(e.currentTarget)
      formData.append('slug', slug)
      const response = await fetch('/api/messages', { method: 'POST', body: formData })
      const data = await response.json().catch(() => ({ error: 'Invalid server response' }))
      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSuccess(true)
        setMessage('')
        setImagePreview(null)
        if (fileRef.current) fileRef.current.value = ''
      }
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
      setSending(false)
    }
  }

  // ── Terms Popup ──────────────────────────────────────────────────────────────
  if (!agreedToTerms) {
    return (
      <main style={{
        minHeight: '100svh',
        background: 'linear-gradient(160deg, #FFF3EE 0%, #FFF8F0 50%, #FFFAF5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
      }}>
        <div style={{
          width: '100%',
          maxWidth: '360px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(255,107,107,0.18), 0 8px 24px rgba(0,0,0,0.08)',
          transform: popupVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
          opacity: popupVisible ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
        }}>
          {/* Gradient top bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #FF6B6B, #FFB347, #FFE66D)' }} />

          <div style={{ padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Icon */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B6B22, #FFB34722)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px',
            }}>🛡️</div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#1A1A1A', margin: '0 0 6px' }}>
                Before you send
              </p>
              <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.5', margin: 0 }}>
                Keep it kind. This platform strictly prohibits:
              </p>
            </div>

            {/* Rules */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { emoji: '🚫', text: 'Harassment & bullying of any kind' },
                { emoji: '⚠️', text: 'Harmful or violent content' },
                { emoji: '🔞', text: 'Inappropriate sexual content' },
                { emoji: '👶', text: 'Any content involving minors' },
              ].map(item => (
                <div key={item.text} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FFF5F5, #FFF8F0)',
                  border: '1px solid rgba(255,107,107,0.12)',
                }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.emoji}</span>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '11px', color: '#BBBBBB', textAlign: 'center', lineHeight: '1.5', margin: '0 8px' }}>
              Violations may be reported to the appropriate authorities.
            </p>

            {/* CTA */}
            <button
              onClick={() => setAgreedToTerms(true)}
              style={{
                width: '100%', padding: '16px',
                borderRadius: '99px', border: 'none',
                background: 'linear-gradient(135deg, #FF6B6B, #FFB347)',
                color: 'white', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', letterSpacing: '-0.2px',
                boxShadow: '0 8px 24px rgba(255,107,107,0.35)',
                transform: 'scale(1)',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ✓ I agree, let me send
            </button>

            <button
              onClick={() => window.history.back()}
              style={{ background: 'none', border: 'none', color: '#CCCCCC', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Leave this page
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Success Screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <main style={{
        minHeight: '100svh',
        background: 'linear-gradient(160deg, #FFF3EE 0%, #FFF8F0 50%, #FFFAF5 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
        fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
        gap: '32px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B6B, #FFB347)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
            boxShadow: '0 16px 40px rgba(255,107,107,0.3)',
            animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          }}>🎉</div>
          <p style={{ fontSize: '26px', fontWeight: '800', color: '#1A1A1A', margin: 0 }}>Message sent!</p>
          <p style={{ fontSize: '15px', color: '#999', textAlign: 'center', maxWidth: '240px', lineHeight: '1.5', margin: 0 }}>
            Your anonymous message is flying to{' '}
            <span style={{ fontWeight: '700', color: '#FF6B6B' }}>@{slug}</span> 🚀
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => { setSuccess(false); setMessage('') }}
            style={{
              width: '100%', padding: '17px',
              borderRadius: '99px', border: 'none',
              background: 'linear-gradient(135deg, #FF6B6B, #FFB347)',
              color: 'white', fontSize: '16px', fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            💬 Send another message
          </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{
              width: '100%', padding: '17px',
              borderRadius: '99px',
              background: 'white',
              border: '2px solid #FF6B6B',
              color: '#FF6B6B', fontSize: '16px', fontWeight: '800',
              cursor: 'pointer',
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✨ Get my own messages
          </button>
        </div>

        <p style={{ fontSize: '12px', color: '#CCCCCC', textAlign: 'center', maxWidth: '220px', lineHeight: '1.6' }}>
          Start your own profile and receive honest anonymous messages
        </p>

        <style>{`
          @keyframes popIn {
            from { transform: scale(0.4); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </main>
    )
  }

  // ── Main Send Screen ─────────────────────────────────────────────────────────
  return (
    <main style={{
      minHeight: '100svh',
      background: 'linear-gradient(160deg, #FFF3EE 0%, #FFF8F0 50%, #FFFAF5 100%)',
      fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top accent */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #FF6B6B, #FFB347, #FFE66D)', flexShrink: 0 }} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '32px 20px 40px',
        maxWidth: '440px', margin: '0 auto', width: '100%',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B6B, #FFB347)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', marginBottom: '4px',
            boxShadow: '0 8px 20px rgba(255,107,107,0.25)',
          }}>🤫</div>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#1A1A1A', margin: 0, letterSpacing: '-0.5px' }}>
            Send anonymously
          </p>
          <p style={{ fontSize: '14px', color: '#AAA', margin: 0 }}>
            to <span style={{ fontWeight: '700', color: '#FF6B6B' }}>@{slug}</span>
          </p>
        </div>

        {/* Suggestion pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '16px', marginBottom: '20px',
          background: 'rgba(255,107,107,0.06)',
          border: '1px solid rgba(255,107,107,0.14)',
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
          <p style={{
            fontSize: '13px', color: '#FF8C42', lineHeight: '1.5', margin: 0,
            transition: 'opacity 0.5s ease',
            opacity: suggVisible ? 1 : 0,
          }}>
            {SUGGESTIONS[suggIndex]}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              name="message"
              required
              rows={6}
              maxLength={1000}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message here..."
              style={{
                width: '100%', borderRadius: '20px',
                padding: '16px 18px 36px',
                fontSize: '16px', color: '#1A1A1A',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,107,107,0.18)',
                boxShadow: '0 4px 20px rgba(255,107,107,0.07)',
                outline: 'none', resize: 'none',
                lineHeight: '1.6', boxSizing: 'border-box',
                fontFamily: "inherit",
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(255,107,107,0.45)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,107,107,0.14)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,107,107,0.18)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,107,107,0.07)'
              }}
            />
            <p style={{
              position: 'absolute', bottom: '12px', right: '16px',
              fontSize: '11px', margin: 0,
              color: message.length > 900 ? '#FF6B6B' : '#CCCCCC',
            }}>
              {message.length}/1000
            </p>
          </div>

          {/* Image upload */}
          <input
            ref={fileRef}
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          {imagePreview ? (
            <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', border: 'none',
                  color: 'white', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.88)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >✕</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', padding: '16px',
                borderRadius: '20px', border: '1.5px dashed rgba(255,107,107,0.28)',
                background: 'rgba(255,255,255,0.7)',
                color: '#FFB347', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                transition: 'transform 0.12s ease, background 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ fontSize: '18px' }}>📷</span>
              Add a photo (optional)
            </button>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '14px',
              background: '#FFF0F0', border: '1px solid #FFD0D0',
            }}>
              <p style={{ fontSize: '13px', color: '#E53E3E', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            style={{
              width: '100%', padding: '18px',
              borderRadius: '99px', border: 'none',
              background: message.trim()
                ? 'linear-gradient(135deg, #FF6B6B, #FFB347)'
                : 'rgba(0,0,0,0.08)',
              color: message.trim() ? 'white' : '#BBBBBB',
              fontSize: '17px', fontWeight: '800',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              letterSpacing: '-0.3px',
              boxShadow: message.trim() ? '0 10px 28px rgba(255,107,107,0.32)' : 'none',
              transition: 'all 0.2s ease, transform 0.12s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit',
            }}
            onMouseDown={e => { if (message.trim()) e.currentTarget.style.transform = 'scale(0.96)' }}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => { if (message.trim()) e.currentTarget.style.transform = 'scale(0.96)' }}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: '2.5px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Sending...
              </>
            ) : (
              <>🚀 Send anonymously</>
            )}
          </button>
        </form>

        {/* Footer nudge */}
        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '1px', background: 'rgba(0,0,0,0.08)' }} />
          <p style={{ fontSize: '12px', color: '#CCCCCC', textAlign: 'center', lineHeight: '1.6', maxWidth: '260px', margin: 0 }}>
            Want to receive your own anonymous messages?
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px', borderRadius: '99px',
              background: 'white', border: '1.5px solid rgba(255,107,107,0.25)',
              color: '#FF6B6B', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(255,107,107,0.1)',
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✨ Create my profile
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { -webkit-tap-highlight-color: transparent; }
        textarea::placeholder { color: #CCCCCC; }
      `}</style>
    </main>
  )
}