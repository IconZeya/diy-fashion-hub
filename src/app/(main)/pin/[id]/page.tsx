'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'

import { PinDetail, DIYForm, DIYList } from '@/components/pins'
import { CommentSection } from '@/components/comments'
import { PinDetailSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Pin } from 'lucide-react'
import { usePin, usePins } from '@/hooks/use-pins'

export default function PinPage() {
  const params = useParams()
  const router = useRouter()
  const pinId = params.id as string
  const [recreationsKey, setRecreationsKey] = useState(0)

  const { pin, isLoading, error, fetchPin } = usePin(pinId)
  const { likePin, unlikePin, deletePin } = usePins()

  useEffect(() => {
    fetchPin()
  }, [fetchPin])

  const handleLike = async () => {
    if (!pin) return

    if (pin.isLiked) {
      await unlikePin(pinId)
    } else {
      await likePin(pinId)
    }
    fetchPin()
  }

  const handleDelete = async () => {
    if (!pin) return

    if (confirm('Are you sure you want to delete this pin?')) {
      const success = await deletePin(pinId)
      if (success) {
        router.push('/')
      }
    }
  }

  if (isLoading) {
    return <PinDetailSkeleton />
  }

  if (!pin || error) {
    return (
      <EmptyState
        icon={Pin}
        title="Pin not found"
        description={error || "This pin may have been deleted or doesn't exist"}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <PinDetail pin={pin} onLike={handleLike} onDelete={handleDelete} />

      {/* Comments Section */}
      <section className="border-t pt-8">
        <CommentSection pinId={pinId} />
      </section>

      {/* DIY Marketplace Section */}
      <section className="border-t pt-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="size-5 text-primary" />
          <h2 className="text-xl font-bold">DIY Marketplace</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Share your handmade creation inspired by this design or sell it to fashion lovers!
        </p>

        <div className="space-y-6">
          <DIYForm
            pinId={pinId}
            onSuccess={() => setRecreationsKey((k) => k + 1)}
          />
          <DIYList pinId={pinId} refreshKey={recreationsKey} />
        </div>
      </section>
    </div>
  )
}
