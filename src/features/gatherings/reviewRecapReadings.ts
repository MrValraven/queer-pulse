import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { audienceScopeLabelKey } from "./audienceScope.data";
import { langLabelKey } from "./createGathering.data";
import type { ReadinessItem } from "./createGatheringChapters";
import {
  CONTENT_NOTE_LABEL_KEYS,
  COST_KIND_LABEL_KEYS,
  RSVP_QUESTION_KEYS,
  rsvpCutoffToOptionValue,
} from "./gatheringExtras";
import { gatheringWhen } from "./gatheringSchedule";
import { RSVP_QUESTION_CHIP_KEYS } from "./preview/gatheringPreview.data";
import { previewRepeatTag } from "./preview/gatheringPreviewReading";
import { scheduleInstants } from "./steps/schedulePair";
import { RSVP_CUTOFF_OPTIONS } from "./steps/whoChapter.data";
import type { GatheringForm } from "./useGatheringForm";

/**
 * Pure readings of the form for the review chapter's recap rows. Each returns
 * the text a row shows, or "" when the host left it empty, which the row
 * prints as a muted "Not added". The shapes follow the preview card's own
 * readings (`preview/gatheringPreviewReading.ts`) so the recap and the card
 * word a value the same way.
 */

/** The start date the recap prints: weekday, day and month in full. A span of
 *  two days or more prints as a range (`gatheringWhen`). */
const REVIEW_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
};

const LIST_SEPARATOR = ", ";

/** "Thursday 18 September · 19:00 – 22:00", with the next-day note when the
 *  gathering runs past midnight. */
export function reviewWhenText(
  form: GatheringForm,
  startAt: Date | null,
  fmt: Formatters,
  t: TFunction,
): string {
  if (!startAt) return "";
  // The same end instant chapter 2's gate and the preview card read.
  const { endInstant } = scheduleInstants(form);
  const hasReadableEnd = form.scheduleValid && endInstant !== null;
  const when = gatheringWhen(
    startAt,
    hasReadableEnd ? endInstant : null,
    fmt,
    t,
    REVIEW_DATE_OPTIONS,
  );
  const clockLine = when.nextDayNote
    ? t("gatherings:create.v2.preview.timeWithNote", {
        time: when.timeText,
        note: when.nextDayNote,
      })
    : when.timeText;
  return t("gatherings:create.v2.preview.dateAndTime", {
    date: when.dateText,
    time: clockLine,
  });
}

/** "Weekly · 8 dates", or the one-date line while repeats are off. */
export function reviewRepeatText(
  form: GatheringForm,
  occurrenceCount: number,
  t: TFunction,
): string {
  if (!form.repeats) return t("gatherings:create.v2.review.value.oneDate");
  return previewRepeatTag(form, occurrenceCount, t) ?? "";
}

export function reviewLanguageText(form: GatheringForm, t: TFunction): string {
  if (!form.lang) return "";
  return t(langLabelKey(form.lang) ?? form.lang);
}

/** "14 spots", or the no-cap line the collapsed Who chapter also reads. */
export function reviewSpotsText(form: GatheringForm, t: TFunction): string {
  const capacity = Number.parseInt(form.cap, 10);
  return Number.isFinite(capacity) && capacity > 0
    ? t("gatherings:create.v2.summary.who.spots", { count: capacity })
    : t("gatherings:create.v2.summary.who.noCap");
}

export function reviewCohostsText(form: GatheringForm): string {
  return form.cohosts.map((cohost) => cohost.name).join(LIST_SEPARATOR);
}

export function reviewContentNotesText(
  form: GatheringForm,
  t: TFunction,
): string {
  return form.contentNotes
    .map((noteKey) => t(CONTENT_NOTE_LABEL_KEYS[noteKey]))
    .join(LIST_SEPARATOR);
}

/** What it costs, as the collapsed Who chapter words it: the host's own
 *  amount for a fixed price, the cost kind's label otherwise. */
export function reviewCostText(form: GatheringForm, t: TFunction): string {
  return form.costKind === "fixed" && form.cost.trim()
    ? form.cost.trim()
    : t(COST_KIND_LABEL_KEYS[form.costKind]);
}

export function reviewVisibilityText(
  form: GatheringForm,
  t: TFunction,
): string {
  return t(audienceScopeLabelKey(form.audienceScope));
}

/** The "RSVPs close" option the host picked, in the select's own words. */
export function reviewRsvpCutoffText(
  form: GatheringForm,
  t: TFunction,
): string {
  const optionValue = rsvpCutoffToOptionValue(form.rsvpCutoff);
  const labelKey = RSVP_CUTOFF_OPTIONS.find(
    (option) => option.value === optionValue,
  )?.labelKey;
  return labelKey ? t(labelKey) : "";
}

/** The RSVP questions in the order the form asks them: the ones the host
 *  switched on, and access needs, which every RSVP asks (ruling R8), marked as
 *  always asked. The host's own question has a row of its own. */
export function reviewRsvpQuestionsText(
  form: GatheringForm,
  t: TFunction,
): string {
  return RSVP_QUESTION_KEYS.filter(
    (key) => key === "access" || form.rsvpQuestions[key],
  )
    .map((key) =>
      key === "access"
        ? t("gatherings:create.v2.review.value.alwaysAsked", {
            question: t(RSVP_QUESTION_CHIP_KEYS[key]),
          })
        : t(RSVP_QUESTION_CHIP_KEYS[key]),
    )
    .join(LIST_SEPARATOR);
}

/** The host's own RSVP question in quotes, or "" without one. */
export function reviewCustomQuestionText(
  form: GatheringForm,
  t: TFunction,
): string {
  const question = form.customRsvpQuestion.trim();
  return question
    ? t("gatherings:create.v2.review.value.quoted", { text: question })
    : "";
}

/** The unmet readiness row about one of these fields, if there is one. A
 *  recap row uses it to offer a jump to the field it reads. */
export function unmetItemFor(
  items: readonly ReadinessItem[],
  anchors: readonly string[],
): ReadinessItem | undefined {
  return items.find((item) => !item.isMet && anchors.includes(item.anchor));
}
