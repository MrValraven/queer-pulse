export type ServiceStatus = 'op' | 'deg' | 'out'

export interface Service {
  name: string
  desc: string
  status: ServiceStatus
}

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  op: 'Operational',
  deg: 'Degraded',
  out: 'Outage',
}

export const SERVICES: Service[] = [
  { name: 'Authentication', desc: 'Sign-in & invite system', status: 'op' },
  { name: 'Messages', desc: 'Direct & group messaging', status: 'op' },
  { name: 'Forum', desc: 'Community discussion boards', status: 'op' },
  { name: 'Events & Calendar', desc: 'Event discovery & RSVPs', status: 'op' },
  { name: 'Magazine', desc: 'Monthly publication & archive', status: 'op' },
  { name: 'Search', desc: 'Member & content search', status: 'op' },
  { name: 'Notifications', desc: 'In-app & email notifications', status: 'op' },
  { name: 'File storage', desc: 'Profile photos & attachments', status: 'op' },
]

export type IncidentStatus = 'resolved' | 'monitoring'

export interface Incident {
  date: string
  title: string
  text: string
  status: IncidentStatus
  resolved: boolean
}

export const INCIDENTS: Incident[] = [
  {
    date: '28 May 2026',
    title: 'Message delivery latency',
    text: 'Some members experienced delays of 5–15 minutes in message delivery due to a queue backlog following a database migration. No messages were lost.',
    status: 'resolved',
    resolved: true,
  },
  {
    date: '11 Apr 2026',
    title: 'Search index rebuild',
    text: 'Full-text search returned stale results for approximately 3 hours while the index was rebuilt after a schema change. Browse-based discovery was unaffected.',
    status: 'resolved',
    resolved: true,
  },
  {
    date: '02 Feb 2026',
    title: 'Email notification delays',
    text: 'Notification emails were delayed by up to 45 minutes for a 2-hour window. All queued emails were delivered after the issue was resolved.',
    status: 'resolved',
    resolved: true,
  },
  {
    date: '19 Dec 2025',
    title: 'Scheduled maintenance — database upgrade',
    text: '2-hour maintenance window for PostgreSQL major version upgrade. The platform was in read-only mode during this period.',
    status: 'resolved',
    resolved: true,
  },
]

export const UPTIME_SERVICES = ['Authentication', 'Messages', 'Forum', 'Events & Calendar']
