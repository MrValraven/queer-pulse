export interface CookieRow {
  name: string
  expires: string
  provider: string
}

export interface CookieCategory {
  id: 'essential' | 'functional' | 'analytics'
  title: string
  required?: boolean
  body: string
  cookies: CookieRow[]
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'essential',
    title: 'Essential cookies',
    required: true,
    body: 'These cookies are required for the platform to function. They manage your session, remember your login, and protect against cross-site request forgery. They cannot be disabled.',
    cookies: [
      { name: 'qp_session', expires: 'Session', provider: 'QueerPulse' },
      { name: 'qp_csrf', expires: 'Session', provider: 'QueerPulse' },
      { name: 'qp_auth', expires: '30 days', provider: 'QueerPulse' },
      { name: 'qp_prefs', expires: '1 year', provider: 'QueerPulse' },
    ],
  },
  {
    id: 'functional',
    title: 'Functional cookies',
    body: "These remember choices you've made — your theme preference, notification settings, and language selection — so you don't have to reconfigure them every time you visit.",
    cookies: [
      { name: 'qp_theme', expires: '1 year', provider: 'QueerPulse' },
      { name: 'qp_lang', expires: '1 year', provider: 'QueerPulse' },
      { name: 'qp_notif', expires: '6 months', provider: 'QueerPulse' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics cookies',
    body: 'We use Plausible — a privacy-first, EU-hosted analytics tool — to understand which features are used and where the platform is slow. Plausible does not track individuals, use fingerprinting, or share data with third parties. All data is aggregated and anonymised before we see it.',
    cookies: [{ name: 'plausible_ignore', expires: 'Session', provider: 'Plausible' }],
  },
]
