import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { focusControl } from "../../shared/lib/focusFirstError";
import { ACCESSIBILITY_QUESTIONS } from "../marketing/listBusiness/listingAccessibility.data";
import { audienceScopeLabelKey } from "./audienceScope.data";
import {
  CADENCE_OPTIONS,
  GATE_ANCHOR,
  hoodLabelKey,
  CREATE_GATHERING_CHAPTERS,
  chapterHeadId,
} from "./createGathering.data";
import { COST_KIND_LABEL_KEYS } from "./gatheringExtras";
import { findFamily, findFormat, OTHER_FORMAT_KEY } from "./gatheringCatalog";
import type { GatheringForm } from "./useGatheringForm";

/**
 * Create Gathering v2: what each chapter asks of the host, what the collapsed
 * chapter says about itself, and what the ready panel lists.
 *
 * This file answers "can this chapter continue, and if not, why" for the
 * Continue button and the "Still needed" line alike, so both always read the
 * same gate. Chapters 0 (What) and 1 (When and where) hold everything the
 * backend refuses to create a gathering without; chapters 2 to 4 ask nothing
 * required.
 */

/** One unmet thing standing between a chapter and its Continue. */
export interface ChapterNeed {
  /** Stable identity for React keys, kept off screen. */
  key: string;
  /** Namespaced catalog key, a noun phrase ("a format") the chapter footer
   *  joins into "Still needed: a format and a name". */
  labelKey: string;
  /** The `GATE_ANCHOR` id of the field it is about. */
  anchor: string;
}

/** One row of the ready panel. */
export interface ReadinessItem {
  key: string;
  labelKey: string;
  isMet: boolean;
  /** A soft row: listed with "(optional)" and left out of the count and the
   *  publish gate. */
  isOptional: boolean;
  /** The chapter the field lives in, 0-based. */
  chapterIndex: number;
  anchor: string;
}

const SUMMARY_SEPARATOR = " · ";

/** The format question's anchor: the host's own words when they picked
 *  "something else" and have not written them, the picker otherwise. */
function formatAnchor(form: GatheringForm): string {
  return form.family && form.format === OTHER_FORMAT_KEY
    ? GATE_ANCHOR.format
    : GATE_ANCHOR.type;
}

/** Everything still unmet in one chapter, in the order the fields appear. */
export function chapterNeeds(
  form: GatheringForm,
  chapterIndex: number,
): ChapterNeed[] {
  const needs: ChapterNeed[] = [];
  if (chapterIndex === 0) {
    if (!form.isFormatChosen) {
      needs.push({
        key: "format",
        labelKey: "gatherings:create.v2.need.format",
        anchor: formatAnchor(form),
      });
    }
    if (!form.title.trim()) {
      needs.push({
        key: "title",
        labelKey: "gatherings:create.v2.need.title",
        anchor: GATE_ANCHOR.title,
      });
    }
  }
  if (chapterIndex === 1) {
    if (!(form.dateValid && form.scheduleValid)) {
      needs.push({
        key: "date",
        labelKey: "gatherings:create.v2.need.date",
        anchor: GATE_ANCHOR.date,
      });
    }
    if (!form.onlineUrlValid) {
      needs.push({
        key: "joinLink",
        labelKey: "gatherings:create.v2.need.joinLink",
        anchor: GATE_ANCHOR.joinLink,
      });
    }
    if (!form.recurrenceValid) {
      needs.push({
        key: "recurrence",
        labelKey: "gatherings:create.v2.need.recurrence",
        anchor: GATE_ANCHOR.recurrence,
      });
    }
  }
  return needs;
}

/** Can this chapter continue? */
export function isChapterComplete(
  form: GatheringForm,
  chapterIndex: number,
): boolean {
  return chapterNeeds(form, chapterIndex).length === 0;
}

/**
 * The ready panel's rows: the required ones first, then the soft ones.
 *
 * The join link row appears only while the link is malformed. An empty link is
 * valid (the host can add it after publishing), and a green tick against a
 * field the host chose to leave empty reads as a demand. The repeat row
 * appears only while repeats are on.
 */
export function readinessItems(form: GatheringForm): ReadinessItem[] {
  const items: ReadinessItem[] = [
    {
      key: "format",
      labelKey: "gatherings:create.v2.ready.item.format",
      isMet: form.isFormatChosen,
      isOptional: false,
      chapterIndex: 0,
      anchor: formatAnchor(form),
    },
    {
      key: "title",
      labelKey: "gatherings:create.v2.ready.item.title",
      isMet: form.title.trim().length > 0,
      isOptional: false,
      chapterIndex: 0,
      anchor: GATE_ANCHOR.title,
    },
    {
      key: "date",
      labelKey: "gatherings:create.v2.ready.item.date",
      isMet: form.dateValid && form.scheduleValid,
      isOptional: false,
      chapterIndex: 1,
      anchor: GATE_ANCHOR.date,
    },
  ];
  if (!form.onlineUrlValid) {
    items.push({
      key: "joinLink",
      labelKey: "gatherings:create.v2.ready.item.joinLink",
      isMet: false,
      isOptional: false,
      chapterIndex: 1,
      anchor: GATE_ANCHOR.joinLink,
    });
  }
  if (form.repeats) {
    items.push({
      key: "recurrence",
      labelKey: "gatherings:create.v2.ready.item.recurrence",
      isMet: form.recurrenceValid,
      isOptional: false,
      chapterIndex: 1,
      anchor: GATE_ANCHOR.recurrence,
    });
  }
  items.push(
    {
      key: "hood",
      labelKey: "gatherings:create.v2.ready.item.hood",
      isMet: form.hood.length > 0,
      isOptional: true,
      chapterIndex: 1,
      anchor: GATE_ANCHOR.hood,
    },
    {
      key: "accessibility",
      labelKey: "gatherings:create.v2.ready.item.accessibility",
      isMet: form.answeredAccessibilityCount > 0,
      isOptional: true,
      chapterIndex: 3,
      anchor: GATE_ANCHOR.accessibility,
    },
    {
      key: "cover",
      labelKey: "gatherings:create.v2.ready.item.cover",
      isMet: form.coverImageUrl.length > 0,
      isOptional: true,
      chapterIndex: 0,
      anchor: GATE_ANCHOR.cover,
    },
  );
  return items;
}

// ── Collapsed chapter summaries ──────────────────────────────────────────

export interface SummaryContext {
  t: TFunction;
  fmt: Formatters;
}

/** The format's display name: the host's own words, the curated format, or
 *  the family alone while no format is picked. */
function formatDisplayName(form: GatheringForm, t: TFunction): string {
  if (form.format === OTHER_FORMAT_KEY) return form.otherText.trim();
  const formatEntry = findFormat(form.format);
  if (formatEntry) return t(formatEntry.nameKey);
  const familyEntry = findFamily(form.family);
  return familyEntry ? t(familyEntry.nameKey) : "";
}

function whatSummary(form: GatheringForm, { t }: SummaryContext): string {
  const parts = [formatDisplayName(form, t), form.title.trim()].filter(Boolean);
  return parts.length > 0
    ? parts.join(SUMMARY_SEPARATOR)
    : t("gatherings:create.v2.summary.what.empty");
}

function whenWhereSummary(
  form: GatheringForm,
  { t, fmt }: SummaryContext,
): string {
  const parts: string[] = [];
  const startAt = form.date
    ? new Date(`${form.date}T${form.time || "19:00"}`)
    : null;
  if (startAt && !Number.isNaN(startAt.getTime())) {
    parts.push(
      fmt.date(startAt, { weekday: "short", day: "numeric", month: "short" }),
      fmt.time(startAt),
    );
  }
  const hoodKey = form.hood ? hoodLabelKey(form.hood) : undefined;
  const place = form.venue.trim() || (hoodKey ? t(hoodKey) : form.hood);
  if (place) parts.push(place);
  if (form.repeats) {
    const cadenceKey = CADENCE_OPTIONS.find(
      (option) => option.value === form.cadence,
    )?.labelKey;
    if (cadenceKey) parts.push(t(cadenceKey));
  }
  return parts.length > 0
    ? parts.join(SUMMARY_SEPARATOR)
    : t("gatherings:create.v2.summary.whenWhere.empty");
}

function whoSummary(form: GatheringForm, { t }: SummaryContext): string {
  const capacity = Number.parseInt(form.cap, 10);
  const parts = [
    Number.isFinite(capacity) && capacity > 0
      ? t("gatherings:create.v2.summary.who.spots", { count: capacity })
      : t("gatherings:create.v2.summary.who.noCap"),
    form.costKind === "fixed" && form.cost.trim()
      ? form.cost.trim()
      : t(COST_KIND_LABEL_KEYS[form.costKind]),
    t(audienceScopeLabelKey(form.audienceScope)),
  ];
  if (form.cohostSlugs.length > 0) {
    parts.push(
      t("gatherings:create.v2.summary.who.cohosts", {
        count: form.cohostSlugs.length,
      }),
    );
  }
  return parts.join(SUMMARY_SEPARATOR);
}

function accessSummary(form: GatheringForm, { t }: SummaryContext): string {
  if (form.answeredAccessibilityCount === 0) {
    return t("gatherings:create.v2.summary.access.empty");
  }
  const confirmedCount = ACCESSIBILITY_QUESTIONS.filter(
    (question) => form.accessibilityAnswers[question.slug] === "yes",
  ).length;
  return t("gatherings:create.v2.summary.access.answered", {
    confirmed: confirmedCount,
    answered: form.answeredAccessibilityCount,
    total: ACCESSIBILITY_QUESTIONS.length,
  });
}

function careSummary(form: GatheringForm, { t }: SummaryContext): string {
  const parts: string[] = [];
  if (form.houseRules.trim()) {
    parts.push(t("gatherings:create.v2.summary.care.houseRules"));
  }
  if (form.contentNotes.length > 0) {
    parts.push(
      t("gatherings:create.v2.summary.care.contentNotes", {
        count: form.contentNotes.length,
      }),
    );
  }
  // Access needs are asked on every RSVP (ruling R8), so the count names the
  // questions the host chose: dietary, pronouns and their own. A seeded
  // legacy gathering and a new form then read the same.
  const questionCount =
    (form.rsvpQuestions.dietary ? 1 : 0) +
    (form.rsvpQuestions.pronouns ? 1 : 0) +
    (form.customRsvpQuestion.trim() ? 1 : 0);
  if (questionCount > 0) {
    parts.push(
      t("gatherings:create.v2.summary.care.questions", {
        count: questionCount,
      }),
    );
  }
  return parts.length > 0
    ? parts.join(SUMMARY_SEPARATOR)
    : t("gatherings:create.v2.summary.care.empty");
}

const SUMMARY_BY_CHAPTER = [
  whatSummary,
  whenWhereSummary,
  whoSummary,
  accessSummary,
  careSummary,
];

/** The line a collapsed chapter shows about itself. */
export function chapterSummary(
  form: GatheringForm,
  chapterIndex: number,
  context: SummaryContext,
): string {
  return SUMMARY_BY_CHAPTER[chapterIndex]?.(form, context) ?? "";
}

// ── Moving the host around the page ──────────────────────────────────────

/** Controls a field group can hand focus to: native inputs plus the button
 *  groups and `role="checkbox"` rows the wizard uses for its own choices. */
const FOCUSABLE_IN_FIELD =
  'input:not([type="hidden"]), select, textarea, button, [role="checkbox"], [tabindex]:not([tabindex="-1"])';

/** How long a field flash runs, matching the shell's `.gateFlash`. */
const FLASH_DURATION_MS = 1400;

/** Restart a CSS animation class, even when it is already on the element, and
 *  take it off again after `durationMs` so it can replay next time. */
export function replayAnimationClass(
  element: HTMLElement,
  className: string | undefined,
  durationMs: number,
): void {
  if (!className) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), durationMs);
}

/**
 * Send the host to the field an anchor names: focus it (or its first control),
 * scroll it into view and flash it.
 *
 * Focus goes to the anchor itself when it can take focus (a pledge row) and to
 * its first control otherwise, so arriving means being able to type or press
 * Space straight away. `focusControl` owns the scroll and honours reduced
 * motion. Moved here from `steps/StepRequirement.tsx`.
 */
export function jumpToAnchor(anchor: string, flashClassName?: string): void {
  const field = document.getElementById(anchor);
  if (!field) return;
  const control =
    field.tabIndex >= 0
      ? field
      : field.querySelector<HTMLElement>(FOCUSABLE_IN_FIELD);
  if (!focusControl(control) && typeof field.scrollIntoView === "function") {
    field.scrollIntoView({
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
      block: "center",
    });
  }
  replayAnimationClass(field, flashClassName, FLASH_DURATION_MS);
}

/**
 * Bring a section to the top of the viewport (its CSS `scroll-margin-top`
 * keeps it below the nav) and put focus on `focusTargetId` without the
 * browser's own jump. Used when Continue opens the next chapter: the button
 * that was pressed has just been hidden, so focus has to go somewhere real.
 */
export function revealSection(sectionId: string, focusTargetId: string): void {
  document.getElementById(focusTargetId)?.focus({ preventScroll: true });
  const section = document.getElementById(sectionId);
  if (!section || typeof section.scrollIntoView !== "function") return;
  section.scrollIntoView({
    behavior: prefersReducedMotionNow() ? "auto" : "smooth",
    block: "start",
  });
}

/**
 * `revealSection`, only when the section's top has left the viewport: above
 * the top edge, or under the sticky nav, whose height the section's own
 * `scroll-margin-top` carries.
 */
export function revealSectionIfAbove(
  sectionId: string,
  focusTargetId: string,
): void {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const navOffset =
    Number.parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0;
  if (section.getBoundingClientRect().top >= navOffset) return;
  revealSection(sectionId, focusTargetId);
}

/**
 * Focus the head of the first open chapter, or the first chapter's head while
 * every chapter is closed. For controls that remove themselves when pressed
 * (the draft resume strip, "Same as last time?"), so focus lands on a
 * stable control.
 */
export function focusOpenChapterHead(): void {
  const openChapterIndex = CREATE_GATHERING_CHAPTERS.findIndex(
    (_chapter, chapterIndex) =>
      document
        .getElementById(chapterHeadId(chapterIndex))
        ?.getAttribute("aria-expanded") === "true",
  );
  document
    .getElementById(chapterHeadId(Math.max(openChapterIndex, 0)))
    ?.focus();
}

/** Run once React has committed the render the current handler scheduled
 *  (a chapter body has to be visible before anything inside it can focus). */
export function afterRender(callback: () => void): void {
  window.setTimeout(callback, 0);
}
