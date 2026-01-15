'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Check, Loader2, Plus, Search } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUIStore } from '@/stores/ui-store'
import { useBoards } from '@/hooks/use-boards'
import { cn } from '@/lib/utils'
import type { Board } from '@/types'

export function SaveToBoardModal() {
  const [searchQuery, setSearchQuery] = useState('')
  const [savingTo, setSavingTo] = useState<string | null>(null)
  const [savedBoards, setSavedBoards] = useState<Set<string>>(new Set())

  const {
    saveToBoardModal,
    closeSaveToBoardModal,
    openCreateBoardModal,
  } = useUIStore()
  const { boards, isLoading, fetchBoards, savePinToBoard } = useBoards()

  useEffect(() => {
    if (saveToBoardModal.isOpen) {
      fetchBoards()
      setSavedBoards(new Set())
    }
  }, [saveToBoardModal.isOpen, fetchBoards])

  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleSaveToBoard(board: Board) {
    if (!saveToBoardModal.pinId || savingTo) return

    setSavingTo(board.id)
    const success = await savePinToBoard(board.id, saveToBoardModal.pinId)
    setSavingTo(null)

    if (success) {
      setSavedBoards((prev) => new Set([...prev, board.id]))
    }
  }

  function handleCreateBoard() {
    openCreateBoardModal((newBoardId) => {
      // After creating, save to the new board
      if (saveToBoardModal.pinId) {
        savePinToBoard(newBoardId, saveToBoardModal.pinId)
        setSavedBoards((prev) => new Set([...prev, newBoardId]))
      }
      fetchBoards()
    })
  }

  return (
    <Dialog open={saveToBoardModal.isOpen} onOpenChange={closeSaveToBoardModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to board</DialogTitle>
          <DialogDescription>
            Choose a board to save this pin
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Boards List */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBoards.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No boards found' : 'No boards yet'}
            </p>
          ) : (
            filteredBoards.map((board) => {
              const isSaved = savedBoards.has(board.id)
              const isSaving = savingTo === board.id

              return (
                <button
                  key={board.id}
                  onClick={() => handleSaveToBoard(board)}
                  disabled={isSaving || isSaved}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
                    isSaved
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  )}
                >
                  {/* Board Cover */}
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {board.cover_url ? (
                      <Image
                        src={board.cover_url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg text-muted-foreground">
                        {board.title[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Board Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{board.title}</p>
                    {board.is_private && (
                      <p className="text-xs text-muted-foreground">Secret</p>
                    )}
                  </div>

                  {/* Status */}
                  {isSaving ? (
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  ) : isSaved ? (
                    <Check className="size-5 text-primary" />
                  ) : null}
                </button>
              )
            })
          )}
        </div>

        {/* Create New Board */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleCreateBoard}
        >
          <Plus className="size-4" />
          Create new board
        </Button>
      </DialogContent>
    </Dialog>
  )
}
