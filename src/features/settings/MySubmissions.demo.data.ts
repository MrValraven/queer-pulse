import type { MyResourceSuggestionDTO } from "../resources/api/resourceSuggestions.api";

/**
 * Demo-only resource suggestions for `/account/submissions`.
 *
 * `useMyResourceSuggestions` is `enabled: !demoMode` and answers an empty list
 * in demo, matching `useResourceListings`, and it must stay that way: a live
 * hook fabricating rows is how mock data leaks into a real member's page. So
 * the fixture lives here instead, next to the only page that wants it, and is
 * pulled in through a dynamic import that never runs on the live path.
 *
 * One row per status, `archived` included, because that state emits no
 * notification at all and this page is the only place it is ever visible.
 */
export const DEMO_MY_RESOURCE_SUGGESTIONS: MyResourceSuggestionDTO[] = [
  {
    id: "demo-suggestion-pending",
    category: "sexual_health_testing",
    name: "Clinica Aurora, rapid testing",
    description:
      "Walk-in rapid testing on Wednesday evenings, no appointment and no ID needed.",
    phone: null,
    email: "ola@example.org",
    website: "https://example.org/aurora",
    createdAt: "2026-08-24T09:12:00.000Z",
    status: "pending",
    decidedAt: null,
    decisionNote: null,
  },
  {
    id: "demo-suggestion-approved",
    category: "legal_aid",
    name: "Nucleo Juridico Trans",
    description:
      "Free name and gender-marker paperwork clinic, second Saturday of the month.",
    phone: "+351 210 000 000",
    email: null,
    website: "https://example.org/nucleo",
    createdAt: "2026-08-12T17:40:00.000Z",
    status: "approved",
    decidedAt: "2026-08-15T10:05:00.000Z",
    decisionNote: "Confirmed with the coordinator. Listed under Legal aid.",
  },
  {
    id: "demo-suggestion-declined",
    category: "legal_aid",
    name: "Consultas online, sem morada",
    description: "Remote-only legal advice with no address and no phone line.",
    phone: null,
    email: null,
    website: null,
    createdAt: "2026-07-30T11:00:00.000Z",
    status: "declined",
    decidedAt: "2026-08-02T14:20:00.000Z",
    decisionNote:
      "We could not reach anyone at this organisation to confirm it is still running.",
  },
  {
    id: "demo-suggestion-archived",
    category: "sexual_health_testing",
    name: "Centro de Saude do Lumiar",
    description: "Testing hours at the Lumiar health centre.",
    phone: null,
    email: null,
    website: null,
    createdAt: "2026-07-18T08:30:00.000Z",
    status: "archived",
    decidedAt: "2026-07-19T09:00:00.000Z",
    decisionNote: null,
  },
];
