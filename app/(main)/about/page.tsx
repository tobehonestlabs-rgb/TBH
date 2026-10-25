'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="legal-scroll h-full overflow-y-auto bg-white text-gray-900 px-6 py-12 flex flex-col items-center">
      {/* Logo */}
      <div className="mb-12">
        <Link href="/">
          <Image
            src="/assets/TBH_Title_Logo.svg"
            alt="TBH Logo"
            width={100}
            height={40}
            className="cursor-pointer"
          />
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-10" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
        
        <section>
          <h1 className="text-4xl font-black tracking-tighter mb-8 italic">À Propos de TBH</h1>
          
          <div className="space-y-8 text-[15px] leading-relaxed text-gray-600">
            <p>
              Bienvenue chez TBH. Nous sommes là pour redéfinir la manière dont les gens communiquent, s’expriment et se connectent en ligne.
            </p>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">Notre Histoire</h2>
              <p>
                TBH a été créé en 2026 avec une mission claire : bousculer le statu quo des réseaux sociaux anonymes et offrir une expérience digne de ce nom aux utilisateurs.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">Nos Valeurs</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Honnêteté</h3>
                  <p>Notre nom, To Be Honest, résume notre engagement : nous croyons en la puissance des vérités vraies, pas des faux messages de robots.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Transparence</h3>
                  <p>Nous ne faisons pas de mystères sur ce que nous faisons et comment nous le faisons. Nos utilisateurs méritent de savoir ce qui se passe.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Divertissement</h3>
                  <p>Une application, c’est d’abord fun ! Notre plateforme est conçue pour être excitante et agréable à utiliser au quotidien.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Sécurité</h3>
                  <p>La sécurité de nos utilisateurs est notre priorité. Nous mettons tout en œuvre pour garantir une expérience sûre et respectueuse.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">L'Expérience TBH : Bien plus que du texte</h2>
              <p>
                Là où les autres applications se limitent à de simples messages textuels, TBH apporte une vague d'excitation et de mystère au quotidien :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li><strong>Messages, Photos & Voix modifiées :</strong> Reçois des retours, des confessions, des images qui parlent plus que les mots, ou des messages vocaux anonymes à la voix transformée pour un effet mystère total.</li>
                <li><strong>Conversations Anonymes Continues :</strong> Ne reste pas bloqué face à un message. Engage la discussion en tête-à-tête avec ton expéditeur anonyme pour lever le voile ou approfondir l'échange.</li>
                <li><strong>Contenu Immersif :</strong> Pour maximiser l'engagement et le divertissement, la plateforme intègre un flux de Reels natifs, transformant l'application en un véritable carrefour communautaire et social.</li>
              </ul>
              <p className="mt-4">
                Notre but est de créer un espace de bien-être et d’adrénaline positive. Qu'il s'agisse de découvrir ses connaissances sous un jour nouveau, de se rapprocher de ses amis ou même de trouver l'amour à travers le jeu de l’anonymat, TBH réinvente la communication.
              </p>
            </div>

            <p className="text-lg text-gray-800 font-medium italic">
              Rejoignez l'aventure. TBH est conçu pour ceux qui veulent dire la vérité, explorer le mystère et communiquer sans barrières. L'honnêteté n'a jamais été aussi excitante.
            </p>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-12 pb-24">
          <Link href="/" className="inline-block text-sm font-black text-white bg-black px-10 py-4 rounded-2xl active:scale-95 transition-transform shadow-lg">
            RETOUR À TBH
          </Link>
        </div>
      </div>
    </main>
  )
}
