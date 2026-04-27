'use client'
 
import { FormEvent, useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
 
const SUGGESTIONS = [
  "Tell them something you've never had the courage to say 👀",
  "Send a genuine compliment — it might make their whole day 🌟",
  "Share an honest opinion they probably don't expect 🤫",
  "Ask them something you've always been curious about 🎯",
  "Tell them what you truly think of them 💬",
  "Be real — what's one thing they should know? 🔥",
]
 
type RecipientProfile = {
  username: string
  pfp: string | null
}
 
export default function SendMessagePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
 
  const [recipient, setRecipient] = useState<RecipientProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [popupVisible, setPopupVisible] = useState(false)
  const [suggIndex, setSuggIndex] = useState(0)
  const [suggVisible, setSuggVisible] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
 
  const themeGradient = 'linear-gradient(180deg, #0D0D0D 45%, #ff431dcb 85%, #ff4a1d 100%)'
  const accentColor = '#ff3f1d'
  const font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"
 
  // Fetch recipient profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) return
      const { data } = await supabaseClient
        .from('users_table')
        .select('username, pfp')
        .eq('slug', slug)
        .single()
      if (data) setRecipient(data)
    }
    fetchProfile()
  }, [slug])
 
  useEffect(() => {
    const t = setTimeout(() => setPopupVisible(true), 60)
    return () => clearTimeout(t)
  }, [])
 
  useEffect(() => {
    if (!agreedToTerms) return
    const interval = setInterval(() => {
      setSuggVisible(false)
      setTimeout(() => {
        setSuggIndex(i => (i + 1) % SUGGESTIONS.length)
        setSuggVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [agreedToTerms])
 
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImagePreview(URL.createObjectURL(file))
    else setImagePreview(null)
  }
 
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim() || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('message', message)
      formData.append('slug', slug as string)
      if (fileRef.current?.files?.[0]) formData.append('image', fileRef.current.files[0])
 
      const response = await fetch('/api/messages', { method: 'POST', body: formData })
      if (!response.ok) throw new Error()
      setSuccess(true)
      setMessage('')
      setImagePreview(null)
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
 
  // ── Terms popup ──────────────────────────────────────────────────────────────
  if (!agreedToTerms) {
    return (

      <main style={{ minHeight: '100svh', background: themeGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: font }}>
        <div style={{
          width: '100%', maxWidth: '360px',
          background: 'rgba(35,35,35,0.85)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '32px', overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          transform: popupVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
          opacity: popupVisible ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease'
        }}>
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
 
            {/* Recipient profile pic in popup */}
            {recipient && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden',
                  border: `3px solid ${accentColor}`,
                  background: '#333',
                }}>
                  {recipient.pfp
                    ? <img src={recipient.pfp} alt={recipient.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: '800' }}>
                        {recipient.username[0]?.toUpperCase()}
                      </div>
                  }
                </div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  @{recipient.username}
                </p>
              </div>
            )}
 
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>Before you send</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>
              These are strictly prohibited on TBH
            </p>
 
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { emoji: '🚫', text: 'Harassment & bullying' },
                { emoji: '⚠️', text: 'Harmful content' },
                { emoji: '🔞', text: 'Inappropriate or sexual content involving minors' },
                { emoji: '👺', text: 'No slur, Stay respectful' },
              ].map(item => (
                <div key={item.text} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '18px',
                  background: 'rgba(255,255,255,0.05)'
                }}>
                  <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
 
            <button
              onClick={() => setAgreedToTerms(true)}
              style={{
                width: '100%', padding: '18px', borderRadius: '99px',
                border: 'none', background: accentColor, color: 'white',
                fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                boxShadow: `0 8px 32px rgba(255,65,29,0.35)`,
                transition: 'transform 0.12s ease', fontFamily: font, marginTop: '8px'
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              I agree, continue →
            </button>
 
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
              Violations may result in permanent ban
            </p>
          </div>
        </div>
      </main>
    )
  }
 
  // ── Success screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
       
      <main 
      
      
      style={{
        minHeight: '100svh', background: themeGradient,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '32px 24px', fontFamily: font, gap: '24px'
      }}>
        <img src="/assets/TBH_Title_Logo.svg" alt="TBH" style={{ height: '48px', filter: 'invert(1)' }} />
 
        <div style={{
          width: '100%', maxWidth: '360px',
          background: 'rgba(35,35,35,0.85)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '32px', padding: '40px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.5s ease'
        }}>
          {/* Recipient pfp on success too */}
          {recipient?.pfp && (
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              overflow: 'hidden', border: `3px solid ${accentColor}`,
              marginBottom: '16px'
            }}>
              <img src={recipient.pfp} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <span style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</span>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 4px' }}>Sent!</p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
            Your anonymous message to{' '}
            <span style={{ color: accentColor, fontWeight: '700' }}>@{recipient?.username ?? slug}</span>{' '}
            was delivered.
          </p>
        </div>
 
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => setSuccess(false)}
            style={{
              width: '100%', padding: '18px', borderRadius: '99px',
              border: 'none', background: '#0D0D0D',
              color: 'white', fontSize: '16px', fontWeight: '800', cursor: 'pointer',
              transition: 'transform 0.12s ease', fontFamily: font,
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            📩 Send another message
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%', padding: '18px', borderRadius: '99px',
              border: 'none', background: accentColor,
              color: 'white', fontSize: '16px', fontWeight: '800', cursor: 'pointer',
              boxShadow: `0 8px 32px rgba(255,65,29,0.35)`,
              transition: 'transform 0.12s ease', fontFamily: font,
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✨ Get my own anonymous messages
          </button>
        </div>
      </main>
    )
  }
 
  // ── Main send screen ─────────────────────────────────────────────────────────
  return (
    <main style={{
      minHeight: '100svh', background: themeGradient,
      fontFamily: font, display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '0 20px 48px'
    }}>
      {/* Header */}
      <div style={{
        paddingTop: '56px', paddingBottom: '32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
      }}>
        <img src="/assets/TBH_Simple_Logo.svg" alt="TBH" style={{ height: '44px', filter: 'invert(1)' }} />
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>send anything anonymously</p>
      </div>
 
      {/* Message card */}
      <form
        id="message-form"
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: '400px',
          background: 'rgba(30,30,30,0.85)',
          backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)',
          borderRadius: '32px', padding: '24px',
          boxShadow: '0 32px 100px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: '20px'
        }}
      >
        {/* Recipient row — profile pic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            overflow: 'hidden', border: `2.5px solid ${accentColor}`,
            background: '#333', flexShrink: 0,
          }}>
            {recipient?.pfp
              ? <img src={recipient.pfp} alt={recipient.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '800' }}>
                  {(recipient?.username ?? slug)?.[0]?.toUpperCase() ?? '?'}
                </div>
            }
          </div>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
            Message for <span style={{ color: accentColor }}>@{recipient?.username ?? slug}</span>
          </p>
        </div>
 
        {/* Suggestion phrase */}
        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.3)',
          minHeight: '38px', margin: 0,
          transition: 'opacity 0.4s ease',
          opacity: suggVisible ? 1 : 0
        }}>
          {SUGGESTIONS[suggIndex]}
        </p>
 
        {/* Text area */}
        <div style={{ position: 'relative' }}>
          <textarea
            required
            rows={5}
            maxLength={1000}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your message here..."
            style={{
              width: '100%', padding: '4px 4px 40px',
              fontSize: '18px', fontWeight: '600',
              color: '#FFF', background: 'transparent',
              border: 'none', outline: 'none', resize: 'none',
              lineHeight: '1.5', fontFamily: font, boxSizing: 'border-box'
            }}
          />
          <p style={{
            position: 'absolute', bottom: '0', left: '4px',
            fontSize: '12px',
            color: message.length > 900 ? accentColor : 'rgba(255,255,255,0.25)',
            margin: 0
          }}>
            {message.length}/1000
          </p>
        </div>
 
        {/* Image picker */}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        {imagePreview ? (
          <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '24px', overflow: 'hidden' }}>
            <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', border: 'none',
                color: 'white', cursor: 'pointer', fontSize: '14px'
              }}
            >✕</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              padding: '16px', borderRadius: '20px', border: 'none',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: font, transition: 'transform 0.12s ease'
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            📷 Add a photo
          </button>
        )}
 
        {error && <p style={{ color: '#ff6b6b', fontSize: '13px', margin: 0 }}>{error}</p>}
      </form>
 
      {/* Send button */}
      <div style={{ width: '100%', maxWidth: '400px', marginTop: '16px' }}>
        <button
          type="submit"
          form="message-form"
          disabled={isSubmitting || !message.trim()}
          style={{
            width: '100%', padding: '20px', borderRadius: '99px', border: 'none',
            background: message.trim() ? accentColor : 'rgba(255,255,255,0.1)',
            color: 'white', fontSize: '18px', fontWeight: '800',
            transition: 'transform 0.12s ease, background 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: message.trim() ? 'pointer' : 'default',
            fontFamily: font,
            boxShadow: message.trim() ? `0 8px 32px rgba(255,65,29,0.4)` : 'none',
          }}
          onMouseDown={e => message.trim() && (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => message.trim() && (e.currentTarget.style.transform = 'scale(0.96)')}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isSubmitting
            ? <div className="ios-arc" />
            : 'Send anonymously'
          }
        </button>
      </div>
 
      {/* Get own link CTA */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
          Want to receive anonymous messages too?
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '12px 28px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: 'white', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: font,
            transition: 'transform 0.12s ease'
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ✨ Get my own link
        </button>
      </div>
 
      <style>{`
        .ios-arc {
          width: 24px; height: 24px; border-radius: 50%;
          border: 3px solid transparent;
          border-top: 3px solid #FFF; border-right: 3px solid #FFF;
          animation: ios-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes ios-spin {
          0% { transform: rotate(0deg); opacity: 0.3; }
          50% { transform: rotate(180deg); opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0.3; }
        }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
    </main>
  )
}
/*
git add  .
 git commit -m "run "
git push -u origin main
*/ 