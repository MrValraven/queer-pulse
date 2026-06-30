import { useQuery } from '@tanstack/react-query'
import { useDemoMode } from '../../../app/providers/DemoModeProvider'
import { getMembers } from './members.api'
import { cardDtoToMemberCard } from './members.adapters'
import { MEMBERS, type MemberCard } from '../memberDirectoryFilter.data'

export interface MembersResult {
  items: MemberCard[]
  total: number
}

/** Directory source. Demo mode returns the page's own MemberCard registry
 *  (full filter fidelity); live mode calls GET /members and adapts each card. */
export function useMembers(params: { query?: string; tags?: string[]; page?: number } = {}) {
  const { demoMode } = useDemoMode()
  return useQuery<MembersResult>({
    queryKey: ['members', demoMode, params],
    queryFn: async () => {
      if (demoMode) return { items: MEMBERS, total: MEMBERS.length }
      const res = await getMembers(params)
      return { items: res.items.map(cardDtoToMemberCard), total: res.total }
    },
  })
}
