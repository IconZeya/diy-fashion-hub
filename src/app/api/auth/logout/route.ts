import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth/jwt'

function createLogoutResponse(redirectUrl?: string) {
  const response = redirectUrl
    ? NextResponse.redirect(redirectUrl)
    : NextResponse.json({ success: true })

  // Clear the auth cookie
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  })

  return response
}

export async function POST() {
  return createLogoutResponse()
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  return createLogoutResponse(`${origin}/login`)
}
