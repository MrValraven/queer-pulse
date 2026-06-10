import { Link } from 'react-router-dom'
import { linkToPath } from '../../../app/routeMap'
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
      { label: 'Messages', href: 'QueerPulse Messages.html' },
      { label: 'Search', href: 'QueerPulse Search.html' },
      { label: 'Request an invite', href: 'QueerPulse Invite.html' },
      { label: 'Onboarding', href: 'QueerPulse Welcome.html' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Forum', href: 'QueerPulse Forum.html' },
      { label: 'Calendar', href: 'QueerPulse Calendar.html' },
      { label: 'Gatherings', href: '#gather' },
      { label: 'Change Makers', href: 'QueerPulse Changemakers.html' },
      { label: 'Communities', href: 'QueerPulse Communities.html' },
      { label: 'Queer Parents', href: 'QueerPulse Parents.html' },
      { label: 'Coming-Out Support', href: 'QueerPulse Coming Out.html' },
      { label: 'Micro-Grants', href: 'QueerPulse Grants.html' },
      { label: 'Resource Library', href: 'QueerPulse Library.html' },
      { label: 'Volunteer', href: 'QueerPulse Volunteer.html' },
      { label: 'Mentorship', href: 'QueerPulse Mentorship.html' },
      { label: 'Activism', href: 'QueerPulse Activism.html' },
      { label: 'Community Archive', href: 'QueerPulse Archive.html' },
    ],
  },
  {
    heading: 'Lisbon',
    links: [
      { label: 'Spaces Map', href: 'QueerPulse Map.html' },
      { label: 'Business Directory', href: 'QueerPulse Business Directory.html' },
      { label: 'Skills Exchange', href: 'QueerPulse Barter.html' },
      { label: 'Housing Board', href: 'QueerPulse Housing.html' },
      { label: 'Job Board', href: 'QueerPulse Jobs.html' },
      { label: 'Directory', href: 'QueerPulse Directory.html' },
      { label: 'New to Lisbon?', href: 'QueerPulse Arriving.html' },
      { label: 'Queer Platforms', href: 'QueerPulse Platforms.html' },
      { label: 'Accessibility', href: 'QueerPulse Accessibility.html' },
      { label: 'Contact', href: 'QueerPulse Contact.html' },
    ],
  },
  {
    heading: 'Wellbeing',
    links: [
      { label: 'Wellbeing Hub', href: 'QueerPulse Wellbeing.html' },
      { label: 'Therapist Directory', href: 'QueerPulse Wellbeing.html#therapists' },
      { label: 'Peer Support', href: 'QueerPulse Wellbeing.html#peer-support' },
      { label: 'Crisis Resources', href: 'QueerPulse Wellbeing.html#crisis' },
      { label: 'Legal Aid', href: 'QueerPulse Legal.html' },
      { label: 'Employer Reviews', href: 'QueerPulse Employer Reviews.html' },
      { label: 'Trans & NB Hub', href: 'QueerPulse Trans Hub.html' },
      { label: 'Queer Elders', href: 'QueerPulse Communities.html#elders' },
      { label: 'Queer Youth', href: 'QueerPulse Communities.html#youth' },
      { label: 'Harm Reduction', href: 'QueerPulse Wellbeing.html#harm-reduction' },
      { label: 'Report & Safety', href: 'QueerPulse Report.html' },
    ],
  },
]

const BASE_LINKS: FooterLink[] = [
  { label: '🆘 Emergency', href: 'QueerPulse Emergency.html' },
  { label: 'Governance', href: 'QueerPulse Governance.html' },
  { label: 'Community guidelines', href: 'QueerPulse Guidelines.html' },
  { label: 'Privacy', href: 'QueerPulse Safety.html' },
  { label: '♿ Accessibility', href: 'QueerPulse Accessibility.html' },
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
