import { create } from 'zustand'

interface SaveToBoardModalState {
  isOpen: boolean
  pinId: string | null
}

interface CreateBoardModalState {
  isOpen: boolean
  onSuccess?: (boardId: string) => void
}

interface UIState {
  // Save to board modal
  saveToBoardModal: SaveToBoardModalState
  openSaveToBoardModal: (pinId: string) => void
  closeSaveToBoardModal: () => void

  // Create board modal
  createBoardModal: CreateBoardModalState
  openCreateBoardModal: (onSuccess?: (boardId: string) => void) => void
  closeCreateBoardModal: () => void

  // Mobile menu
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (isOpen: boolean) => void
  toggleMobileMenu: () => void

  // Search
  isSearchOpen: boolean
  setSearchOpen: (isOpen: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Save to board modal
  saveToBoardModal: { isOpen: false, pinId: null },
  openSaveToBoardModal: (pinId) =>
    set({ saveToBoardModal: { isOpen: true, pinId } }),
  closeSaveToBoardModal: () =>
    set({ saveToBoardModal: { isOpen: false, pinId: null } }),

  // Create board modal
  createBoardModal: { isOpen: false },
  openCreateBoardModal: (onSuccess) =>
    set({ createBoardModal: { isOpen: true, onSuccess } }),
  closeCreateBoardModal: () =>
    set({ createBoardModal: { isOpen: false, onSuccess: undefined } }),

  // Mobile menu
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Search
  isSearchOpen: false,
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
}))
