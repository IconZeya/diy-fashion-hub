import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import crypto from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const resend = new Resend(process.env.RESEND_API_KEY)

// Email sending function using Resend
async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const { error } = await resend.emails.send({
      from: 'DIY Fashion Hub <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password - DIY Fashion Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e11d48; margin: 0;">DIY Fashion Hub</h1>
          </div>

          <h2 style="color: #1f2937;">Reset Your Password</h2>

          <p>You requested to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #e11d48; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>

          <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            DIY Fashion Hub - Share and discover DIY fashion projects
          </p>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email sending error:', error)
    // Fallback: log to console for debugging
    console.log('=================================')
    console.log('PASSWORD RESET EMAIL (fallback)')
    console.log('To:', email)
    console.log('Reset Link:', resetLink)
    console.log('=================================')
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email in credentials table
    const { data: credential } = await supabaseAdmin
      .from('credentials')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .single()

    // Always return success (security - don't reveal if email exists)
    if (!credential) {
      // Log for debugging but still return success
      console.log('Password reset requested for non-existent email:', email)
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a reset link.',
      })
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Delete any existing tokens for this user
    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', credential.user_id)

    // Create new reset token
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: credential.user_id,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      console.error('Error creating reset token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to create reset token' },
        { status: 500 }
      )
    }

    // Send email with reset link
    const resetLink = `${APP_URL}/reset-password?token=${token}`
    await sendPasswordResetEmail(email, resetLink)

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a reset link.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
