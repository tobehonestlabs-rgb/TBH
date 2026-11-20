import type { Metadata } from 'next'
import { headers } from 'next/headers'

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params)
  const slug = resolved?.slug || 'anonyme'

  let isFr = false
  let isEs = false
  try {
    const headerList = await headers()
    const acceptLang = headerList.get('accept-language')?.toLowerCase() || ''
    isFr = acceptLang.startsWith('fr') || acceptLang.includes(',fr')
    isEs = acceptLang.startsWith('es') || acceptLang.includes(',es')
  } catch {}

  const title = isFr
    ? `Envoie un message anonyme à @${slug} sur TBH`
    : isEs
    ? `Envía un mensaje anónimo a @${slug} en TBH`
    : `Send an anonymous message to @${slug} on TBH`

  const description = isFr
    ? `Écris un message anonyme à @${slug}. 100% anonyme, sans inscription requise.`
    : isEs
    ? `Escribe un mensaje anónimo a @${slug}. 100% anónimo, sin necesidad de registro.`
    : `Send an anonymous message to @${slug}. 100% anonymous, no signup required.`
  const url = `https://tbht.link/send/${slug}`
  const iconUrl = 'https://tbht.link/icons/icon-512.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'TBH',
      images: [
        {
          url: iconUrl,
          width: 512,
          height: 512,
          alt: `TBH @${slug}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [iconUrl],
    },
    other: {
      'snapchat:sticker': iconUrl,
      'snapchat:sticker:width': '512',
      'snapchat:sticker:height': '512',
    },
  }
}

export default function SendLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
