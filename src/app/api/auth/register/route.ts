import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/auth/password'
import { signJWT, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, displayName } = await request.json()

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()
    const normalizedUsername = username.toLowerCase()

    // Check if email is already taken
    const { data: existingEmail } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      )
    }

    // Check if username is already taken
    const { data: existingUsername } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', normalizedUsername)
      .single()

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate UUID for new user
    const userId = crypto.randomUUID()

    // Create profile
    const { data: profile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: normalizedEmail,
        username: normalizedUsername,
        display_name: displayName || username,
        password_hash: passwordHash,
        auth_provider: 'email',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Profile insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Sign JWT
    const token = await signJWT({
      userId: profile.id,
      email: profile.email,
      username: profile.username,
    })

    // Create response
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
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
