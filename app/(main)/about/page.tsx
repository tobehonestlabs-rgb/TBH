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
          <h1 className="text-4xl font-black tracking-tighter mb-8 italic">À Propos de TBH Studio</h1>
          
          <div className="space-y-8 text-[15px] leading-relaxed text-gray-600">
            <p>
              Bienvenue dans les coulisses de la tech de demain. Nous ne sommes pas juste une application de plus ; nous sommes une équipe de passionnés déterminés à redéfinir la manière dont les gens communiquent, s’expriment et se connectent en ligne. Découvrez qui nous sommes, d'où nous venons et pourquoi TBH va changer la donne.
            </p>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">Notre Histoire & Vision : Qu’est-ce que TBH Studio ?</h2>
              <p>
                TBHStudio LLC est l'entreprise technologique et créative derrière le développement du réseau social TBH. Aujourd’hui composée d’une équipe soudée de 6 personnes, notre structure est née d’une ambition claire et sans compromis : bousculer les géants de la tech, concurrencer Snapchat et surpasser les performances des applications anonymes existantes en imposant de nouveaux standards de transparence, de divertissement et de chiffres. Notre philosophie de travail est simple : Lancer vite, avec une qualité irréprochable, sans se faire freiner par la quête d’une perfection absolue. Nous croyons à l'efficacité, à l'innovation itérative et à l'écoute des besoins réels des utilisateurs.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">Le Constat : Au-delà du concept de NGL</h2>
              <p>
                En 2022, l'application italienne NGL (« Not Gonna Lie ») a prouvé l'immense désir mondial d'anonymat, générant des millions de dollars par mois en permettant aux utilisateurs de partager un lien pour recevoir des retours honnêtes de leurs cercles sociaux. Cependant, l'industrie a stagné. Entre le manque de créativité, les problèmes d'éthique et l'envoi de faux messages générés par des robots pour simuler l'activité, les utilisateurs se sont lassés d'un concept qui a cessé d'évoluer.
              </p>
              <p className="mt-4">
                C'est là que TBH (To Be Honest) fait son entrée. TBH n’est pas une parodie ou une simple copie de ce qui existe. C’est une évolution majeure pensée pour résoudre toutes les frustrations vécues par les utilisateurs. Nous reprenons le concept de la messagerie anonyme et nous le propulsons dans une toute nouvelle dimension narrative et interactive.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">L'Expérience TBH : Bien plus que du texte</h2>
              <p>
                Là où les autres applications se limitent à de simples messages textuels, TBH apporte une vague d'excitation et de mystère au quotidien. Notre application permet d'exprimer ce que l'on ressent vraiment à travers une suite d’outils multimédias uniques :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li><strong>Messages, Photos & Voix modifiées :</strong> Reçois des retours, des confessions, des images qui parlent plus que les mots, ou des messages vocaux anonymes à la voix transformée pour un effet mystère total.</li>
                <li><strong>Conversations Anonymes Continues :</strong> Ne reste pas bloqué face à un message. TBH donne le pouvoir unique d'engager la discussion en tête-à-tête avec ton expéditeur anonyme pour lever le voile ou approfondir l'échange.</li>
                <li><strong>Contenu Immersif (Reels TBH) :</strong> Pour maximiser l'engagement et le divertissement, la plateforme intègre un flux de Reels natifs, transformant l'application en un véritable carrefour communautaire et social.</li>
              </ul>
              <p className="mt-4">
                Notre but est de créer un espace de bien-être et d’adrénaline positive. Qu'il s'agisse de découvrir ses connaissances sous un jour nouveau, de se rapprocher de ses amis ou même de trouver l'amour à travers le jeu de l’anonymat, TBH réinvente la communication.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">Nos Objectifs à Court Terme</h2>
              <p>
                Nous voyons grand, et nous avançons avec des indicateurs de performance précis pour nos trois premiers mois post-lancement :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Fédérer une communauté de plus de 100 000 utilisateurs inscrits.</li>
                <li>Maintenir une base solide de 50 000 utilisateurs actifs.</li>
                <li>Convertir 10 000 utilisateurs premium grâce à notre offre d'accès exclusif à $1.99 par semaine.</li>
              </ul>
              <p className="mt-4">
                Notre première apparition organique sur Reddit a généré plus de 10 000 vues et attiré 100 utilisateurs en une seule semaine, confirmant l'attraction et l'intérêt immédiat du public pour notre concept.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-black mb-3 text-sm uppercase">L'Équipe & La Tech derrière l'App</h2>
              <p>
                Le succès de TBH repose sur une structure de rôles claire et agile :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li><strong>Le CEO :</strong> En charge du code, de la gestion d'équipe, de la vision stratégique et de la supervision globale de l'entreprise.</li>
                <li><strong>L'Équipe Dev :</strong> Les ingénieurs qui construisent, consolident et sécurisent les fondations techniques de l'application.</li>
                <li><strong>Le Directeur Marketing :</strong> Le cerveau derrière la croissance virale et la visibilité de la marque.</li>
                <li><strong>L'Ange Investisseur :</strong> Les partenaires stratégiques qui soutiennent financièrement l'expansion de notre écosystème.</li>
              </ul>
              <p className="mt-4">
                Côté technique, nous exploitons la puissance de Supabase pour nos bases de données, Figma pour le design d’interface, et nous combinons le développement manuel de pointe avec l'assistance IA pour accélérer les tâches répétitives sans jamais sacrifier la minutie des fonctionnalités complexes.
              </p>
              <p className="mt-4">
                Bien que l'application Android soit déjà sur pied et que le client iOS se profile à l'horizon, nous finalisons actuellement l'optimisation de nos systèmes de paiement locaux et internationaux ainsi que la délivrabilité de nos notifications web pour offrir l'expérience la plus fluide du marché.
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
            BACK TO TBH
          </Link>
        </div>
      </div>
    </main>
  )
}
