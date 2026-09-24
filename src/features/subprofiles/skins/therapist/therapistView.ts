import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type {
  SkinData,
  TherapistOnline,
  TherapistStatus,
  TherapistTravel,
  TherapistWorksAlongside,
  TherapyFees,
} from "../../api/subprofiles.api";
import {
  buildReimbursement,
  buildSlidingRange,
  buildSpecialtyGroups,
  buildVenue,
  cleanList,
  computeCompleteness,
  keepFilled,
  normalizeFees,
  normalizeTravel,
  parseAmount,
  resolveOnline,
  storedList,
  therapistFirstName,
  toStatus,
  trimText,
  type TherapistCompleteness,
  type TherapistReimbursement,
  type TherapistSpecialtyGroup,
} from "./therapistView.helpers";

export type {
  SpecialtyTone,
  TherapistCompleteness,
  TherapistCompletenessKey,
  TherapistReimbursement,
  TherapistSpecialtyGroup,
} from "./therapistView.helpers";

type LabelValue = { label: string; value: string };

/** Everything the therapist layout renders, derived once from the public
 *  view. Lists are never null (empty when unset); strings are "" when unset.
 *  Section components read this plus `data` for ids, endorsements, avatar. */
export interface TherapistView {
  /** Name to address the therapist by ("Message Sofia"): first word of the
   *  display name without a leading title, or the owner's first name while
   *  the persona is still named after its kind. See `therapistFirstName`. */
  firstName: string;
  portraitUrl: string | null;
  status: TherapistStatus;
  waitNote: string;
  title: string;
  registration: string;
  /** `*word*` marks emphasis; render with `renderEmphasis`. */
  quote: string;
  /** Stored entries: `LANGUAGE_OPTIONS` ids or the therapist's own text.
   *  Render each with `pickDisplayText` (`therapistPickOptions.ts`). */
  languages: string[];
  where: string;
  online: TherapistOnline;
  timezone: string;
  email: string;
  website: string;
  goodToKnow: string;
  hasInPerson: boolean;
  hasOnlineSessions: boolean;
  isOnlineOnly: boolean;
  venue: { name: string; lines: string[] } | null;
  /** Stored entries: `LIVED_OPTIONS` ids or the therapist's own words.
   *  Render each with `pickDisplayText` (`therapistPickOptions.ts`). */
  lived: string[];
  contexts: string[];
  modalities: string[];
  workingStyle: string[];
  notFor: string[];
  boundaries: string[];
  whoFor: string[];
  approach: string[];
  firstSession: { title: string; body: string }[];
  specialtyGroups: TherapistSpecialtyGroup[];
  standardFee: number | null;
  slidingRange: [number, number] | null;
  slidingPlaces: number | null;
  slidingOpen: number | null;
  /** Raw fee small print (rules, receipts, payment ...), as typed. */
  fees: TherapyFees | null;
  feeSchedule: LabelValue[];
  reimbursement: TherapistReimbursement[];
  availabilityHeadline: string;
  /** People on the waitlist; null when no number was given. */
  waiting: number | null;
  waitMoves: string;
  hours: LabelValue[];
  openSlots: string[];
  travel: TherapistTravel | null;
  access: string[];
  accessMissing: string[];
  faq: { question: string; answer: string }[];
  referrals: { name: string; note: string }[];
  worksAlongside: TherapistWorksAlongside[];
  completeness: TherapistCompleteness;
}

export interface MonthlyCostInput {
  standardFee: number;
  sessionsPerMonth: number;
  reimbursedPerSession: number;
  slidingMin: number | null;
}

export interface MonthlyCost {
  /** Sessions times the standard fee. */
  gross: number;
  /** Gross less the reimbursement, floored at 0. */
  net: number;
  /** The same month at the sliding-scale minimum; null without a scale. */
  slidingLow: number | null;
}

/** The cost calculator's month: what the sessions cost, what comes back
 *  from insurance, and the sliding-scale floor. */
export function monthlyCost({
  standardFee,
  sessionsPerMonth,
  reimbursedPerSession,
  slidingMin,
}: MonthlyCostInput): MonthlyCost {
  const reimbursed = reimbursedPerSession * sessionsPerMonth;
  const gross = standardFee * sessionsPerMonth;
  return {
    gross,
    net: Math.max(0, gross - reimbursed),
    slidingLow:
      slidingMin === null
        ? null
        : Math.max(0, slidingMin * sessionsPerMonth - reimbursed),
  };
}

export function buildTherapistView(data: PublicSubprofileView): TherapistView {
  const skinData: SkinData = data.skinData ?? {};
  const facts = skinData.therapist;
  const fees = normalizeFees(skinData.therapyFees);
  const summary = skinData.availabilitySummary;
  const venue = buildVenue(skinData);
  const online = resolveOnline(skinData);
  // The older `practical` block is read only while the new key has never
  // been written (undefined). `null` means the owner cleared the block, and
  // "" inside a block means "not said": neither falls back.
  const isFactsKeyUnwritten = skinData.therapist === undefined;
  const isFeesKeyUnwritten = skinData.therapyFees === undefined;
  const standardFee = parseAmount(
    isFeesKeyUnwritten ? skinData.practical?.fee : fees?.standard,
  );

  const view: Omit<TherapistView, "completeness"> = {
    firstName: therapistFirstName(data),
    portraitUrl: data.avatarUrl,
    status: toStatus(facts?.status),
    waitNote: trimText(facts?.waitNote),
    title: trimText(facts?.title),
    registration: trimText(facts?.registration),
    quote: trimText(facts?.quote),
    languages: storedList(
      isFactsKeyUnwritten ? skinData.practical?.languages : facts?.languages,
    ),
    where: trimText(
      isFactsKeyUnwritten ? skinData.practical?.mode : facts?.where,
    ),
    online,
    timezone: trimText(facts?.timezone),
    email: trimText(facts?.email),
    website: trimText(facts?.website),
    goodToKnow: trimText(facts?.goodToKnow),
    hasInPerson: venue !== null,
    hasOnlineSessions: online === "yes",
    isOnlineOnly: venue === null && online === "yes",
    venue,
    lived: cleanList(skinData.lived),
    contexts: cleanList(skinData.contexts),
    modalities: cleanList(skinData.modalities),
    workingStyle: cleanList(skinData.workingStyle),
    notFor: cleanList(skinData.notFor),
    boundaries: cleanList(skinData.boundaries),
    whoFor: cleanList(skinData.whoFor),
    approach: cleanList(skinData.approach),
    firstSession: keepFilled(skinData.firstSession, "title"),
    specialtyGroups: buildSpecialtyGroups(data.sections),
    standardFee,
    slidingRange: buildSlidingRange(
      fees?.slidingMin,
      fees?.slidingMax,
      standardFee,
    ),
    slidingPlaces: parseAmount(fees?.slidingPlaces),
    slidingOpen: parseAmount(fees?.slidingOpen),
    fees,
    feeSchedule: keepFilled(skinData.feeSchedule, "label"),
    reimbursement: buildReimbursement(skinData.reimbursement),
    availabilityHeadline: trimText(summary?.headline),
    waiting: parseAmount(summary?.waiting),
    waitMoves: trimText(summary?.waitMoves),
    hours: keepFilled(skinData.hours, "label"),
    openSlots: cleanList(skinData.openSlots),
    travel: normalizeTravel(skinData.travel),
    access: cleanList(skinData.access),
    accessMissing: cleanList(skinData.accessMissing),
    faq: keepFilled(skinData.faq, "question"),
    referrals: keepFilled(skinData.referrals, "name"),
    worksAlongside: keepFilled(skinData.worksAlongside, "name"),
  };

  const completeness = computeCompleteness({
    portrait: Boolean(view.portraitUrl),
    quote: view.quote !== "",
    approach: view.approach.length > 0,
    specialties: view.specialtyGroups.length > 0,
    fees:
      view.standardFee !== null ||
      view.slidingRange !== null ||
      view.feeSchedule.length > 0,
    availability:
      view.availabilityHeadline !== "" ||
      view.hours.length > 0 ||
      view.openSlots.length > 0,
    faq: view.faq.length > 0,
    firstSession: view.firstSession.length > 0,
    access: view.access.length > 0 || view.accessMissing.length > 0,
  });

  return { ...view, completeness };
}
