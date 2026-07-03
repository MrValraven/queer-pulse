import type { JoinRequestDTO } from "../../auth/api/joinRequest.api";

/** Demo-mode sample of incoming platform join requests, so the mod review queue
 *  renders fully with no backend. Mirrors {@link JoinRequestDTO}. */
export const JOIN_REQUESTS: JoinRequestDTO[] = [
  {
    id: "jr-marco",
    status: "pending",
    createdAt: "2026-07-01T09:12:00.000Z",
    message:
      "I run a small queer zine in Porto and keep hearing this is where the good people are. I'd love a quieter place to actually talk.",
    applicant: {
      firstName: "Marco",
      lastName: "Vieira",
      email: "marco@example.com",
      mutual: "Inês Martins",
    },
  },
  {
    id: "jr-rui",
    status: "pending",
    createdAt: "2026-06-30T18:40:00.000Z",
    message:
      "New to Lisbon and looking for community that isn't just nightlife. A friend mentioned Devon here.",
    applicant: {
      firstName: "Rui",
      lastName: "Antunes",
      email: "rui@example.com",
      mutual: "Devon Okoro",
    },
  },
  {
    id: "jr-nadia",
    status: "pending",
    createdAt: "2026-06-28T11:05:00.000Z",
    message:
      "Trans organiser, been doing mutual-aid work for years. I want somewhere I can be off the clock and still queer.",
    applicant: {
      firstName: "Nadia",
      lastName: "Lopes",
      email: "nadia@example.com",
      mutual: null,
    },
  },
];
