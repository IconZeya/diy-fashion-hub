import { cookies } from 'next/headers'
import { verifyJWT, AUTH_COOKIE_NAME, type JWTPayload } from './jwt'

export interface AuthUser {
  userId: string
  email: string
  username: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const payload = await verifyJWT(token)
  if (!payload) {
    return null
  }

  return {
    userId: payload.userId,
    email: payload.email,
    username: payload.username,
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
