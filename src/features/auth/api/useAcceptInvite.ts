import { useMutation } from '@tanstack/react-query'
import { useDemoMode } from '../../../app/providers/DemoModeProvider'
import { acceptInvite, type AcceptInviteResult } from './invite.api'

/**
 * Redeem an invite via POST /invites/:code/accept after the recipient signs up,
 * promoting them to an active member. Demo mode skips the network and resolves
 * ok, so the join journey completes with no backend.
 */
export function useAcceptInvite() {
  const { demoMode } = useDemoMode()
  return useMutation<AcceptInviteResult, Error, string>({
    mutationFn: async (code) => {
      if (demoMode) return { ok: true }
      return acceptInvite(code)
    },
  })
}
