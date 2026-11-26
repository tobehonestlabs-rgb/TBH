import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const path = request.nextUrl.pathname
  const hasAuthCode = request.nextUrl.searchParams.has('code') || request.nextUrl.searchParams.has('error')

  // 1. Domain normalization: Redirect any tbhonest.net traffic to tbht.link
  if (host.includes('tbhonest.net')) {
    const targetPath = (hasAuthCode && (path === '/' || path === '')) ? '/auth/callback' : path
    const redirectUrl = new URL(targetPath, 'https://tbht.link')
    redirectUrl.search = request.nextUrl.search
    return NextResponse.redirect(redirectUrl, 307)
  }

  // 2. OAuth Callback recovery: If user lands on root with auth code or error, route to /auth/callback
  if (path === '/' && hasAuthCode) {
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.search = request.nextUrl.search
    return NextResponse.redirect(callbackUrl, 307)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // 1. Update the request cookies (so Server Components see them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // 2. Update the response cookies (so the browser saves them)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Logged in users redirect from / or /sign-up to /home
  if (user && (path === '/' || path === '/sign-up')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Logged out users redirect from /home and protected routes to /
  if (!user && path.startsWith('/home')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}