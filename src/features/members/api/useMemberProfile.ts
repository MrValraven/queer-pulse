import { useQuery } from '@tanstack/react-query'
import { useDemoMode } from '../../../app/providers/DemoModeProvider'
import { getProfile } from './members.api'
import { profileToMember } from './members.adapters'
import { MEMBERS, type Member } from '../data/members'

export interface MemberProfileResult {
  member: Member | null
  limited: boolean
}

/** Another member's profile. Demo returns the mock registry entry; live calls
 *  GET /profiles/:slug and reports the limited-card flag for visibility gating. */
export function useMemberProfile(slug: string | undefined) {
  const { demoMode } = useDemoMode()
  return useQuery<MemberProfileResult>({
    queryKey: ['profile', demoMode, slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return { member: null, limited: false }
      if (demoMode) return { member: MEMBERS[slug] ?? null, limited: false }
      const dto = await getProfile(slug)
      return { member: profileToMember(dto), limited: dto.limited }
    },
  })
}
