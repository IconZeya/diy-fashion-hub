import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyPassword } from '@/lib/auth/password'
import { signJWT, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Fetch user by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user has a password (might be OAuth-only user)
    if (!profile.password_hash) {
      return NextResponse.json(
        { error: 'Please sign in with Google' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, profile.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Sign JWT
    const token = await signJWT({
      userId: profile.id,
      email: profile.email,
      username: profile.username,
    })

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
      },
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        cover_url: profile.cover_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
