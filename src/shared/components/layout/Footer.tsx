import { Link } from 'react-router-dom'
import { linkToPath, routes } from '../../../app/routeMap'
import styles from './Footer.module.css'

interface FooterLink {
  label: string
  href: string
}
interface FooterColumn {
  heading: string
  links: FooterLink[]
}

const COLUMNS: FooterColumn[] = [
  {
    heading: 'Network',
    links: [
      { label: 'Members', href: '#discovery' },
      { label: 'Messages', href: routes.messages },
      { label: 'Search', href: routes.search },
      { label: 'Request an invite', href: routes.invite },
      { label: 'Onboarding', href: routes.welcome },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Forum', href: routes.forum },
      { label: 'Calendar', href: routes.calendar },
      { label: 'Gatherings', href: '#gather' },
      { label: 'Change Makers', href: routes.changemakers },
      { label: 'Communities', href: routes.communities },
      { label: 'Queer Parents', href: routes.parents },
      { label: 'Coming-Out Support', href: routes.comingOut },
      { label: 'Micro-Grants', href: routes.grants },
      { label: 'Resource Library', href: routes.library },
      { label: 'Volunteer', href: routes.volunteer },
      { label: 'Mentorship', href: routes.mentorship },
      { label: 'Activism', href: routes.activism },
      { label: 'Community Archive', href: routes.archive },
    ],
  },
  {
    heading: 'Lisbon',
    links: [
      { label: 'Spaces Map', href: routes.map },
      { label: 'Business Directory', href: routes.businessDirectory },
      { label: 'Skills Exchange', href: routes.barter },
      { label: 'Housing Board', href: routes.housing },
      { label: 'Job Board', href: routes.jobs },
      { label: 'Directory', href: routes.directory },
      { label: 'New to Lisbon?', href: routes.arriving },
      { label: 'Queer Platforms', href: routes.platforms },
      { label: 'Accessibility', href: routes.accessibility },
      { label: 'Contact', href: routes.contact },
    ],
  },
  {
    heading: 'Wellbeing',
    links: [
      { label: 'Wellbeing Hub', href: routes.wellbeing },
      { label: 'Therapist Directory', href: `${routes.wellbeing}#therapists` },
      { label: 'Peer Support', href: `${routes.wellbeing}#peer-support` },
      { label: 'Crisis Resources', href: `${routes.wellbeing}#crisis` },
      { label: 'Legal Aid', href: routes.legal },
      { label: 'Employer Reviews', href: routes.employerReviews },
      { label: 'Trans & NB Hub', href: routes.transHub },
      { label: 'Queer Elders', href: `${routes.communities}#elders` },
      { label: 'Queer Youth', href: `${routes.communities}#youth` },
      { label: 'Harm Reduction', href: `${routes.wellbeing}#harm-reduction` },
      { label: 'Report & Safety', href: routes.report },
    ],
  },
]

const BASE_LINKS: FooterLink[] = [
  { label: '🆘 Emergency', href: routes.emergency },
  { label: 'Governance', href: routes.governance },
  { label: 'Community guidelines', href: routes.guidelines },
  { label: 'Privacy', href: routes.safety },
  { label: '♿ Accessibility', href: routes.accessibility },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brand}>
              <span className={styles.pulseDot} aria-hidden />
              Queer<span className={styles.brandItalic}>Pulse</span>
            </Link>
            <p className={styles.blurb}>
              A queer professional network, rooted in Lisbon. Built by and for the
              community — not designed at it.
            </p>
          </div>

          <div className={styles.cols}>
            {COLUMNS.map((column) => (
              <div key={column.heading} className={styles.col}>
                <h4>{column.heading}</h4>
                {column.links.map((link) => (
                  <Link key={link.label} to={linkToPath(link.href)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.base}>
          <span>© 2026 QueerPulse · Made in Lisbon with care</span>
          <span>
            {BASE_LINKS.map((link, index) => (
              <span key={link.label}>
                {index > 0 && ' · '}
                <Link to={linkToPath(link.href)}>{link.label}</Link>
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}
