import { useAuthStore } from '../store/authStore.js'

export function useVerification() {
  const user           = useAuthStore((s) => s.user)
  const phoneVerified  = user?.phone_verified  ?? Boolean(user?.phone)
  const studentVerified= user?.student_verified ?? user?.verification_status === 'approved'
  return {
    phoneVerified,
    studentVerified,
    isStudent:    studentVerified,
    isPhoneVerified: phoneVerified,
    verifyStatus: user?.verification_status || 'none',
    collegeName:  user?.college_name || null,
  }
}