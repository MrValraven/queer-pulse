import type {
  AuthoredTextDTO,
  CouncilSeatDTO,
  DecisionDTO,
  PrincipleDTO,
} from "./api/adminGovernanceOverview.api";

/**
 * PRD-265. The constants and label helpers the three governance-overview row
 * components share.
 *
 * They live here rather than beside those components so each component file
 * exports only components (react-refresh), matching
 * `adminGovernanceHealthFields.utils.ts` and `overviewEditorRow.utils.ts`
 * alongside them.
 */

/** A blank authored field, for a row an editor has just added. */
export const EMPTY_AUTHORED_TEXT: AuthoredTextDTO = { en: "", pt: "" };

/** One-line fields (a decision lead, a principle title, a council role) and
 *  paragraph fields (a decision body, a principle's explanation), in
 *  characters. Mirrors `ShortAuthoredTextDto` / `LongAuthoredTextDto` on the
 *  backend, so a field stops accepting text where the API would refuse it. */
export const SHORT_TEXT_MAX_LENGTH = 200;
export const LONG_TEXT_MAX_LENGTH = 1000;

export const COUNCIL_NAME_MAX_LENGTH = 80;
export const COUNCIL_INITIALS_MAX_LENGTH = 4;

/**
 * The icons the public page can draw for a principle, and the avatar colour
 * pairs it can draw for a council seat. Identifiers the reader maps to a
 * react-icon and a `{background,color}` pair, not prose — so unlike the content
 * keys these stay closed sets after PRD-265, and the backend keeps its `@IsIn`
 * on both.
 */
export const PRINCIPLE_ICONS = [
  "lock",
  "eye",
  "slash",
  "message",
  "book",
  "accessible",
] as const;

export const COUNCIL_TINTS = ["jade", "violet", "plum"] as const;

/**
 * The entries that shipped in the i18n bundle, per section.
 *
 * Kept ONLY so a seeded entry an editor removed by mistake can be put back.
 * They are no longer the set of entries these sections can hold: that was the
 * defect PRD-265 fixes, and everything new is authored.
 */
export const SEEDED_DECISION_KEYS = [
  "slidingScale",
  "forumLaunched",
  "visibilityDefaults",
  "languageToggle",
] as const;

export const SEEDED_PRINCIPLE_KEYS = [
  "noSellingData",
  "visibilityChoice",
  "noAlgorithms",
  "communityVoice",
  "transparency",
  "accessNotConditional",
] as const;

export const SEEDED_COUNCIL_ROLE_KEYS = [
  "psychologistChair",
  "lawyerLegalAdvisor",
  "housingActivist",
  "healthcareAdvocate",
] as const;

/**
 * How a row is named to a screen reader in its reorder and remove buttons.
 *
 * A seeded row is named by its catalog label; an authored one by the words the
 * editor is typing, falling back to a placeholder while those are still empty.
 * A nameless row in a list of identical rows is exactly the failure the
 * BUDGET=0 a11y gate exists to catch, so none of these may return "".
 */
export function decisionRowLabel(
  row: DecisionDTO,
  translate: (key: string) => string,
): string {
  if (row.key) {
    return translate(`admin:governance.overview.decisions.key.${row.key}`);
  }
  return (
    row.lead?.en.trim() ||
    row.lead?.pt.trim() ||
    translate("admin:governance.overview.decisions.newEntry")
  );
}

export function principleRowLabel(
  row: PrincipleDTO,
  translate: (key: string) => string,
): string {
  if (row.key) {
    return translate(`admin:governance.overview.principles.key.${row.key}`);
  }
  return (
    row.title?.en.trim() ||
    row.title?.pt.trim() ||
    translate("admin:governance.overview.principles.newEntry")
  );
}

/** A seat is known by the person in it where there is one, then by the role. */
export function councilRowLabel(
  row: CouncilSeatDTO,
  translate: (key: string) => string,
): string {
  if (row.name.trim()) return row.name.trim();
  if (row.roleKey) {
    return translate(`admin:governance.overview.council.role.${row.roleKey}`);
  }
  return (
    row.role?.en.trim() ||
    row.role?.pt.trim() ||
    translate("admin:governance.overview.council.newSeat")
  );
}

/**
 * True when any AUTHORED row in a section is missing one of its languages.
 *
 * The API refuses such a save with a 400 the editor would have to decode, and a
 * blank line on the platform's public accountability record is worse than a
 * refused save, so each editor checks before it sends. Seeded rows are skipped:
 * their words are in the bundle and there is nothing here to be missing.
 */
export function hasIncompleteAuthoredText(
  texts: (AuthoredTextDTO | undefined)[],
): boolean {
  return texts.some((text) => !text?.en.trim() || !text?.pt.trim());
}
