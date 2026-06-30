import { apiGet, apiPost, apiDelete } from '../../../shared/api/client'

export type Visibility = 'open' | 'network' | 'private'

export interface MemberCardDTO {
  slug: string
  firstName: string
  lastName: string
  pronouns?: string
  tagline?: string
  avatarUrl?: string | null
  tags?: string[]
  vouchCount: number
  visibility: Visibility
}

export interface MembersPage {
  items: MemberCardDTO[]
  total: number
  page: number
  pageSize: number
}

export interface SocialLinkDTO {
  platform: string
  urlOrHandle: string
}
export interface WorkItemDTO {
  category: string
  title: string
  year: string
  imageUrl?: string
}

export interface ProfileDTO extends MemberCardDTO {
  bio?: string
  location?: string
  openTo?: string[]
  socials?: SocialLinkDTO[]
  work?: WorkItemDTO[]
  /** True when the viewer only gets the limited card (network/private). */
  limited: boolean
}

export interface VoucherDTO {
  slug: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
  note?: string
  createdAt: string
}
export interface VouchersResponse {
  count: number
  vouchers: VoucherDTO[]
}

export function getMembers(params: { query?: string; tags?: string[]; page?: number } = {}) {
  const q = new URLSearchParams()
  if (params.query) q.set('query', params.query)
  if (params.tags?.length) q.set('tags', params.tags.join(','))
  if (params.page) q.set('page', String(params.page))
  const qs = q.toString()
  return apiGet<MembersPage>(`/members${qs ? `?${qs}` : ''}`)
}

export const getProfile = (slug: string) => apiGet<ProfileDTO>(`/profiles/${slug}`)

export const vouchFor = (slug: string, note?: string) =>
  apiPost<{ vouchCount: number }>(`/members/${slug}/vouch`, note ? { note } : {})

export const unvouch = (slug: string) => apiDelete<{ ok: true }>(`/members/${slug}/vouch`)

export const getVouchers = (slug: string) => apiGet<VouchersResponse>(`/members/${slug}/vouchers`)

/** Vouches the current user has given. Shape assumed `{ slug }[]`; adjust if the API differs. */
export const getGivenVouches = () => apiGet<{ slug: string }[]>('/me/vouches/given')
