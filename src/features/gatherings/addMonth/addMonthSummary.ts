import type { Language, TFunction } from "../../../shared/i18n/types";
import { ACCESSIBILITY_QUESTIONS } from "../../marketing/listBusiness/listingAccessibility.data";
import type {
  EventBatchTemplateDTO,
  EventBatchTemplateOption,
} from "../api/eventBatch.api";
import { audienceScopeLabelKey } from "../audienceScope.data";
import { hoodLabelKey } from "../createGathering.data";
import { findFamily, formatLabel } from "../gatheringCatalog";
import {
  CONTENT_NOTE_LABEL_KEYS,
  COST_KIND_LABEL_KEYS,
  rsvpCutoffToOptionValue,
} from "../gatheringExtras";
import { paymentDetailsPayload, paymentLinkHost } from "../paymentDetails";
import { ONLINE_HOOD_VALUE } from "../steps/dateNotes.data";
import { RSVP_CUTOFF_OPTIONS } from "../steps/whoChapter.data";
import { formatRowDate, wallClockNow } from "./addMonthDates";
import {
  costValuesFromTemplate,
  placeValuesFromTemplate,
  type AddMonthCostValues,
  type AddMonthPlaceValues,
  type AddMonthTimes,
} from "./addMonthState";

// ── Add a month of events: what every date shares ──────────────────────────
// The summary under the template picker reads what the batch copies from the
// starting event, with the host's place and cost edits read over it.

const KEY_PREFIX = "gatherings:addMonth.template.";
const PART_SEPARATOR = " · ";

/** One line of the summary list: a label key and the value it reads. */
export interface AddMonthSummaryRow {
  id: string;
  labelKey: string;
  value: string;
}

/** The host's edits on top of the template. Null keeps the template's. */
export interface AddMonthSummaryOverrides {
  place: AddMonthPlaceValues | null;
  cost: AddMonthCostValues | null;
  times: AddMonthTimes;
}

function summaryKey(suffix: string): string {
  return `${KEY_PREFIX}summary.${suffix}`;
}

function formatText(template: EventBatchTemplateDTO, t: TFunction): string {
  if (template.eventType?.trim()) return formatLabel(t, template.eventType);
  const family = findFamily(template.gatheringFamily);
  return family ? t(family.nameKey) : formatLabel(t, null);
}

function placeText(place: AddMonthPlaceValues, t: TFunction): string {
  if (place.hood === ONLINE_HOOD_VALUE) return t(`${KEY_PREFIX}online`);
  // A place with no venue name still reads by its street address.
  const venueText =
    place.venue.trim() ||
    (place.venueListing?.name ?? "") ||
    place.address.trim();
  const hoodKey = place.hood ? hoodLabelKey(place.hood) : undefined;
  const hoodText = hoodKey ? t(hoodKey) : place.hood.trim();
  const parts = [venueText, hoodText].filter((part) => part !== "");
  return parts.length > 0 ? parts.join(PART_SEPARATOR) : t(summaryKey("none"));
}

function timesText(times: AddMonthTimes, t: TFunction): string {
  return times.endTime
    ? t(summaryKey("times"), { start: times.startTime, end: times.endTime })
    : t(summaryKey("timesNoEnd"), { start: times.startTime });
}

function costText(cost: AddMonthCostValues, t: TFunction): string {
  const kindLabel = t(COST_KIND_LABEL_KEYS[cost.costKind]);
  const writtenCost = cost.cost.trim();
  if (cost.costKind === "free" || writtenCost === "") return kindLabel;
  if (cost.costKind === "fixed") return writtenCost;
  return `${kindLabel}${PART_SEPARATOR}${writtenCost}`;
}

function paymentText(cost: AddMonthCostValues, t: TFunction): string {
  const payment = paymentDetailsPayload(
    cost.costKind,
    cost.paymentUrl,
    cost.paymentInstructions,
  );
  const linkText = payment.paymentUrl
    ? (paymentLinkHost(payment.paymentUrl) ?? payment.paymentUrl)
    : "";
  const parts = [linkText, payment.paymentInstructions ?? ""].filter(
    (part) => part !== "",
  );
  return parts.length > 0 ? parts.join(PART_SEPARATOR) : t(summaryKey("none"));
}

function rsvpCutoffText(template: EventBatchTemplateDTO, t: TFunction): string {
  const optionValue = rsvpCutoffToOptionValue(template.rsvpCutoff);
  const option = RSVP_CUTOFF_OPTIONS.find(
    (cutoffOption) => cutoffOption.value === optionValue,
  );
  return option ? t(option.labelKey) : t(summaryKey("none"));
}

function careNotesText(template: EventBatchTemplateDTO, t: TFunction): string {
  const labels = template.contentNotes.map((note) =>
    t(CONTENT_NOTE_LABEL_KEYS[note]),
  );
  return labels.length > 0 ? labels.join(", ") : t(summaryKey("none"));
}

function accessibilityText(
  template: EventBatchTemplateDTO,
  t: TFunction,
): string {
  const answers = template.accessibility.answers;
  const answeredCount = ACCESSIBILITY_QUESTIONS.filter((question) => {
    const answer = answers[question.slug];
    return answer === "yes" || answer === "no";
  }).length;
  return t(summaryKey("accessibilityAnswered"), {
    answered: answeredCount,
    total: ACCESSIBILITY_QUESTIONS.length,
  });
}

/** Every line of the summary, in reading order. */
export function templateSummaryRows(
  template: EventBatchTemplateDTO,
  overrides: AddMonthSummaryOverrides,
  t: TFunction,
): AddMonthSummaryRow[] {
  const place = overrides.place ?? placeValuesFromTemplate(template);
  // A legacy template with a null kind and a written cost reads as a fixed
  // price (`costKindOfTemplate`, through `costValuesFromTemplate`).
  const cost = overrides.cost ?? costValuesFromTemplate(template);
  const none = t(summaryKey("none"));
  const values: [string, string][] = [
    ["format", formatText(template, t)],
    ["place", placeText(place, t)],
    ["times", timesText(overrides.times, t)],
    ["cost", costText(cost, t)],
    ["payment", paymentText(cost, t)],
    ["rsvpCutoff", rsvpCutoffText(template, t)],
    [
      "capacity",
      template.capacity !== null && template.capacity > 0
        ? String(template.capacity)
        : t(summaryKey("noLimit")),
    ],
    ["visibility", t(audienceScopeLabelKey(template.visibility))],
    ["community", template.community?.name ?? none],
    ["runBy", template.runByListing?.name ?? none],
    ["careNotes", careNotesText(template, t)],
    ["houseRules", template.houseRules?.trim() || none],
    ["accessibility", accessibilityText(template, t)],
  ];
  return values.map(([id, value]) => ({
    id,
    labelKey: summaryKey(`row.${id}`),
    value,
  }));
}

/** A named notice, or its unnamed variant when the stored name is blank. */
function namedNotice(
  key: string,
  name: string | null | undefined,
  t: TFunction,
  valueName = "name",
): string {
  const trimmedName = name?.trim() ?? "";
  return trimmedName
    ? t(key, { [valueName]: trimmedName })
    : t(`${key}Unnamed`);
}

/** What the server dropped from the starting event for this host, one
 *  sentence each: the run-by business, the community, the venue's link. The
 *  venue notice drops out once the host has edited the place, since the
 *  batch then sends the host's own place. */
export function templateDropNotices(
  template: EventBatchTemplateDTO,
  t: TFunction,
  editedPlace: AddMonthPlaceValues | null = null,
): string[] {
  const notices: string[] = [];
  if (template.runByDropped) {
    const { name, reason } = template.runByDropped;
    notices.push(namedNotice(`${KEY_PREFIX}notice.runBy.${reason}`, name, t));
  }
  if (template.communityDropped) {
    const { name, reason } = template.communityDropped;
    notices.push(
      namedNotice(`${KEY_PREFIX}notice.community.${reason}`, name, t),
    );
  }
  if (template.venueListingDropped && editedPlace === null) {
    notices.push(
      namedNotice(`${KEY_PREFIX}notice.venueLink`, template.venue, t, "venue"),
    );
  }
  return notices;
}

/** The zone the device reads dates in, for an option that carries none. */
function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** "Fri 7 Nov": the day a picker option starts on, read on the wall clock of
 *  its own zone (the device zone when it has none), with the year added
 *  ("Fri 7 Nov 2025") when it differs from the current one there. Empty for
 *  an unreadable start. */
export function templateOptionDate(
  option: EventBatchTemplateOption,
  language: Language,
  now: Date = new Date(),
): string {
  const startAt = new Date(option.startAt);
  if (Number.isNaN(startAt.getTime())) return "";
  const zone = option.timezone ?? deviceTimeZone();
  const startDate = wallClockNow(zone, startAt).date;
  const dayText = formatRowDate(startDate, language);
  const startYear = startDate.slice(0, 4);
  const isOtherYear = startYear !== wallClockNow(zone, now).date.slice(0, 4);
  return isOtherYear ? `${dayText} ${startYear}` : dayText;
}
