'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import ChatPage from '@/app/components/ChatPage'
import { useTranslation } from '@/lib/i18n'
import { UserProfile } from '@/types'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tbhonest.app'

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialConvId = searchParams.get('c')
  const { t, locale } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [targetConvId, setTargetConvId] = useState<string | null>(initialConvId)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      let session = (await supabaseClient.auth.getSession()).data.session

      if (!session) {
        session = await new Promise<any>((resolve) => {
          const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_, s) => {
            if (s) {
              subscription.unsubscribe()
              resolve(s)
            }
          })
          setTimeout(() => {
            subscription.unsubscribe()
            resolve(null)
          }, 3000)
        })
      }

      if (!session) {
        router.replace('/')
        return
      }

      const { data: userProfile } = await supabaseClient
        .from('users_table')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      setProfile(userProfile)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-9 h-9 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-white/50">{locale === 'fr' ? 'Chargement...' : 'Loading chats...'}</p>
      </main>
    )
  }

  const isGhost = profile?.is_profile_complete === false || !profile?.username

  return (
    <div className="min-h-screen bg-neutral-950 flex justify-center">
      <main
        id="app-shell"
        className="w-full max-w-md h-[100dvh] bg-white flex flex-col relative overflow-hidden shadow-2xl"
      >
        {/* Top Header */}
        <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-black/5 bg-white z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/assets/TBH_Title_Logo.svg"
              alt="TBH"
              className="h-7 w-auto object-contain cursor-pointer"
              onClick={() => {
                if (!isGhost) router.push('/home')
              }}
            />
            {isGhost ? (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 text-black/60">
                Web Chat
              </span>
            ) : (
              <button
                onClick={() => router.push('/home')}
                className="text-[12px] font-semibold text-neutral-500 hover:text-black transition-colors"
              >
                ← {locale === 'fr' ? 'Accueil' : 'Home'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Play store CTA in header */}
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[12px] font-bold active:scale-95 transition-transform shadow-sm"
            >
              <span>📱</span>
              <span>{locale === 'fr' ? "L'app TBH" : 'Get App'}</span>
            </a>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              title={locale === 'fr' ? 'Déconnexion' : 'Sign out'}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 active:scale-95 transition-transform"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </header>

        {/* The Hook: Prominent Play Store Banner */}
        {showBanner && (
          <div className="relative mx-4 mt-3 mb-1 p-3.5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-md flex-shrink-0">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white text-xs"
              title="Fermer"
            >
              ×
            </button>
            <div className="flex items-start gap-3 pr-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                ✨
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-tight">
                  {locale === 'fr' ? "Passe sur l'application TBH !" : 'Get the full TBH experience!'}
                </p>
                <p className="text-[11px] text-white/70 leading-normal mt-0.5">
                  {locale === 'fr'
                    ? 'Débloque ton pseudo, ta photo de profil et reçois des notifications instantanées.'
                    : 'Set your username, profile picture, and get instant reply notifications.'}
                </p>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-white text-black text-[11px] font-extrabold rounded-full active:scale-95 transition-transform shadow-sm"
                >
                  <span>Google Play</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Chat List & Conversation View */}
        <div className="flex-1 min-h-0 overflow-y-auto relative">
          <ChatPage
            profile={profile}
            initialConversationId={targetConvId}
            onClearInitialConversation={() => setTargetConvId(null)}
          />
        </div>
      </main>
    </div>
  )
}

export default function ChatViewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
          <div className="w-9 h-9 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
