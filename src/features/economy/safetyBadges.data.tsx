import type { ReactNode } from "react";
import { FiShield, FiHeart, FiSmile, FiUsers } from "react-icons/fi";
import { FaRainbow } from "react-icons/fa6";

/**
 * i18n Pattern A. These badge definitions are the platform's own safety
 * vocabulary — the criteria QueerPulse itself sets and vets against — so they
 * are chrome in both demo and live mode and hold catalog keys, resolved by
 * `SafetyBadges.tsx` via `t()`.
 */
export interface BadgeDef {
  key: string;
  icon: ReactNode;
  labelKey: string;
  /** What the badge means + how an employer earns it. */
  blurbKey: string;
}

/** Employer-safety badge definitions — label, icon, and the criteria behind it. */
export const SAFETY_BADGE_DEFS: Record<string, BadgeDef> = {
  verified: {
    key: "verified",
    icon: <FiShield />,
    labelKey: "economy:safetyBadge.verified.label",
    blurbKey: "economy:safetyBadge.verified.blurb",
  },
  trans: {
    key: "trans",
    icon: <FiHeart />,
    labelKey: "economy:safetyBadge.trans.label",
    blurbKey: "economy:safetyBadge.trans.blurb",
  },
  out: {
    key: "out",
    icon: <FiSmile />,
    labelKey: "economy:safetyBadge.out.label",
    blurbKey: "economy:safetyBadge.out.blurb",
  },
};

/**
 * Affiliation distinguishes queer-RUN (led/owned by queer people) from
 * queer-FRIENDLY/affirming (an inclusive employer, but not queer-led).
 */
export type Affiliation = "run" | "friendly";

export interface AffiliationDef {
  icon: ReactNode;
  labelKey: string;
  blurbKey: string;
}

export const AFFILIATION_DEFS: Record<Affiliation, AffiliationDef> = {
  run: {
    icon: <FaRainbow />,
    labelKey: "economy:safetyBadge.affiliation.run.label",
    blurbKey: "economy:safetyBadge.affiliation.run.blurb",
  },
  friendly: {
    icon: <FiUsers />,
    labelKey: "economy:safetyBadge.affiliation.friendly.label",
    blurbKey: "economy:safetyBadge.affiliation.friendly.blurb",
  },
};

/** Map the job's queer-run flag to an affiliation. */
export function affiliationFromLabel(qr: boolean): Affiliation {
  return qr ? "run" : "friendly";
}
