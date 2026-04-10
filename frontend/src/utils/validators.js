export function isValidPhone(raw) {
  const digits = String(raw).replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 12
}
export function normalizePhone(raw) { return String(raw).replace(/\D/g, '') }
export function isValidOtp(code) { return /^\d{4,6}$/.test(String(code).trim()) }