import { isLanguage, intlLocale } from "../../../shared/i18n/locale";
import type { TFunction } from "../../../shared/i18n/types";
import type { MemberSelectPerson } from "../../../shared/components/ui/MemberSelectList";
import type { AvatarTone } from "../ui";
import type { LeadStaffSummaryDTO } from "./api/leads.types";
import { LEAD_STAFF_AVATAR_TONES } from "./leadAssignees.data";
import {
  LEAD_UNKNOWN_AUTHOR_KEY,
  LEAD_UNKNOWN_SUBJECT_KEY,
} from "./leadHistory.model";

export const LEAD_YOU_KEY = "admin:leads.assignees.you";

/** Whether this staff member is the person reading the page. */
export function isLeadViewer(
  summary: LeadStaffSummaryDTO,
  viewerId: string | null,
): boolean {
  return viewerId !== null && summary.id === viewerId;
}

/** Up to two capitals: the first and last word's first letters. A blank
 *  name gives "", so the avatar draws its plain fallback. */
export function leadStaffInitialsOf(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const firstLetterOf = (word: string): string => Array.from(word)[0] ?? "";
  const firstWord = words[0] ?? "";
  const lastWord = words.length > 1 ? (words.at(-1) ?? "") : "";
  return (firstLetterOf(firstWord) + firstLetterOf(lastWord)).toUpperCase();
}

/** One steady initials tone per person, picked from the user id. */
export function leadStaffToneOf(userId: string): AvatarTone {
  let codePointSum = 0;
  for (const character of userId) codePointSum += character.codePointAt(0) ?? 0;
  return (
    LEAD_STAFF_AVATAR_TONES[codePointSum % LEAD_STAFF_AVATAR_TONES.length] ??
    "plum"
  );
}

/** The name a staff member reads as: "You" for the viewer, the unknown
 *  author line for a blank name. */
export function leadStaffLabelOf(
  summary: LeadStaffSummaryDTO,
  viewerId: string | null,
  translate: TFunction,
): string {
  if (isLeadViewer(summary, viewerId)) return translate(LEAD_YOU_KEY);
  const name = summary.displayName.trim();
  return name === "" ? translate(LEAD_UNKNOWN_AUTHOR_KEY) : name;
}

/** The name a staff member reads as inside a sentence ("Unassign {name}"):
 *  "You" for the viewer, the lower-case unknown subject line for a blank
 *  name. */
export function leadStaffMidSentenceNameOf(
  summary: LeadStaffSummaryDTO,
  viewerId: string | null,
  translate: TFunction,
): string {
  if (isLeadViewer(summary, viewerId)) return translate(LEAD_YOU_KEY);
  const name = summary.displayName.trim();
  return name === "" ? translate(LEAD_UNKNOWN_SUBJECT_KEY) : name;
}

/**
 * The list row's spoken In charge line. With every assignee shown the names
 * join as a sentence ("You and Marta Lobo"); with more beyond the shown ones
 * the names join with commas only and the line ends "and {count} more", so
 * "and" is said once in either language. A blank name reads the unknown
 * subject line, which sits naturally mid-sentence. An unassigned lead says
 * nothing.
 */
export function leadAssigneesAriaOf(
  lead: { assignees: readonly LeadStaffSummaryDTO[]; assigneeCount: number },
  viewerId: string | null,
  translate: TFunction,
  language: string,
): string | null {
  if (lead.assigneeCount === 0) return null;
  const labels = lead.assignees.map((summary) =>
    leadStaffMidSentenceNameOf(summary, viewerId, translate),
  );
  const hiddenCount = Math.max(0, lead.assigneeCount - lead.assignees.length);
  if (hiddenCount > 0) {
    return translate("admin:leads.list.assigneesMoreAria", {
      names: labels.join(", "),
      count: hiddenCount,
    });
  }
  const locale = intlLocale(isLanguage(language) ? language : "en");
  const names = new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).format(labels);
  return translate("admin:leads.list.assigneesAria", { names });
}

/** A picker row for `MemberSelectList`, which keys rows by slug. A hidden
 *  or missing photo leaves `avatarUrl` unset, so the row shows initials. */
export function toLeadStaffPerson(
  summary: LeadStaffSummaryDTO,
  viewerId: string | null,
  youLabel: string,
): MemberSelectPerson {
  return {
    slug: summary.slug,
    name: summary.displayName,
    avatarUrl: summary.avatarUrl ?? undefined,
    detail: isLeadViewer(summary, viewerId) ? youLabel : undefined,
  };
}

/** The summary behind a picked row, looked up across the search results and
 *  the current assignees. A blank slug matches nobody. */
export function leadStaffBySlug(
  slug: string,
  groups: readonly (readonly LeadStaffSummaryDTO[])[],
): LeadStaffSummaryDTO | null {
  if (slug === "") return null;
  for (const group of groups) {
    const match = group.find((summary) => summary.slug === slug);
    if (match !== undefined) return match;
  }
  return null;
}
