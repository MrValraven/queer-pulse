import type { AdminMagazineSubmissionDTO } from "./api/adminMagazineSubmissions.api";

/**
 * Demo-mode sample of platform-wide magazine story submissions for the admin
 * oversight page, so it renders fully with no backend. Fabricated data — it must
 * never appear as platform truth in live mode (the hook only serves this when
 * `demoMode` is on). Mirrors {@link AdminMagazineSubmissionDTO}.
 */
export const ADMIN_MAGAZINE_SUBMISSIONS: AdminMagazineSubmissionDTO[] = [
  {
    id: "sub_5001",
    submitter: { slug: "joana", name: "Joana Reis" },
    format: "Personal essay",
    workingTitle: "The year I came out to my grandmother",
    pitch: "A tender essay on late-life acceptance across generations.",
    status: "submitted",
    createdAt: "2026-07-25T09:40:00.000Z",
  },
  {
    id: "sub_5002",
    submitter: { slug: "marco", name: "Marco Vieira" },
    format: "Interview",
    workingTitle: "Backstage with the drag houses of Lisbon",
    pitch: "A roundtable with three house mothers on chosen family.",
    status: "in_review",
    createdAt: "2026-07-22T15:10:00.000Z",
  },
  {
    id: "sub_5003",
    submitter: { slug: "sofia", name: "Sofia Antunes" },
    format: "Photo essay",
    workingTitle: "Morning light at the community garden",
    pitch: "Twelve frames of the trans allotment collective at dawn.",
    status: "accepted",
    createdAt: "2026-07-18T07:30:00.000Z",
  },
  {
    id: "sub_5004",
    submitter: { slug: "rui", name: "Rui Santos" },
    format: "Opinion",
    workingTitle: "Why our archives can't wait",
    pitch: "An argument for funding queer memory work now.",
    status: "rejected",
    createdAt: "2026-07-11T12:00:00.000Z",
  },
];
