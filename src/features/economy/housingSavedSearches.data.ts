import type { HousingSavedSearchDTO } from "./api/housingSavedSearches.api";

/** Demo seed for the saved-searches list — so the prototype shows the feature
 * working. Copied into a mutable in-session store by the hook; never networked. */
export const DEMO_SAVED_SEARCHES: HousingSavedSearchDTO[] = [
  {
    id: "demo-saved-1",
    name: "One-bed, Príncipe Real, under €1,200",
    criteria: {
      type: "sublet",
      area: "Misericórdia",
      priceMax: 1200,
      bedroomsMin: 1,
    },
    alertsEnabled: true,
    createdAt: "2026-08-01T10:00:00.000Z",
  },
];
