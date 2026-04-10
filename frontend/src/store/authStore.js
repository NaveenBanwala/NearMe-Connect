import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthToken } from '../services/api.js'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token:          null,
      user:           null,
      onboardingDone: false,
      phoneForOtp:    '',

      setOnboardingDone: (v) => set({ onboardingDone: Boolean(v) }),

      // Persisted so it survives the Vite HMR / page reload that used to
      // happen when the 401 interceptor called window.location.replace()
      setPhoneForOtp: (phone) => set({ phoneForOtp: phone }),

      setSession: ({ token, user }) => {
        setAuthToken(token || null)
        set({ token, user })
      },

      updateUser: (partial) =>
        set({ user: { ...get().user, ...partial } }),

      logout: () => {
        setAuthToken(null)
        set({ token: null, user: null, phoneForOtp: '' })
      },
    }),
    {
      name: 'nearme-auth',
      // phoneForOtp is now persisted — if the page ever reloads mid-OTP flow
      // the user lands back on the OTP screen with their number intact
      partialize: (s) => ({
        token:          s.token,
        user:           s.user,
        onboardingDone: s.onboardingDone,
        phoneForOtp:    s.phoneForOtp,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token)
      },
    }
  )
)