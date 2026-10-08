import type { ManagedListingItem } from "./managedListings.api";

/**
 * Demo only: the listings the demo member runs, so the gathering form's
 * "Run by one of your businesses" has something to offer with no backend.
 * The walking tour has a meeting point (it prefills a gathering's address);
 * the hairdresser goes to people and has none. Sorted by name, as the
 * endpoint sorts.
 */
export const DEMO_MANAGED_LISTINGS: ManagedListingItem[] = [
  {
    id: "demo-listing-corte-movel",
    ref: "QPL-DEMO-0102",
    slug: "corte-movel",
    name: "Corte Móvel",
    kind: "mobile",
    meetingPoint: null,
  },
  {
    id: "demo-listing-lisboa-arco-iris-walks",
    ref: "QPL-DEMO-0101",
    slug: "lisboa-arco-iris-walks",
    name: "Lisboa Arco-Íris Walks",
    kind: "mobile",
    meetingPoint: {
      address: "Largo da Severa, 1100-588 Lisboa",
      hood: "Mouraria",
      latitude: 38.7153,
      longitude: -9.1352,
    },
  },
];
