'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, Trash2, Sparkles, ShoppingBag, Mail, DollarSign, ZoomIn } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageLightbox } from '@/components/shared'
import { useAuthStore } from '@/stores/auth-store'
import { supabaseDelete } from '@/lib/supabase/rest'
import type { DIYCreationWithUser } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface DIYListProps {
  pinId: string
  refreshKey?: number
}

export function DIYList({ pinId, refreshKey }: DIYListProps) {
  const { user } = useAuthStore()
  const [items, setItems] = useState<DIYCreationWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [contactModal, setContactModal] = useState<DIYCreationWithUser | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams()
      params.append('select', '*, user:profiles!recreations_user_id_fkey(*)')
      params.append('pin_id', `eq.${pinId}`)
      params.append('order', 'created_at.desc')

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/recreations?${params.toString()}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      )

      if (!response.ok) {
        console.error('Error fetching DIY items:', await response.text())
        return
      }

      const data = await response.json()
      setItems(data as DIYCreationWithUser[])
    } catch (error) {
      console.error('Error fetching DIY items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pinId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems, refreshKey])

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this?')) return

    setDeletingId(itemId)

    try {
      const { error } = await supabaseDelete('recreations', { id: itemId })

      if (error) {
        toast.error('Failed to delete')
        return
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success('Deleted successfully')
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Sparkles className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-2 font-medium">No DIY creations yet</p>
        <p className="text-sm text-muted-foreground">
          Be the first to share your handmade version!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border overflow-hidden">
            {/* Image */}
            <button
              type="button"
              onClick={() => setLightboxImage(item.image_url)}
              className="relative aspect-square w-full cursor-pointer group"
            >
              <Image
                src={item.image_url}
                alt={`DIY by ${item.user.username}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {/* Zoom indicator on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                  <ZoomIn className="size-5 text-white" />
                </div>
              </div>
              {item.is_for_sale && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                  <DollarSign className="size-3" />
                  {item.price?.toFixed(2)}
                </div>
              )}
            </button>

            <div className="p-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/profile/${item.user.username}`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={item.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {item.user.display_name?.[0] || item.user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium hover:underline">
                      {item.user.display_name || item.user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </Link>

                {user?.id === item.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                    )}
                  </Button>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Fabrics & Techniques */}
              <div className="flex flex-wrap gap-1">
                {item.fabrics?.slice(0, 3).map((fabric) => (
                  <span
                    key={fabric}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {fabric}
                  </span>
                ))}
                {item.techniques?.slice(0, 2).map((technique) => (
                  <span
                    key={technique}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                  >
                    {technique}
                  </span>
                ))}
              </div>

              {/* Buy Button */}
              {item.is_for_sale && (
                <Button
                  className="w-full"
                  onClick={() => setContactModal(item)}
                >
                  <ShoppingBag className="mr-2 size-4" />
                  Buy for ${item.price?.toFixed(2)}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Modal */}
      <Dialog open={!!contactModal} onOpenChange={() => setContactModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
          </DialogHeader>
          {contactModal && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={contactModal.user.avatar_url || undefined} />
                  <AvatarFallback>
                    {contactModal.user.display_name?.[0] || contactModal.user.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {contactModal.user.display_name || contactModal.user.username}
                  </p>
                  <p className="text-sm text-muted-foreground">@{contactModal.user.username}</p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-1">Price</p>
                <p className="text-2xl font-bold text-green-600">
                  ${contactModal.price?.toFixed(2)}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Contact Info</p>
                </div>
                <p className="text-sm break-all">{contactModal.contact_info}</p>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Reach out to the seller directly to purchase this item
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImage ? [lightboxImage] : []}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  )
}
