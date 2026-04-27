'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

const SUGGESTIONS = [
  "Tell them something you've never had the courage to say 👀",
  "Send a genuine compliment — it might make their whole day 🌟",
  "Share an honest opinion they probably don't expect 🤫",
  "Ask them something you've always been curious about 🎯",
  "Tell them what you truly think of them 💬",
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
  const fileRef = useRef<HTMLInputElement>(null)

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
    if (!message.trim()) return
    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      formData.append('slug', slug)
      const response = await fetch('/api/messages', { method: 'POST', body: formData })
      const data = await response.json().catch(() => ({ error: 'Invalid server response' }))
      if (!response.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setSuccess(true)
        setMessage('')
        setImagePreview(null)
      }
    } catch {
      setError('Check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

  if (!agreedToTerms) {
    return (
      <main style={{ minHeight: '100svh', background: 'linear-gradient(180deg, #0D0D0D 45%, #FF3CAC 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: font }}>
        <div style={{ width: '100%', maxWidth: '360px', background: 'rgba(35,35,35,0.8)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)', transform: popupVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)', opacity: popupVisible ? 1 : 0, transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease' }}>
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>Before you send</p>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[{ emoji: '🚫', text: 'Harassment & bullying' }, { emoji: '⚠️', text: 'Harmful or violent content' }, { emoji: '🔞', text: 'Inappropriate sexual content' }, { emoji: '👶', text: 'Content involving minors' }].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setAgreedToTerms(true)} style={{ width: '100%', padding: '18px', borderRadius: '99px', border: 'none', background: '#FF3CAC', color: 'white', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 32px rgba(255,60,172,0.45)', transition: 'transform 0.12s ease', fontFamily: font }} onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')} onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>I agree, continue →</button>
          </div>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main style={{ minHeight: '100svh', background: 'linear-gradient(180deg, #0D0D0D 45%, #FF3CAC 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: font, gap: '32px' }}>
        <img src="/assets/TBH_Title_Logo.svg" alt="TBH" style={{ height: '48px', filter: 'invert(1)' }} />
        <div style={{ width: '100%', maxWidth: '360px', background: 'rgba(35,35,35,0.8)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderRadius: '32px', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.5s cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <span style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</span>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 4px' }}>Sent!</p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>Your message is on its way to <span style={{ color: '#FF3CAC', fontWeight: '700' }}>@{slug}</span></p>
        </div>
        <button onClick={() => { setSuccess(false); setMessage('') }} style={{ width: '100%', maxWidth: '360px', padding: '20px', borderRadius: '99px', border: 'none', background: '#0D0D0D', color: 'white', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: font }}>Send another</button>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100svh', background: 'linear-gradient(180deg, #0D0D0D 45%, #FF3CAC 100%)', fontFamily: font, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 48px' }}>
      <div style={{ paddingTop: '56px', paddingBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <img src="/assets/TBH_Title_Logo.svg" alt="TBH" style={{ height: '44px', filter: 'invert(1)' }} />
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>anything anonymously</p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', background: 'rgba(30,30,30,0.8)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', borderRadius: '32px', padding: '24px', boxShadow: '0 32px 100px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FF3CAC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤫</div>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Message for <span style={{ color: '#FF3CAC' }}>@{slug}</span></p>
        </div>

        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0, minHeight: '38px', transition: 'opacity 0.4s ease', opacity: suggVisible ? 1 : 0 }}>{SUGGESTIONS[suggIndex]}</p>

        <div style={{ position: 'relative' }}>
          <textarea
            name="message"
            required
            rows={5}
            maxLength={1000}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Écris ton message ici..."
            style={{ width: '100%', padding: '4px 4px 40px', fontSize: '18px', fontWeight: '600', color: '#FFF', background: 'transparent', border: 'none', outline: 'none', resize: 'none', lineHeight: '1.5', fontFamily: font }}
          />
          <p style={{ position: 'absolute', bottom: '0', left: '4px', fontSize: '12px', color: message.length > 900 ? '#FF3CAC' : 'rgba(255,255,255,0.25)' }}>{message.length}/1000</p>
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        {imagePreview ? (
          <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '24px', overflow: 'hidden' }}>
            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => setImagePreview(null)} style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white' }}>✕</button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} style={{ padding: '16px', borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>📷 Add a photo</button>
        )}
      </form>

      <div style={{ width: '100%', maxWidth: '400px', marginTop: '24px' }}>
        <button
          onClick={() => document.querySelector('form')?.requestSubmit()}
          disabled={isSubmitting || !message.trim()}
          style={{ width: '100%', padding: '20px', borderRadius: '99px', border: 'none', background: message.trim() ? '#0D0D0D' : 'rgba(0,0,0,0.5)', color: 'white', fontSize: '18px', fontWeight: '800', transition: 'transform 0.12s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
          onMouseDown={e => message.trim() && (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isSubmitting ? (
            <svg viewBox="0 0 50 50" style={{ width: '24px', height: '24px', animation: 'bouncy-spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite' }}>
              <path d="M25 5A20 20 0 0 1 45 25" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
            </svg>
          ) : 'Envoyer!'}
        </button>
      </div>

      <style>{`
        @keyframes bouncy-spin { 
          0% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
        * { -webkit-tap-highlight-color: transparent; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </main>
  )
}