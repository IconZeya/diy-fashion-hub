import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Find the reset token
    const { data: resetToken, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update the password in credentials table
    const { error: updateError } = await supabaseAdmin
      .from('credentials')
      .update({ password_hash: passwordHash })
      .eq('user_id', resetToken.user_id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Mark token as used
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id)

    return NextResponse.json({
      message: 'Password has been reset successfully. You can now log in.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Validate token (for checking if link is still valid)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ valid: false, error: 'No token provided' })
  }

  const { data: resetToken } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('expires_at, used')
    .eq('token', token)
    .single()

  if (!resetToken) {
    return NextResponse.json({ valid: false, error: 'Invalid token' })
  }

  if (resetToken.used) {
    return NextResponse.json({ valid: false, error: 'Token already used' })
  }

  if (new Date(resetToken.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Token expired' })
  }

  return NextResponse.json({ valid: true })
}
