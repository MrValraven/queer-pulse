import type { ReactNode } from 'react'
import { FiShield, FiHeart, FiSmile, FiUsers } from 'react-icons/fi'
import { FaRainbow } from 'react-icons/fa6'

export interface BadgeDef {
  key: string
  icon: ReactNode
  label: string
  /** What the badge means + how an employer earns it. */
  blurb: string
}

/** Employer-safety badge definitions — label, icon, and the criteria behind it. */
export const SAFETY_BADGE_DEFS: Record<string, BadgeDef> = {
  verified: {
    key: 'verified',
    icon: <FiShield />,
    label: 'Verified safe',
    blurb:
      'Earned, not claimed. We confirm inclusive policies on paper, then cross-check with at least three anonymous reviews from current or former LGBTQ+ staff. Re-checked every year.',
  },
  trans: {
    key: 'trans',
    icon: <FiHeart />,
    label: 'Trans-friendly',
    blurb:
      'Documented trans-inclusive practice: gender-affirming healthcare in the plan, a name/pronoun-change process, and gender-neutral facilities — confirmed by staff reviews.',
  },
  out: {
    key: 'out',
    icon: <FiSmile />,
    label: 'Safe to be out',
    blurb:
      'Members rate this employer 8+/10 on "safe to be out at work" — being open about who you are is a non-event here, not a risk.',
  },
}

/**
 * Affiliation distinguishes queer-RUN (led/owned by queer people) from
 * queer-FRIENDLY/affirming (an inclusive employer, but not queer-led).
 */
export type Affiliation = 'run' | 'friendly'

export interface AffiliationDef {
  icon: ReactNode
  label: string
  blurb: string
}

export const AFFILIATION_DEFS: Record<Affiliation, AffiliationDef> = {
  run: {
    icon: <FaRainbow />,
    label: 'Queer-run',
    blurb:
      'Led or owned by queer people — decisions, culture, and money stay inside the community. Verified during vetting, not self-reported.',
  },
  friendly: {
    icon: <FiUsers />,
    label: 'Queer-friendly',
    blurb:
      'An affirming employer with inclusive policies and a real LGBTQ+ presence — but not queer-led. Welcoming, just not community-owned.',
  },
}

/** Map the job's queer-run flag to an affiliation. */
export function affiliationFromLabel(qr: boolean): Affiliation {
  return qr ? 'run' : 'friendly'
}
