import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { VolunteerCommit } from "./volunteerOpportunities.types";

/**
 * DES-422. The opportunity page chrome that the live adapter and the demo
 * fixture both compose: the eyebrow, the recruiting badge, the stat and
 * sidebar row labels, the commitment level, the partnership line and the
 * post-apply confirmation.
 *
 * Adapters run inside a query function, where no hook can be called, so each
 * builder returns a `<Translation>` element that resolves its key when the
 * page renders. That keeps a cached opportunity in step with a language
 * switch without the query key carrying the language.
 *
 * Poster-typed values (organisation, role, partner name) go in as `slots`, so
 * text that happens to look like `<em>…</em>` stays literal.
 */

const LABEL_KEYS = {
  perWeek: "marketing:volunteerDetail.chrome.perWeek",
  commitment: "marketing:volunteerDetail.chrome.commitment",
  spotsOpen: "marketing:volunteerDetail.chrome.spotsOpen",
  role: "marketing:volunteerDetail.chrome.role",
  location: "marketing:volunteerDetail.chrome.location",
} as const;

export type VolunteerChromeLabel = keyof typeof LABEL_KEYS;

const COMMIT_KEYS: Record<VolunteerCommit, string> = {
  low: "marketing:volunteer.card.commitLow",
  medium: "marketing:volunteer.card.commitMedium",
};

/** A stat tile or sidebar row label. */
export function chromeLabel(label: VolunteerChromeLabel): ReactNode {
  return <Translation i18nKey={LABEL_KEYS[label]} />;
}

/** "Low commitment" / "Medium commitment", shared with the board's cards. */
export function commitmentLabel(commit: VolunteerCommit): ReactNode {
  return <Translation i18nKey={COMMIT_KEYS[commit]} />;
}

/** "Volunteer · {org}". */
export function volunteerEyebrow(org: string): ReactNode {
  return (
    <Translation
      i18nKey="marketing:volunteerDetail.chrome.eyebrow"
      slots={{ org }}
    />
  );
}

/** The header badge for an opportunity that is still recruiting, or closed. */
export function recruitingBadge(isClosed: boolean): ReactNode {
  return (
    <Translation
      i18nKey={
        isClosed
          ? "marketing:volunteerDetail.chrome.closed"
          : "marketing:volunteerDetail.chrome.recruiting"
      }
    />
  );
}

/** "In partnership with {name}." */
export function partnershipText(name: string): ReactNode {
  return (
    <Translation
      i18nKey="marketing:volunteerDetail.chrome.partnerText"
      slots={{ name }}
    />
  );
}

/** The applied card's sentence. A decision on the application arrives as an
 *  in-app notification (`VolunteerApplicationDecided`), which is all the copy
 *  promises. */
export function applyConfirmation(applyRole: string): ReactNode {
  return (
    <Translation
      i18nKey="marketing:volunteerDetail.chrome.applyConfirm"
      components={{ strong: <strong /> }}
      slots={{ role: applyRole }}
    />
  );
}
