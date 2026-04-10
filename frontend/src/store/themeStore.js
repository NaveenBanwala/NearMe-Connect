import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function applyTheme(theme) {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  const isDark =
    theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light' | 'dark' | 'system'

      init: () => {
        applyTheme(get().theme)
      },

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Re-apply theme on page load after rehydration
        if (state) applyTheme(state.theme)
      },
    }
  )
)