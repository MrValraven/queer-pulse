import type { AdminIntakeDTO } from "./api/adminIntakes.api";

/**
 * Demo fixture for the intake console. Fabricated submissions standing in for
 * the eleven public/member intake forms plus one governance concern, so the
 * prototype's console renders standalone with no network. Never surfaces in
 * live mode — the hooks only read this when `demoMode` is on, and the live
 * endpoint is admin-scoped anyway.
 *
 * Deliberately spread so every filter has something to show: each of the twelve
 * kinds, all five statuses, signed-in and anonymous submitters, a payload with
 * an unrecognised extra field, a payload from a kind this build has no renderer
 * for, and a reviewed row whose `reviewedBy` is null (rows triaged before
 * ACQ-03 shipped were never backfilled with a reviewer).
 *
 * Dates are fixed in the past so the waiting-time chip shows all three tones.
 */
export const ADMIN_INTAKES: AdminIntakeDTO[] = [
  {
    id: "intake-demo-1",
    kind: "grant",
    submitterId: null,
    submitter: null,
    payload: {
      category: 2,
      projectName: "Binder library for the north side",
      projectSummary:
        "A lending shelf of binders and packers run out of the community room, with a sizing session once a month.",
      applicantName: "Noor Almeida",
      budgetTotal: "€640",
      budgetItems: [
        { item: "First run of binders", amount: "€480" },
        { item: "Storage and laundry", amount: "€160" },
      ],
    },
    status: "new",
    createdAt: "2026-07-14T09:20:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
  },
  {
    id: "intake-demo-2",
    kind: "suggest_edit",
    submitterId: "member-avery",
    submitter: { slug: "avery-santos", name: "Avery Santos", avatarUrl: null },
    payload: {
      term: "Deadname",
      change:
        "The entry reads as if deadnaming is always accidental. Worth saying plainly that it is often deliberate.",
      context: "glossary",
    },
    status: "new",
    createdAt: "2026-08-24T17:05:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
  },
  {
    id: "intake-demo-3",
    kind: "sober_host",
    submitterId: null,
    submitter: null,
    payload: {
      mode: "host",
      name: "Rui Marques",
      detail:
        "I can host a dry board-game evening in Anjos, room for about twelve people, any Wednesday.",
    },
    status: "reviewed",
    createdAt: "2026-08-19T12:00:00.000Z",
    reviewedAt: "2026-08-20T08:30:00.000Z",
    reviewedBy: { id: "admin-1", name: "Mira Lopes" },
  },
  {
    id: "intake-demo-4",
    kind: "panel_signup",
    submitterId: null,
    submitter: null,
    payload: {
      name: "Teresa Nogueira",
      email: "teresa@example.com",
      why: "I have run participatory budgets for a neighbourhood association and would like to read grant applications.",
    },
    status: "new",
    createdAt: "2026-08-21T10:45:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
  },
  {
    id: "intake-demo-5",
    kind: "incubator_cohort",
    submitterId: "member-sam",
    submitter: { slug: "sam-oliveira", name: "Sam Oliveira", avatarUrl: null },
    payload: {
      name: "Sam Oliveira",
      email: "sam@example.com",
      pitch:
        "A repair café that trains queer people in basic electronics repair and pays them for shifts once it breaks even.",
    },
    status: "reviewing",
    createdAt: "2026-08-16T14:10:00.000Z",
    reviewedAt: "2026-08-18T09:00:00.000Z",
    reviewedBy: { id: "admin-1", name: "Mira Lopes" },
  },
  {
    id: "intake-demo-6",
    kind: "incubator_mentor",
    submitterId: null,
    submitter: null,
    payload: {
      name: "Ines Barbosa",
      email: "ines@example.com",
      expertise: "Bookkeeping and small-company tax",
      why: "I did the accounts for two worker co-ops and can give a few hours a month.",
    },
    // A row triaged before ACQ-03 shipped: reviewed, with nobody recorded.
    status: "reviewed",
    createdAt: "2026-07-02T08:00:00.000Z",
    reviewedAt: "2026-07-06T16:20:00.000Z",
    reviewedBy: null,
  },
  {
    id: "intake-demo-7",
    kind: "incubator_session",
    submitterId: "member-robin",
    submitter: { slug: "robin-costa", name: "Robin Costa", avatarUrl: null },
    payload: {
      mentorName: "Ines Barbosa",
      mentorRole: "Bookkeeping",
      when: "Weekday evenings, from September",
      message:
        "I need help working out whether my side project should be a company or stay an association.",
    },
    status: "resolved",
    createdAt: "2026-08-11T19:30:00.000Z",
    reviewedAt: "2026-08-13T11:15:00.000Z",
    reviewedBy: { id: "admin-2", name: "Jo Ferreira" },
  },
  {
    id: "intake-demo-8",
    kind: "culture_suggest_pick",
    submitterId: null,
    submitter: null,
    payload: {
      format: "book",
      title: "Stone Butch Blues",
      author: "Leslie Feinberg",
      why: "It keeps coming up in the club chat and nobody has read it together yet.",
    },
    status: "new",
    createdAt: "2026-08-25T21:12:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
  },
  {
    id: "intake-demo-9",
    kind: "culture_post_project",
    submitterId: "member-kai",
    submitter: {
      slug: "kai-rodrigues",
      name: "Kai Rodrigues",
      avatarUrl: null,
    },
    payload: {
      title: "Zine about the 2001 Lisbon marches",
      description:
        "Twenty pages, riso-printed, interviews with people who were there. Launch planned for spring.",
      lookingFor: ["illustration", "editing"],
    },
    status: "new",
    createdAt: "2026-08-22T13:40:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
  },
  {
    id: "intake-demo-10",
    kind: "culture_submit_work",
    submitterId: null,
    submitter: null,
    payload: {
      title: "Kitchen table, 4am",
      medium: "photography",
      link: "https://example.com/kitchen-table",
      about: "Six photographs from a year of living with three other people.",
      // An extra field no renderer names — the console still shows it.
      instagramHandle: "@kitchentable4am",
    },
    status: "dismissed",
    createdAt: "2026-08-05T07:55:00.000Z",
    reviewedAt: "2026-08-07T10:05:00.000Z",
    reviewedBy: { id: "admin-2", name: "Jo Ferreira" },
  },
  {
    id: "intake-demo-11",
    kind: "culture_submit_playlist",
    submitterId: "member-avery",
    submitter: { slug: "avery-santos", name: "Avery Santos", avatarUrl: null },
    payload: {
      name: "Slow Sunday, loud Monday",
      link: "https://example.com/playlist/slow-sunday",
      vibes: ["tender", "loud"],
      note: "Two halves. The first is for lying down, the second is for the walk home.",
    },
    status: "new",
    createdAt: "2026-08-26T06:30:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
  },
  {
    id: "intake-demo-12",
    kind: "governance_concern",
    submitterId: "member-sam",
    submitter: { slug: "sam-oliveira", name: "Sam Oliveira", avatarUrl: null },
    // Confidential: the console never prints a concern's payload, so what is
    // here is only ever counted, never shown.
    payload: {
      category: "appeal",
      description: "Kept out of the console on purpose.",
    },
    status: "new",
    createdAt: "2026-08-23T09:00:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
  },
  {
    id: "intake-demo-13",
    kind: "volunteer_driver",
    submitterId: null,
    submitter: null,
    // A kind this build has no renderer for: the fallback key/value list is
    // what an admin sees, and it must never crash on an odd shape.
    payload: {
      name: "Pilar Sousa",
      availability: ["saturday", "sunday"],
      hasVan: true,
      radiusKm: 30,
    },
    status: "new",
    createdAt: "2026-08-18T15:25:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
  },
];
