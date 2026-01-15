import { STORAGE_BUCKETS } from '@/lib/constants'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

type StorageBucket = keyof typeof STORAGE_BUCKETS

export async function uploadImage(
  file: File,
  bucket: StorageBucket
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'Upload failed' }
    }

    return { url: result.url, path: result.path }
  } catch (err) {
    console.error('Upload error:', err)
    return { error: 'Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error') }
  }
}

export async function deleteImage(
  path: string,
  bucket: StorageBucket
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path, bucket }),
    })

    if (!response.ok) {
      const result = await response.json()
      return { success: false, error: result.error }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export function getPublicUrl(path: string, bucket: StorageBucket): string {
  const bucketName = STORAGE_BUCKETS[bucket]
  return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${path}`
}
