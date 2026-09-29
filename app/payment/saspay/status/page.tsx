export default function SasPayStatusPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center text-white max-w-md w-full">
        <h1 className="text-2xl font-bold">Paiement envoyé</h1>
        <p className="text-white/70 mt-3">SasPay confirme le paiement. L’activation de TBH Pro se fera dès réception de la confirmation sécurisée.</p>
        <a href="/" className="inline-block mt-6 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition">
          Retour à l’accueil
        </a>
      </div>
    </div>
  )
}