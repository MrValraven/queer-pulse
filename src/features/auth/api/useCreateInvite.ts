import { useMutation } from '@tanstack/react-query'
import { useDemoMode } from '../../../app/providers/DemoModeProvider'
import { INVITE_CODE, inviteFullUrlFor, inviteUrlFor } from '../invite.data'
import { createInvite, type CreateInvitePayload } from './invite.api'

/** A persisted invite, with the share-ready links derived from its code. */
export interface CreatedInvite {
  code: string
  /** Display link, e.g. "queerpulse.com/invite/QP-7F3K-2026". */
  url: string
  /** Full shareable URL with scheme. */
  fullUrl: string
  expiresAt: string
}

/**
 * Persist an invite via POST /invites and return its share links. Demo mode skips
 * the network and echoes the sample code, so the share flow works with no backend.
 */
export function useCreateInvite() {
  const { demoMode } = useDemoMode()
  return useMutation<CreatedInvite, Error, CreateInvitePayload>({
    mutationFn: async (payload) => {
      if (demoMode) {
        return {
          code: INVITE_CODE,
          url: inviteUrlFor(INVITE_CODE),
          fullUrl: inviteFullUrlFor(INVITE_CODE),
          expiresAt: '',
        }
      }
      const dto = await createInvite(payload)
      return {
        code: dto.code,
        url: inviteUrlFor(dto.code),
        fullUrl: inviteFullUrlFor(dto.code),
        expiresAt: dto.expiresAt,
      }
    },
  })
}
