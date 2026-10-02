import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params)
  const slug = resolved?.slug || 'anonyme'
  const title = `Envoie un message anonyme à @${slug} sur TBH`
  const description = `Écris un message anonyme à @${slug}. 100% anonyme, sans inscription requise.`
  const url = `https://tbhonest.net/send/${slug}`
  const iconUrl = 'https://tbhonest.net/icons/icon-512.png'

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
