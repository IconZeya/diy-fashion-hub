import { SignJWT, jwtVerify } from 'jose'

export interface JWTPayload {
  userId: string
  email: string
  username: string
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_EXPIRY = '7d'
const JWT_ISSUER = 'diy-fashion-hub'

export async function signJWT(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)

  return token
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    })

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      username: payload.username as string,
    }
  } catch {
    return null
  }
}

export const AUTH_COOKIE_NAME = 'auth_token'

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}
