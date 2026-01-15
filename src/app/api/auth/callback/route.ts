import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { exchangeCodeForTokens, getGoogleUserProfile } from '@/lib/auth/google'
import { signJWT, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth/jwt'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    )
  }

  if (!code) {
    console.error('No code received in callback')
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  // Verify state for CSRF protection
  const cookieStore = await cookies()
  const storedState = cookieStore.get('oauth_state')?.value

  if (state && storedState && state !== storedState) {
    console.error('State mismatch - possible CSRF attack')
    return NextResponse.redirect(`${origin}/login?error=invalid_state`)
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Get Google user profile
    const googleUser = await getGoogleUserProfile(tokens.access_token)

    console.log('Google user:', googleUser)

    // Try to find existing user by google_id
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('google_id', googleUser.id)
      .single()

    if (!profile) {
      // Try to find by email (user might have registered with email first)
      const { data: emailProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', googleUser.email.toLowerCase())
        .single()

      if (emailProfile) {
        // Link Google account to existing profile
        const { data: updatedProfile } = await supabaseAdmin
          .from('profiles')
          .update({
            google_id: googleUser.id,
            avatar_url: emailProfile.avatar_url || googleUser.picture,
          })
          .eq('id', emailProfile.id)
          .select()
          .single()

        profile = updatedProfile
      } else {
        // Create new profile for Google user
        const username =
          googleUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_') ||
          `user_${googleUser.id.slice(0, 8)}`

        // Make username unique
        let finalUsername = username
        let counter = 1
        while (true) {
          const { data: existing } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('username', finalUsername)
            .single()

          if (!existing) break
          finalUsername = `${username}${counter}`
          counter++
        }

        const userId = crypto.randomUUID()

        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            email: googleUser.email.toLowerCase(),
            username: finalUsername,
            display_name: googleUser.name,
            avatar_url: googleUser.picture,
            google_id: googleUser.id,
            auth_provider: 'google',
          })
          .select()
          .single()

        if (insertError) {
          console.error('Profile insert error:', insertError)
          return NextResponse.redirect(`${origin}/login?error=account_creation_failed`)
        }

        profile = newProfile
      }
    }

    // Sign JWT
    const token = await signJWT({
      userId: profile.id,
      email: profile.email,
      username: profile.username,
    })

    // Create redirect response
    const response = NextResponse.redirect(`${origin}/`)

    // Set auth cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)

    // Clear oauth state cookie
    response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' })

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }
}
