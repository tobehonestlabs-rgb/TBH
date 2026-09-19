// app/payment/status/page.tsx
import { notFound } from 'next/navigation'

type VerifyResult = {
  status: 'success' | 'failed' | 'error'
  message: string
  data?: any
}

async function verifyPayment(reference: string): Promise<VerifyResult> {
  const baseUrl = process.env.PAYSTACK_RETURN_URL || 'https://tbhonest.net'
  const res = await fetch(
    `${baseUrl}/api/paystack?reference=${encodeURIComponent(reference)}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    return {
      status: 'error',
      message: errorData?.error || 'Erreur de vérification du paiement.'
    }
  }

  const data = await res.json()
  
  return {
    status: data.status === 'success' ? 'success' : 'failed',
    message: data.status === 'success'
      ? '🎉 Paiement réussi ! TBH Pro est maintenant actif.'
      : data.message || 'Le paiement n\'a pas été validé.',
    data: data.data
  }
}

export default async function PaymentStatusPage({
  searchParams
}: {
  searchParams?: { reference?: string }
}) {
  const reference = searchParams?.reference
  if (!reference) {
    notFound()
  }

  const result = await verifyPayment(reference)

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center text-white max-w-md w-full">
        {result.status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold">Paiement réussi !</h1>
            <p className="text-white/80 mt-2">{result.message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/"
                className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition text-white"
              >
                Retour à l'accueil
              </a>
            </div>
          </>
        )}
        
        {result.status === 'failed' && (
          <>
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold">Paiement échoué</h1>
            <p className="text-white/60 mt-2">{result.message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/pro"
                className="px-6 py-3 bg-[#FF6B6B]/20 text-[#FF6B6B] rounded-full hover:bg-[#FF6B6B]/30 transition"
              >
                Réessayer
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition text-white"
              >
                Retour à l'accueil
              </a>
            </div>
          </>
        )}
        
        {result.status === 'error' && (
          <>
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold">Erreur de vérification</h1>
            <p className="text-white/60 mt-2">{result.message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/pro"
                className="px-6 py-3 bg-[#FF6B6B]/20 text-[#FF6B6B] rounded-full hover:bg-[#FF6B6B]/30 transition"
              >
                Réessayer
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition text-white"
              >
                Retour à l'accueil
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}