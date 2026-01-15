import { NextResponse } from 'next/server'
import { getGoogleAuthURL } from '@/lib/auth/google'

export async function GET() {
  // Generate CSRF state token
  const state = crypto.randomUUID()

  // Get Google OAuth authorization URL
  const authURL = getGoogleAuthURL(state)

  // Create redirect response
  const response = NextResponse.redirect(authURL)

  // Store state in cookie for CSRF protection
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  })

  return response
}
