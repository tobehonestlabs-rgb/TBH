'use client'

import { FormEvent, useState } from 'react'
import { useParams } from 'next/navigation'

export default function SendMessagePage() {
  const { slug } = useParams<{ slug: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(null)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('slug', slug)

    const response = await fetch('/api/messages', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
    } else {
      setSuccess('Message sent anonymously! Thanks for your feedback.')
      e.currentTarget.reset()
    }

    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-white text-black px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Send an Anonymous Message</h1>
          <p className="text-black/70">
            Share your thoughts with <span className="font-semibold">@{slug}</span>. You can add an optional photo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6" encType="multipart/form-data">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="message">
              Your message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              maxLength={1000}
              placeholder="Write something kind, constructive, or fun..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
            />
            <p className="text-xs text-black/50 mt-1">Max 1000 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="image">
              Optional photo
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="w-full text-sm text-black/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/80"
            />
            <p className="text-xs text-black/50 mt-1">Images are optional. Max size depends on your Supabase bucket limits.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded-full py-3 text-lg font-semibold hover:bg-black/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send anonymously'}
          </button>

          {success && <p className="text-green-600 text-sm">{success}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>

        <p className="text-xs text-black/40 text-center mt-6">
          By sending, you agree to keep it respectful. Images may be reviewed.
        </p>
      </div>
    </main>
  ) 
}


