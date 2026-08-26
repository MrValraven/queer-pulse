import type {
  ArticleLifecycleRecordDTO,
  LifecycleDeskDTO,
} from "../api/lifecycle.api";

/**
 * CON-16 — the demo lifecycle desk. Deliberately the four situations the
 * feature exists for, so the prototype shows the whole shape without a
 * backend: a legal guide the law overtook, a piece a newer one replaced, a
 * service directory whose promised re-check is overdue, and one whose re-check
 * is coming up.
 *
 * Demo only. The live desk reads `GET /magazine/admin/lifecycle`; nothing here
 * is ever imported from a live path.
 */
const DEMO_RECORDS: ArticleLifecycleRecordDTO[] = [
  {
    articleId: "demo-lifecycle-1",
    pieceId: "demo-piece-1",
    slug: "changing-your-name-in-portugal",
    title: "Changing your name in Portugal",
    section: "Service",
    publishedAt: "2024-03-12T09:00:00.000Z",
    lifecycle: "under_review",
    lifecycleNote:
      "The name-change process changed in March; we are checking every step against the current rules.",
    lifecycleChangedAt: "2026-08-02T10:00:00.000Z",
    reviewDueOn: "2026-08-18",
    reviewDueInDays: -8,
    supersededBy: null,
    locale: "en",
    translationOfSlug: null,
  },
  {
    articleId: "demo-lifecycle-2",
    pieceId: "demo-piece-2",
    slug: "where-to-get-tested-2024",
    title: "Where to get tested, 2024",
    section: "Service",
    publishedAt: "2024-06-01T09:00:00.000Z",
    lifecycle: "superseded",
    lifecycleNote: "",
    lifecycleChangedAt: "2026-07-20T10:00:00.000Z",
    reviewDueOn: null,
    reviewDueInDays: null,
    supersededBy: {
      slug: "where-to-get-tested",
      title: "Where to get tested",
    },
    locale: "en",
    translationOfSlug: null,
  },
  {
    articleId: "demo-lifecycle-3",
    pieceId: "demo-piece-3",
    slug: "the-night-the-bar-closed",
    title: "The night the bar closed",
    section: "Reported",
    publishedAt: "2023-11-04T09:00:00.000Z",
    lifecycle: "archived",
    lifecycleNote:
      "A record of one November. The venues and the people in it have moved on.",
    lifecycleChangedAt: "2026-05-11T10:00:00.000Z",
    reviewDueOn: null,
    reviewDueInDays: null,
    supersededBy: null,
    locale: "en",
    translationOfSlug: null,
  },
  {
    articleId: "demo-lifecycle-4",
    pieceId: "demo-piece-4",
    slug: "who-pays-for-hormones",
    title: "Who pays for hormones",
    section: "Reported",
    publishedAt: "2026-02-18T09:00:00.000Z",
    lifecycle: "live",
    lifecycleNote: "",
    lifecycleChangedAt: null,
    reviewDueOn: "2026-09-10",
    reviewDueInDays: 15,
    supersededBy: null,
    locale: "en",
    translationOfSlug: null,
  },
];

export function buildDemoLifecycleDesk(): LifecycleDeskDTO {
  return {
    dueForReview: DEMO_RECORDS.filter(
      (record) => record.reviewDueInDays !== null,
    ).sort(
      (left, right) =>
        (left.reviewDueInDays ?? 0) - (right.reviewDueInDays ?? 0),
    ),
    flagged: DEMO_RECORDS.filter((record) => record.lifecycle !== "live"),
    counts: {
      live: 42,
      underReview: 1,
      archived: 1,
      superseded: 1,
      overdue: 1,
    },
  };
}
