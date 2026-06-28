import type { LivingCommunity } from '../communities/community.model'

export interface CommunitySettings {
  name: string
  description: string
  membershipMode: 'open' | 'request' | 'invite'
  rules: string
}

export function defaultSettings(living: LivingCommunity): CommunitySettings {
  const tierToMode = (tier: LivingCommunity['accessTier']): CommunitySettings['membershipMode'] => {
    if (tier === 'public') return 'open'
    if (tier === 'request') return 'request'
    return 'invite' // 'invite' | 'private' → 'invite'
  }
  const titleCase = (slug: string): string =>
    slug
      .split('-')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
  return {
    name: titleCase(living.slug),
    description: '',
    membershipMode: tierToMode(living.accessTier),
    rules: living.rules.join('\n'),
  }
}
