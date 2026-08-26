import type {
  TransparencyPeriodSelector,
  TransparencyReportDTO,
} from "./api/transparency.api";

/**
 * Demo-mode fixture for the Transparency Report.
 *
 * Shaped to exercise the page's whole vocabulary rather than to flatter it: a
 * running quarter and a finished one, categories above and below the
 * suppression floor, a withheld pair, a period with a publishable overturn rate
 * and a period without one. A demo that only ever shows healthy numbers hides
 * exactly the states the live page has to render well.
 */
const CURRENT: TransparencyReportDTO = {
  period: {
    id: "2026-Q3",
    year: 2026,
    quarter: 3,
    startsAt: "2026-07-01T00:00:00.000Z",
    endsAt: "2026-10-01T00:00:00.000Z",
    coversUntil: "2026-08-25T00:00:00.000Z",
    isComplete: false,
  },
  availablePeriods: [
    { selector: "current", id: "2026-Q3", isComplete: false },
    { selector: "previous", id: "2026-Q2", isComplete: true },
  ],
  generatedAt: "2026-08-25T00:00:00.000Z",
  smallCountFloor: 5,
  reports: {
    received: { value: 63, isSuppressed: false },
    resolved: { value: 58, isSuppressed: false },
    byCategory: [
      { key: "privacy", count: { value: 9, isSuppressed: false } },
      { key: "harassment", count: { value: 27, isSuppressed: false } },
      { key: "impersonation", count: { value: null, isSuppressed: true } },
      { key: "spam", count: { value: 14, isSuppressed: false } },
      { key: "space_safety", count: { value: null, isSuppressed: true } },
      { key: "other", count: { value: 8, isSuppressed: false } },
    ],
    medianHoursToResolution: 4.2,
    p90HoursToResolution: 21.5,
  },
  actions: {
    byType: [
      { key: "dismiss", count: { value: 19, isSuppressed: false } },
      { key: "warn", count: { value: 16, isSuppressed: false } },
      { key: "hide_content", count: { value: 11, isSuppressed: false } },
      { key: "remove_content", count: { value: 7, isSuppressed: false } },
      { key: "restrict", count: { value: 5, isSuppressed: false } },
      { key: "suspend", count: { value: null, isSuppressed: true } },
      { key: "ban", count: { value: null, isSuppressed: true } },
      { key: "escalate", count: { value: 0, isSuppressed: false } },
    ],
    accountsRemoved: { value: null, isSuppressed: true },
  },
  appeals: {
    filed: { value: 12, isSuppressed: false },
    byOutcome: [
      { key: "upheld", count: { value: 6, isSuppressed: false } },
      { key: "overturned", count: { value: null, isSuppressed: true } },
      { key: "awaiting", count: { value: null, isSuppressed: true } },
    ],
    // Fewer than the decided-appeal floor, so no rate is published. The page
    // has to say that plainly, which is the state this fixture exists to show.
    overturnRatePercent: null,
  },
  communities: {
    frozen: { value: 0, isSuppressed: false },
  },
};

const PREVIOUS: TransparencyReportDTO = {
  period: {
    id: "2026-Q2",
    year: 2026,
    quarter: 2,
    startsAt: "2026-04-01T00:00:00.000Z",
    endsAt: "2026-07-01T00:00:00.000Z",
    coversUntil: "2026-07-01T00:00:00.000Z",
    isComplete: true,
  },
  availablePeriods: [
    { selector: "current", id: "2026-Q3", isComplete: false },
    { selector: "previous", id: "2026-Q2", isComplete: true },
  ],
  generatedAt: "2026-08-25T00:00:00.000Z",
  smallCountFloor: 5,
  reports: {
    received: { value: 88, isSuppressed: false },
    resolved: { value: 91, isSuppressed: false },
    byCategory: [
      { key: "privacy", count: { value: 12, isSuppressed: false } },
      { key: "harassment", count: { value: 38, isSuppressed: false } },
      { key: "impersonation", count: { value: 6, isSuppressed: false } },
      { key: "spam", count: { value: 21, isSuppressed: false } },
      { key: "space_safety", count: { value: 5, isSuppressed: false } },
      { key: "other", count: { value: 6, isSuppressed: false } },
    ],
    medianHoursToResolution: 5.1,
    p90HoursToResolution: 28,
  },
  actions: {
    byType: [
      { key: "dismiss", count: { value: 31, isSuppressed: false } },
      { key: "warn", count: { value: 24, isSuppressed: false } },
      { key: "hide_content", count: { value: 18, isSuppressed: false } },
      { key: "remove_content", count: { value: 12, isSuppressed: false } },
      { key: "restrict", count: { value: 9, isSuppressed: false } },
      { key: "suspend", count: { value: 6, isSuppressed: false } },
      { key: "ban", count: { value: 5, isSuppressed: false } },
      { key: "escalate", count: { value: 0, isSuppressed: false } },
    ],
    accountsRemoved: { value: 5, isSuppressed: false },
  },
  appeals: {
    filed: { value: 28, isSuppressed: false },
    byOutcome: [
      { key: "upheld", count: { value: 18, isSuppressed: false } },
      { key: "overturned", count: { value: 5, isSuppressed: false } },
      { key: "awaiting", count: { value: 5, isSuppressed: false } },
    ],
    // 5 overturned out of 23 decided, and both buckets clear the floor, so the
    // rate is publishable. This is the figure the Constitution used to assert
    // from nowhere.
    overturnRatePercent: 22,
  },
  communities: {
    frozen: { value: 0, isSuppressed: false },
  },
};

export const TRANSPARENCY_DEMO_REPORT: Record<
  TransparencyPeriodSelector,
  TransparencyReportDTO
> = {
  current: CURRENT,
  previous: PREVIOUS,
};
