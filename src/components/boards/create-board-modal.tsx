'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUIStore } from '@/stores/ui-store'
import { useBoards } from '@/hooks/use-boards'
import { boardSchema, type BoardInput } from '@/lib/validations/board'

export function CreateBoardModal() {
  const [isLoading, setIsLoading] = useState(false)
  const { createBoardModal, closeCreateBoardModal } = useUIStore()
  const { createBoard } = useBoards()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoardInput>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      isPrivate: false,
    },
  })

  async function onSubmit(data: BoardInput) {
    setIsLoading(true)

    const board = await createBoard({
      title: data.title,
      description: data.description,
      isPrivate: data.isPrivate,
    })

    setIsLoading(false)

    if (board) {
      reset()
      createBoardModal.onSuccess?.(board.id)
      closeCreateBoardModal()
    }
  }

  function handleClose() {
    reset()
    closeCreateBoardModal()
  }

  return (
    <Dialog open={createBoardModal.isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create board</DialogTitle>
          <DialogDescription>
            Organize your saved pins into collections
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Name</Label>
            <Input
              id="title"
              placeholder='Like "DIY Summer Projects" or "Upcycling Ideas"'
              disabled={isLoading}
              {...register('title')}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              placeholder="What's this board about?"
              rows={2}
              disabled={isLoading}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register('description')}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              className="size-4 rounded border-input"
              {...register('isPrivate')}
            />
            <Label htmlFor="isPrivate" className="text-sm font-normal">
              Keep this board secret
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
