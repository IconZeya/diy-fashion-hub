import { create } from 'zustand'

interface NotificationState {
  unreadCount: number
  isDropdownOpen: boolean
  setUnreadCount: (count: number) => void
  decrementUnreadCount: (by?: number) => void
  clearUnreadCount: () => void
  setDropdownOpen: (open: boolean) => void
  toggleDropdown: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  isDropdownOpen: false,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnreadCount: (by = 1) => set((state) => ({
    unreadCount: Math.max(0, state.unreadCount - by)
  })),
  clearUnreadCount: () => set({ unreadCount: 0 }),
  setDropdownOpen: (open) => set({ isDropdownOpen: open }),
  toggleDropdown: () => set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),
}))
