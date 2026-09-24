import { subprofileEditPath } from "../../../../app/routeMap";
import type { TherapistCompletenessKey } from "./therapistView.helpers";

/** The chapters of the therapist "Page blocks" editor, in editor order. */
export type TherapistEditChapter =
  "basics" | "approach" | "fees" | "availability" | "where" | "contact";

/**
 * Where an owner's "Edit" link lands in the persona editor. `pane` becomes
 * `?pane=`, `chapter` becomes `?chapter=` (Page blocks only) and `field` becomes
 * `?field=`: the skinData dot path ("therapist.quote") or an identity or
 * presence field name ("avatar", "ctaLabel"). The editor ignores a `field` it
 * cannot jump to yet, so the link still opens the right pane and chapter.
 */
export type TherapistEditTarget =
  | { pane: "skinBlocks"; chapter: TherapistEditChapter; field?: string }
  | {
      pane:
        | "identity"
        | "presence"
        | "section:specialisms"
        | "section:credentials"
        | "section:gallery"
        | "publish";
      field?: string;
    };

function blocks(
  chapter: TherapistEditChapter,
  field?: string,
): TherapistEditTarget {
  return field
    ? { pane: "skinBlocks", chapter, field }
    : { pane: "skinBlocks", chapter };
}

/** Every owner "Edit" link on the therapist page, by the value it edits. */
export const THERAPIST_EDIT_TARGETS = {
  // Hero
  portrait: { pane: "identity", field: "avatar" },
  name: { pane: "identity", field: "displayName" },
  bio: { pane: "identity", field: "bio" },
  status: blocks("basics", "therapist.status"),
  role: blocks("basics", "therapist.title"),
  quote: blocks("basics", "therapist.quote"),
  lived: blocks("basics", "lived"),
  languages: blocks("basics", "therapist.languages"),
  where: blocks("where", "therapist.where"),
  fees: blocks("fees", "therapyFees.standard"),
  insurance: blocks("fees", "therapyFees.receipts"),
  bookButton: { pane: "presence", field: "ctaLabel" },
  // No booking link yet: the hero offers to add one instead.
  bookLink: { pane: "presence", field: "ctaUrl" },
  contactLinks: blocks("contact", "therapist.email"),
  // Sections
  approach: blocks("approach", "approach"),
  specialties: { pane: "section:specialisms" },
  credentials: { pane: "section:credentials" },
  gallery: { pane: "section:gallery" },
  whoFor: blocks("approach", "whoFor"),
  firstSession: blocks("availability", "firstSession"),
  faq: blocks("contact", "faq"),
  referrals: blocks("contact", "referrals"),
  worksAlongside: blocks("contact", "worksAlongside"),
  // The practical bits, one per cell
  sessions: blocks("fees", "feeSchedule"),
  feesCell: blocks("fees", "therapyFees.standard"),
  smallPrint: blocks("fees", "therapyFees.receipts"),
  availability: blocks("availability", "availabilitySummary.headline"),
  calculator: blocks("fees", "reimbursement"),
  travel: blocks("where", "travel.metro"),
  access: blocks("where", "access"),
} satisfies Record<string, TherapistEditTarget>;

/** The owner bar's "Missing: …" entries, each opening where it is filled in. */
export const COMPLETENESS_EDIT_TARGETS: Record<
  TherapistCompletenessKey,
  TherapistEditTarget
> = {
  portrait: { pane: "identity", field: "avatar" },
  quote: blocks("basics", "therapist.quote"),
  approach: blocks("approach", "approach"),
  specialties: { pane: "section:specialisms" },
  fees: blocks("fees"),
  availability: blocks("availability", "availabilitySummary.headline"),
  faq: blocks("contact", "faq"),
  firstSession: blocks("availability", "firstSession"),
  access: blocks("where", "access"),
};

const ARIA = "subprofiles:therapist.edit.aria";

/** Accessible names for a link that shows only "Edit", by field. */
const FIELD_ARIA_KEYS: Record<string, string> = {
  avatar: `${ARIA}.portrait`,
  displayName: `${ARIA}.name`,
  bio: `${ARIA}.bio`,
  ctaLabel: `${ARIA}.bookButton`,
  "therapist.status": `${ARIA}.status`,
  "therapist.title": `${ARIA}.role`,
  "therapist.registration": `${ARIA}.role`,
  "therapist.quote": `${ARIA}.quote`,
  lived: `${ARIA}.lived`,
  "therapist.languages": `${ARIA}.languages`,
  "therapist.where": `${ARIA}.where`,
  "therapist.email": `${ARIA}.contactLinks`,
  "therapist.website": `${ARIA}.contactLinks`,
  "therapist.goodToKnow": `${ARIA}.goodToKnow`,
  "therapyFees.standard": `${ARIA}.fees`,
  "therapyFees.receipts": `${ARIA}.receipts`,
  "therapyFees.firstContact": `${ARIA}.firstContact`,
  approach: `${ARIA}.approach`,
  whoFor: `${ARIA}.whoFor`,
  firstSession: `${ARIA}.firstSession`,
  "availabilitySummary.headline": `${ARIA}.availability`,
  feeSchedule: `${ARIA}.sessions`,
  reimbursement: `${ARIA}.calculator`,
  travel: `${ARIA}.travel`,
  access: `${ARIA}.access`,
  faq: `${ARIA}.faq`,
  referrals: `${ARIA}.referrals`,
  worksAlongside: `${ARIA}.worksAlongside`,
};

/** Accessible names by pane, or by chapter inside Page blocks. */
const SCOPE_ARIA_KEYS: Record<string, string> = {
  basics: `${ARIA}.basics`,
  approach: `${ARIA}.approach`,
  fees: `${ARIA}.fees`,
  availability: `${ARIA}.availability`,
  where: `${ARIA}.whereChapter`,
  contact: `${ARIA}.contact`,
  identity: `${ARIA}.identity`,
  presence: `${ARIA}.presence`,
  "section:specialisms": `${ARIA}.specialties`,
  "section:credentials": `${ARIA}.credentials`,
  "section:gallery": `${ARIA}.gallery`,
  publish: `${ARIA}.publish`,
};

/** The i18n key naming what a target edits ("Edit quote"). */
export function therapistEditAriaKey(target: TherapistEditTarget): string {
  const fieldKey = target.field ? FIELD_ARIA_KEYS[target.field] : undefined;
  if (fieldKey) return fieldKey;
  const scope = target.pane === "skinBlocks" ? target.chapter : target.pane;
  return SCOPE_ARIA_KEYS[scope] ?? `${ARIA}.page`;
}

/** The editor address for a target: the persona's edit path plus `?pane=`,
 *  `?chapter=` (Page blocks only) and `?field=` when given. */
export function therapistEditHref(
  subprofileId: string,
  target: TherapistEditTarget,
): string {
  const params = new URLSearchParams({ pane: target.pane });
  if (target.pane === "skinBlocks") params.set("chapter", target.chapter);
  if (target.field) params.set("field", target.field);
  return `${subprofileEditPath(subprofileId)}?${params.toString()}`;
}
