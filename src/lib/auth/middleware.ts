import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { AUTH_COOKIE_NAME } from './jwt'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_ISSUER = 'diy-fashion-hub'

interface JWTPayload {
  userId: string
  email: string
  username: string
}

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  let user: JWTPayload | null = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
      })
      user = {
        userId: payload.userId as string,
        email: payload.email as string,
        username: payload.username as string,
      }
    } catch {
      // Invalid or expired token - will be treated as unauthenticated
    }
  }

  // Protected routes - redirect to login if not authenticated
  // Note: Root path '/' shows landing page for non-authenticated users
  const protectedPaths = ['/create', '/profile/edit', '/settings']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Auth routes - redirect to home if already authenticated
  const authPaths = ['/login', '/register', '/forgot-password']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
