import { create } from 'zustand'

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') || 'light'
  }
  return 'light'
}

export const useStore = create((set, get) => ({
  // App state
  page: 'upload',      // 'upload' | 'loading' | 'dashboard'
  sessionId: null,
  results: null,

  // Loading progress
  progress: { pct: 0, message: 'Preparing data…', stage: '' },

  // Theme
  theme: getInitialTheme(),

  // Active dashboard section
  activeSection: 'cover',

  // Actions
  setPage: (page) => set({ page }),
  setSessionId: (id) => set({ sessionId: id }),
  setResults: (r) => set({ results: r }),
  setProgress: (p) => set({ progress: p }),
  setActiveSection: (s) => set({ activeSection: s }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme: next })
  },

  initTheme: () => {
    const t = get().theme
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
    }
  },
}))
