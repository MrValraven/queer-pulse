import type { EventBatchTemplateDTO } from "../api/eventBatch.api";

/** The zone every demo batch is read in, the city the demo board lives in. */
export const DEMO_EVENT_BATCH_TIMEZONE = "Europe/Lisbon";

/** The demo member's hosted and co-hosted events (`category: "hosting"` in
 *  `myEvents.mock.ts`), the only events the demo offers as starting events. */
export const DEMO_EVENT_BATCH_TEMPLATE_SLUGS: readonly string[] = [
  "newcomers-mixer-july",
  "trans-joy-picnic",
  "poly-open-discussion",
];

/**
 * What the sparse demo details lack for a template read: times matching the
 * My Events cards, the venue, the cost and the audience. Fictional values
 * only, and every payment field stays null so no showcase money reaches a
 * screenshot. The co-hosted discussion carries a dropped community, so the
 * demo shows the notice a co-host without moderator standing meets.
 */
export const DEMO_EVENT_BATCH_TEMPLATE_EXTRAS: Record<
  string,
  Partial<EventBatchTemplateDTO>
> = {
  "newcomers-mixer-july": {
    startTime: "18:30",
    endTime: "21:00",
    venue: "A Tasca, Mouraria",
    neighbourhood: "Mouraria",
    isOnline: false,
    costKind: "free",
    visibility: "members",
  },
  "trans-joy-picnic": {
    startTime: "17:30",
    endTime: "20:30",
    venue: "Jardim da Estrela",
    neighbourhood: "Estrela",
    isOnline: false,
    costKind: "free",
    visibility: "members",
  },
  "poly-open-discussion": {
    startTime: "19:00",
    endTime: "21:00",
    venue: null,
    neighbourhood: null,
    isOnline: true,
    onlineUrl: "https://video.example.org/poly-circle",
    costKind: "free",
    visibility: "members",
    communityDropped: { name: "Sober Queers", reason: "notModerator" },
  },
};

/** The venue a demo hosting card shows for an online event with no venue. */
export const DEMO_EVENT_BATCH_ONLINE_VENUE = "Online";
