import type { FeedMutedSource } from "./api/feedMutes.api";

/**
 * Demo fixture for the "sources you've turned down" list (SOC-18), so the
 * managed list has something to show in the standalone prototype. Live mode
 * reads `GET /feed/mutes` instead and never touches this.
 *
 * Two entries on purpose: one whole community and one single thread, which is
 * exactly the two kinds the feature supports.
 */
export const DEMO_MUTED_SOURCES: FeedMutedSource[] = [
  {
    sourceKind: "community",
    sourceId: "demo-community-1",
    name: "Lisbon Queer Runners",
    link: "/community/lisbon-queer-runners",
    mutedAt: "2026-08-11T09:20:00.000Z",
  },
  {
    sourceKind: "forum_thread",
    sourceId: "demo-thread-1",
    name: "Best rooftop for a first date?",
    link: "/thread/best-rooftop-for-a-first-date",
    mutedAt: "2026-08-04T18:05:00.000Z",
  },
];
