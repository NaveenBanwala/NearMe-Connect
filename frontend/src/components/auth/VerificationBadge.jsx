export function VerificationBadge({ student }) {
  if (!student) {
    return (
      <span className="mt-2 inline-flex rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
        Local verified
      </span>
    )
  }
  return (
    <span className="mt-2 inline-flex rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-800">
      Student verified
    </span>
  )
}
