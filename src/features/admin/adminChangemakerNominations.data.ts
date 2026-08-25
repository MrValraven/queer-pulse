import type { AdminChangemakerNominationDTO } from "./api/adminChangemakerNominations.api";

/**
 * Demo-mode sample of platform-wide changemaker nominations for the admin
 * oversight page, so it renders fully with no backend. Fabricated data — it must
 * never appear as platform truth in live mode (the hook only serves this when
 * `demoMode` is on). Mirrors {@link AdminChangemakerNominationDTO}.
 */
export const ADMIN_CHANGEMAKER_NOMINATIONS: AdminChangemakerNominationDTO[] = [
  {
    id: "nom_3001",
    nominator: { slug: "tiago", name: "Tiago Costa" },
    nomineeName: "Dr. Amara Okoye",
    reason:
      "She runs the free clinic hours at the trans healthcare community every month, no fanfare, just shows up.",
    status: "pending",
    reviewer: null,
    reviewNote: null,
    reviewedAt: null,
    createdAt: "2026-07-23T14:30:00.000Z",
  },
  {
    id: "nom_3002",
    nominator: { slug: "ines", name: "Inês Marques" },
    nomineeName: "The Casa Arco-Íris collective",
    reason:
      "They've housed a dozen young queer people who got kicked out this year alone, entirely on donations.",
    status: "approved",
    reviewer: { slug: "genesis", name: "QueerPulse Team" },
    reviewNote: "Great fit, reaching out to schedule the interview.",
    reviewedAt: "2026-07-22T09:00:00.000Z",
    createdAt: "2026-07-21T10:12:00.000Z",
  },
  {
    id: "nom_3003",
    nominator: { slug: "marco", name: "Marco Vieira" },
    nomineeName: "Lena Duarte",
    reason:
      "Started the Tuesday support circle that's now the biggest one in the city.",
    status: "pending",
    reviewer: null,
    reviewNote: null,
    reviewedAt: null,
    createdAt: "2026-07-18T16:45:00.000Z",
  },
  {
    id: "nom_3004",
    nominator: { slug: "sofia", name: "Sofia Antunes" },
    nomineeName: "Rafael Nunes",
    reason: null,
    status: "dismissed",
    reviewer: { slug: "genesis", name: "QueerPulse Team" },
    reviewNote:
      "No contact info and we couldn't verify the story, following up.",
    reviewedAt: "2026-07-14T11:30:00.000Z",
    createdAt: "2026-07-12T09:05:00.000Z",
  },
];
