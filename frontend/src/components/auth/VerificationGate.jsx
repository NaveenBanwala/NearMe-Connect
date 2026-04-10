import { Button } from '../shared/Button.jsx'

export function VerificationGate({ onContinuePhone, title = 'Verification required' }) {
  return (
    <div className="space-y-4 py-2">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">
        Phone verification is required to view activity inside a block. Student ID unlocks campus features.
      </p>
      <Button type="button" variant="primary" className="w-full" onClick={onContinuePhone}>
        Continue with phone
      </Button>
    </div>
  )
}
