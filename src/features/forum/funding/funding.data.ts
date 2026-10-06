import { routes } from "../../../app/routeMap";
import type {
  AskBeneficiary,
  AskPurpose,
  FundingEligibility,
  FundingListView,
  FundingScope,
  FundingWireView,
} from "./funding.types";

export const FUNDING_CATEGORY_ID = "funding";

/** The seeded topic's TAG. Topic follows are matched on the tag
 *  (`topic-post-link.service.ts` emits `topicSlug: topic.tag`), and the
 *  server adds this tag to every open call. */
export const OPEN_CALLS_TOPIC_TAG = "open-call";

/** "Follow new calls" says what it did in its own words, in place of the
 *  topic page's "#open-call" toast. */
export const FOLLOW_TOAST_KEYS = {
  follow: "forum:funding.follow.followedToast",
  unfollow: "forum:funding.follow.unfollowedToast",
};

/** Deadlines are entered and shown in Lisbon time; reminders run on it. */
export const LISBON_TIME_ZONE = "Europe/Lisbon";

/** Where the retired `/work/grants` board now points. */
export const FUNDING_OPEN_CALLS_HREF = `${routes.forum}?category=${FUNDING_CATEGORY_ID}&fundingView=open`;

export const FUNDING_ELIGIBILITIES: readonly FundingEligibility[] = [
  "individuals",
  "collectives",
  "associations",
  "companies",
  "students",
];
export const FUNDING_SCOPES: readonly FundingScope[] = [
  "local",
  "national",
  "eu",
  "international",
];
export const ASK_PURPOSES: readonly AskPurpose[] = [
  "healthcare",
  "housing",
  "legal",
  "emergency",
  "project",
  "event",
];
export const ASK_BENEFICIARIES: readonly AskBeneficiary[] = [
  "self",
  "someone_i_know",
  "project",
];
export const FUNDING_LIST_VIEWS: readonly FundingListView[] = [
  "all",
  "open",
  "closing",
  "asks",
  "discussion",
];
/** The views that list calls, and so offer the eligibility and scope chips. */
export const CALL_LIST_VIEWS: readonly FundingListView[] = ["open", "closing"];
/** The views the server orders itself (by deadline or approval), where the
 *  sort tabs mean nothing. */
export const SERVER_ORDERED_VIEWS: readonly FundingListView[] = [
  "open",
  "closing",
  "asks",
];

/** What each Funding & Grants view says when it has nothing to list. */
export const FUNDING_EMPTY_COPY_KEYS: Record<
  FundingWireView,
  { titleKey: string; bodyKey: string }
> = {
  open: {
    titleKey: "forum:funding.empty.open.title",
    bodyKey: "forum:funding.empty.open.body",
  },
  closing: {
    titleKey: "forum:funding.empty.closing.title",
    bodyKey: "forum:funding.empty.closing.body",
  },
  asks: {
    titleKey: "forum:funding.empty.asks.title",
    bodyKey: "forum:funding.empty.asks.body",
  },
  discussion: {
    titleKey: "forum:funding.empty.discussion.title",
    bodyKey: "forum:funding.empty.discussion.body",
  },
};

/** LOCKSTEP with the backend allow-list. A host matches when it equals an
 *  entry or "www." plus an entry, and nothing else. */
export const FUNDRAISING_HOSTS = [
  "ppl.pt",
  "gofundme.com",
  "opencollective.com",
  "ko-fi.com",
  "patreon.com",
  "liberapay.com",
] as const;

export const ELIGIBILITY_LABEL_KEYS: Record<FundingEligibility, string> = {
  individuals: "forum:funding.eligibility.individuals",
  collectives: "forum:funding.eligibility.collectives",
  associations: "forum:funding.eligibility.associations",
  companies: "forum:funding.eligibility.companies",
  students: "forum:funding.eligibility.students",
};
export const SCOPE_LABEL_KEYS: Record<FundingScope, string> = {
  local: "forum:funding.scope.local",
  national: "forum:funding.scope.national",
  eu: "forum:funding.scope.eu",
  international: "forum:funding.scope.international",
};
export const PURPOSE_LABEL_KEYS: Record<AskPurpose, string> = {
  healthcare: "forum:funding.purpose.healthcare",
  housing: "forum:funding.purpose.housing",
  legal: "forum:funding.purpose.legal",
  emergency: "forum:funding.purpose.emergency",
  project: "forum:funding.purpose.project",
  event: "forum:funding.purpose.event",
};
export const BENEFICIARY_LABEL_KEYS: Record<AskBeneficiary, string> = {
  self: "forum:funding.beneficiary.self",
  someone_i_know: "forum:funding.beneficiary.someoneIKnow",
  project: "forum:funding.beneficiary.project",
};
export const LIST_VIEW_LABEL_KEYS: Record<FundingListView, string> = {
  all: "forum:funding.view.all",
  open: "forum:funding.view.open",
  closing: "forum:funding.view.closing",
  asks: "forum:funding.view.asks",
  discussion: "forum:funding.view.discussion",
};

export const DAY_MS = 24 * 60 * 60 * 1000;
export const CLOSING_SOON_MS = 7 * DAY_MS;
/** Rolling calls leave the Open view after 183 days without an update. */
export const STALE_ROLLING_MS = 183 * DAY_MS;
/** How far ahead a changed date may sit (Plan 1, spec delta 12). The backend
 *  allows exactly 730 days for a call deadline and 365 days for a fundraiser
 *  end date, so the composer uses the same whole-day limits. */
export const CALL_DEADLINE_MAX_MS = 730 * DAY_MS;
export const ASK_END_MAX_MS = 365 * DAY_MS;

function pickKnown<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
): T | null {
  return allowed.find((candidate) => candidate === raw) ?? null;
}

export function parseFundingListView(raw: string | null): FundingListView {
  return pickKnown(raw, FUNDING_LIST_VIEWS) ?? "all";
}

export function parseEligibility(raw: readonly string[]): FundingEligibility[] {
  return FUNDING_ELIGIBILITIES.filter((value) => raw.includes(value));
}

export function parseScope(raw: string | null): FundingScope | null {
  return pickKnown(raw, FUNDING_SCOPES);
}

export function parseAskPurpose(raw: string | null): AskPurpose | null {
  return pickKnown(raw, ASK_PURPOSES);
}

export function parseBeneficiary(raw: string | null): AskBeneficiary | null {
  return pickKnown(raw, ASK_BENEFICIARIES);
}
