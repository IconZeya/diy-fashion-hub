import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'
import { STORAGE_BUCKETS, IMAGE_UPLOAD_CONFIG } from '@/lib/constants'

type StorageBucket = keyof typeof STORAGE_BUCKETS

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as keyof typeof STORAGE_BUCKETS

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!bucket || !STORAGE_BUCKETS[bucket]) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    // Validate file type
    if (!IMAGE_UPLOAD_CONFIG.acceptedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Accepted: JPG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > IMAGE_UPLOAD_CONFIG.maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Max ${IMAGE_UPLOAD_CONFIG.maxSizeMB}MB` },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `${authUser.userId}/${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS[bucket])
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { path, bucket } = await request.json() as { path: string; bucket: StorageBucket }

    if (!path || !bucket || !STORAGE_BUCKETS[bucket]) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Ensure user can only delete their own files
    if (!path.startsWith(`${authUser.userId}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS[bucket])
      .remove([path])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
