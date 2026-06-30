import { apiGet, apiPost, ensureCsrf } from '../../../shared/api/client'
import { API_BASE_URL } from '../../../shared/api/config'

export type MemberStatus = 'pending' | 'active' | 'suspended'
export type MemberRole = 'member' | 'moderator' | 'admin'

export interface AuthUser {
  id: string
  email: string
  status: MemberStatus
  role: MemberRole
  profile: {
    slug: string
    firstName: string
    lastName: string
    pronouns?: string
    avatarUrl?: string | null
  }
}

export const fetchMe = () => apiGet<AuthUser>('/auth/me')
export const postLogout = () => apiPost<{ ok: true }>('/auth/logout')
export const postRefresh = () => apiPost<{ ok: true }>('/auth/refresh')
export const bootstrapCsrf = ensureCsrf

/** Full-page navigation to the Google consent screen (not a fetch). */
export function redirectToGoogle(): void {
  window.location.href = `${API_BASE_URL}/auth/google`
}
