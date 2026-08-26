/**
 * Real values for the security / responsible-disclosure page.
 *
 * These used to be hard-coded placeholders in `SecurityPolicyPage.tsx`: a truncated
 * PGP block that no client could import, and three invented researcher credits.
 * On a page whose whole job is to be trusted by security researchers, a
 * non-importable key wastes their time and fabricated credits assert reports
 * that were never made. So both now start empty and the page hides the card and
 * the acknowledgements grid until there is something real to show.
 *
 * To publish the key: paste the full armored block below (from
 * `gpg --armor --export <fingerprint>`), keeping the BEGIN/END lines.
 */
export const SECURITY_PGP_KEY: string | null = null;

export interface SecurityHallEntry {
  /** Initials shown in the credit tile. */
  initials: string;
  /** Researcher name, exactly as they asked to be credited. */
  name: string;
  /** Vulnerability class and the month it was reported. */
  note: string;
}

/**
 * Researchers credited for a real, verified disclosure, listed with their
 * permission. Attribution records stay in English, like other stored values.
 */
export const SECURITY_HALL_OF_FAME: SecurityHallEntry[] = [];
