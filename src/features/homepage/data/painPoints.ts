import type { PainPoint } from './types'
import { routes } from '../../../app/routeMap'

export const painPoints: PainPoint[] = [
  {
    question:
      '"Why is it so hard to connect with other queer people outside of nightlife or dating apps?"',
    headingPrefix: 'A network built on ',
    accent: 'craft, not clubs.',
    body: 'QueerPulse is where queer professionals meet as themselves — designers, engineers, chefs, filmmakers — not as who they are at 2am.',
    ctaLabel: 'Explore members →',
    href: '#discovery',
  },
  {
    question:
      '"I want to work on projects with like-minded people. Where do I find them?"',
    headingPrefix: 'Collaborators, not ',
    accent: 'connections.',
    body: "The Board is where members post what they're making and who they need. No cold outreach, no speculative emails. Just real asks from real people.",
    ctaLabel: 'See the board →',
    href: '#board',
  },
  {
    question:
      '"I\'m new to Lisbon. How do I find queer-owned businesses and professionals?"',
    headingPrefix: 'A city guide built by ',
    accent: 'the community.',
    body: 'The directory is a living map of queer-owned and queer-friendly businesses in Lisbon — maintained by members who actually use them.',
    ctaLabel: 'Browse the directory →',
    href: routes.businessDirectory,
  },
  {
    question: '"I want to host events for my community. Where do I start?"',
    headingPrefix: 'From idea to gathering ',
    accent: 'in an afternoon.',
    body: 'A step-by-step guide to running a supper club, studio visit, workshop, or screening — with partner spaces, member support, and a listing on the gatherings board.',
    ctaLabel: 'Host a gathering →',
    href: routes.host,
  },
  {
    question: '"I want to get better at X. Who can help? Where can I learn?"',
    headingPrefix: 'Learn from people doing ',
    accent: 'the thing you want to do.',
    body: 'Members offer mentoring, workshops, and portfolio reviews — not as a service, but as a community practice. No platform fee, no imposter syndrome required.',
    ctaLabel: 'See skills & learning →',
    href: routes.skills,
  },
  {
    question:
      '"I want to make a difference. How do I make my activism feel like it matters?"',
    headingPrefix: 'Local action, ',
    accent: 'real impact.',
    body: 'A practical guide to activism in Lisbon — using your skills, finding others who care, and making change in the places you actually live and work.',
    ctaLabel: 'Read the guide →',
    href: routes.activism,
  },
  {
    question:
      "\"I'm struggling and don't know where to turn. Who can I actually trust?\"",
    headingPrefix: 'Mental health resources ',
    accent: 'built for us.',
    body: 'Queer-affirming therapists in Lisbon, a peer support group, and crisis resources — all vetted by community members, not a directory algorithm.',
    ctaLabel: 'Find support →',
    href: routes.wellbeing,
  },
  {
    question:
      '"My employer is discriminating against me. What are my rights in Portugal?"',
    headingPrefix: 'Know your rights. ',
    accent: 'Have your receipts.',
    body: 'Workplace discrimination, housing rights, healthcare access — legal guides for LGBTQ+ people in Portugal, plus queer-friendly lawyers.',
    ctaLabel: 'Read the guide →',
    href: routes.legal,
  },
  {
    question:
      '"My company has a Pride float. That doesn\'t mean it\'s safe to be out there."',
    headingPrefix: 'Employer reviews written ',
    accent: 'by us, for us.',
    body: 'Anonymous reviews of companies by LGBTQ+ employees in Lisbon. Beyond the rainbow logo — is the culture actually safe to be out in?',
    ctaLabel: 'Read & write reviews →',
    href: routes.employerReviews,
  },
]
