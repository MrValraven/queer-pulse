import { FiFlag, FiUserCheck, FiMessageSquare, FiAlertCircle, FiUserPlus, FiCheckCircle, FiUsers, type IconType } from 'react-icons/fi'
import { routes, adminCommunityMod } from '../../app/routeMap'

export interface StatCard {
  label: string
  value: string
  sub: string
  trend?: 'up' | 'down' | 'flat'
}

export const METRICS: StatCard[] = [
  { label: 'Active members', value: '1,847', sub: '+18% vs last month', trend: 'up' },
  { label: 'Open reports', value: '7', sub: 'Oldest: 14h ago', trend: 'flat' },
  { label: 'Median response', value: '4.2h', sub: 'Target 6h · on track', trend: 'down' },
  { label: 'Sustainer MRR', value: '€23,150', sub: '+€340 this month', trend: 'up' },
]

export interface QuickAction {
  label: string
  count: number
  to: string
  icon: IconType
}

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Open reports to review', count: 7, to: routes.adminModeration, icon: FiFlag },
  { label: 'Identity verifications pending', count: 3, to: `${routes.adminMembers}?tab=verification`, icon: FiUserCheck },
  { label: 'Appeals awaiting decision', count: 2, to: `${routes.adminModeration}?tab=appeals`, icon: FiMessageSquare },
]

// ── Chart data (Task 4) ──────────────────────────────────────────────────────

export interface WeekBar {
  week: string
  harassment: number
  outing: number
  spam: number
  vouch: number
}

export const REPORT_WEEKS: WeekBar[] = [
  { week: 'W1', harassment: 3, outing: 1, spam: 4, vouch: 0 },
  { week: 'W2', harassment: 2, outing: 0, spam: 3, vouch: 1 },
  { week: 'W3', harassment: 4, outing: 2, spam: 2, vouch: 0 },
  { week: 'W4', harassment: 3, outing: 1, spam: 5, vouch: 1 },
  { week: 'W5', harassment: 6, outing: 3, spam: 4, vouch: 2 }, // Pride spike
  { week: 'W6', harassment: 8, outing: 4, spam: 3, vouch: 1 },
  { week: 'W7', harassment: 5, outing: 2, spam: 4, vouch: 0 },
  { week: 'W8', harassment: 3, outing: 1, spam: 3, vouch: 1 },
  { week: 'W9', harassment: 4, outing: 2, spam: 2, vouch: 0 },
  { week: 'W10', harassment: 2, outing: 1, spam: 4, vouch: 1 },
  { week: 'W11', harassment: 3, outing: 0, spam: 3, vouch: 0 },
  { week: 'W12', harassment: 2, outing: 1, spam: 2, vouch: 1 },
]

export interface GrowthPoint {
  month: string
  joined: number
  churned: number
  milestone?: string
}

export const MEMBER_GROWTH: GrowthPoint[] = [
  { month: 'Jul', joined: 42, churned: 8 },
  { month: 'Aug', joined: 51, churned: 11 },
  { month: 'Sep', joined: 47, churned: 9 },
  { month: 'Oct', joined: 63, churned: 12 },
  { month: 'Nov', joined: 58, churned: 14 },
  { month: 'Dec', joined: 44, churned: 16 },
  { month: 'Jan', joined: 71, churned: 10, milestone: 'Studio launch' },
  { month: 'Feb', joined: 66, churned: 13 },
  { month: 'Mar', joined: 82, churned: 11 },
  { month: 'Apr', joined: 74, churned: 12 },
  { month: 'May', joined: 119, churned: 9, milestone: 'Pride 2025' },
  { month: 'Jun', joined: 97, churned: 15 },
]

export interface DonutSlice {
  label: string
  value: number
  color: string
}

export const ACTION_BREAKDOWN: DonutSlice[] = [
  { label: 'Warnings', value: 96, color: 'var(--jade)' },
  { label: 'Suspensions', value: 41, color: 'var(--accent)' },
  { label: 'Bans', value: 18, color: 'var(--plum)' },
  { label: 'Dismissed', value: 129, color: 'rgba(45, 27, 61, 0.3)' },
]

// ── Activity feed (Task 5) ───────────────────────────────────────────────────

export interface FeedItem {
  id: string
  icon: IconType
  text: string
  meta: string
  to: string
}

export const ACTIVITY_FEED: FeedItem[] = [
  { id: 'f1', icon: FiFlag, text: 'Report #142 filed · harassment', meta: '3 min ago', to: routes.adminModeration },
  { id: 'f2', icon: FiUserPlus, text: 'New member @marta_j vouched · pending review', meta: '24 min ago', to: routes.adminMembers },
  { id: 'f3', icon: FiAlertCircle, text: 'Appeal #18 submitted', meta: '1h ago', to: `${routes.adminModeration}?tab=appeals` },
  { id: 'f4', icon: FiUsers, text: 'Queer Runners · 3 join requests waiting', meta: '2h ago', to: adminCommunityMod('queer-runners') },
  { id: 'f5', icon: FiCheckCircle, text: '@pedro_v identity verified', meta: '2h ago', to: routes.adminMembers },
  { id: 'f6', icon: FiFlag, text: 'Report #141 resolved · post removed', meta: '4h ago', to: routes.adminModeration },
]
