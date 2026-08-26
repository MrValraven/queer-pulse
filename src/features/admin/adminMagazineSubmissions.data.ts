import type { AdminMagazineSubmissionDTO } from "./api/adminMagazineSubmissions.api";

/**
 * Demo-mode sample of platform-wide magazine story submissions for the admin
 * oversight page, so it renders fully with no backend. Fabricated data — it must
 * never appear as platform truth in live mode (the hook only serves this when
 * `demoMode` is on). Mirrors {@link AdminMagazineSubmissionDTO}.
 *
 * The first two rows are still open, so the accept / decline / commission
 * actions render on them; the rest carry a recorded decision and its reply.
 * `sub_5005` keeps the pre-split shape (everything in `pitch`, no deck or
 * body) so the page is exercised against a legacy row too.
 */
export const ADMIN_MAGAZINE_SUBMISSIONS: AdminMagazineSubmissionDTO[] = [
  {
    id: "sub_5001",
    submitter: { slug: "joana", name: "Joana Reis" },
    format: "Personal essay",
    workingTitle: "The year I came out to my grandmother",
    pitch: "A tender essay on late-life acceptance across generations.",
    deck: "She was eighty-one, and she asked me her own questions first.",
    body: "My grandmother kept the kitchen radio on all through the afternoon, and that is where she asked me, between the weather and the news, whether I was going to bring anyone home for Christmas.",
    coverUrl: null,
    status: "submitted",
    decision: null,
    decisionNote: null,
    decidedAt: null,
    commissionedPitchId: null,
    createdAt: "2026-07-25T09:40:00.000Z",
  },
  {
    id: "sub_5002",
    submitter: { slug: "marco", name: "Marco Vieira" },
    format: "Interview",
    workingTitle: "Backstage with the drag houses of Lisbon",
    pitch: "A roundtable with three house mothers on chosen family.",
    deck: "Three house mothers on rent, rehearsal, and who gets fed first.",
    body: "The dressing room at the back of the venue holds four mirrors and, on a good night, eleven people. I asked them what a house is for.",
    coverUrl: null,
    status: "in_review",
    decision: null,
    decisionNote: null,
    decidedAt: null,
    commissionedPitchId: null,
    createdAt: "2026-07-22T15:10:00.000Z",
  },
  {
    id: "sub_5003",
    submitter: { slug: "sofia", name: "Sofia Antunes" },
    format: "Photo essay",
    workingTitle: "Morning light at the community garden",
    pitch: "Twelve frames of the trans allotment collective at dawn.",
    deck: "Twelve frames, one growing season, the same four beds.",
    body: "The gate opens at six. By seven the light has crossed the tomatoes and reached the bench where everybody drinks their coffee standing up.",
    coverUrl: null,
    status: "accepted",
    decision: "commissioned",
    decisionNote:
      "Beautiful. We'd like this for the winter issue — the desk will be in touch about frame selection.",
    decidedAt: "2026-07-20T10:00:00.000Z",
    commissionedPitchId: "pitch_9003",
    createdAt: "2026-07-18T07:30:00.000Z",
  },
  {
    id: "sub_5004",
    submitter: { slug: "rui", name: "Rui Santos" },
    format: "Opinion",
    workingTitle: "Why our archives can't wait",
    pitch: "An argument for funding queer memory work now.",
    deck: "The boxes in the back room are not going to hold much longer.",
    body: "Every archive I have visited this year has the same back room, and the same person keeping it going on their own time.",
    coverUrl: null,
    status: "rejected",
    decision: "declined",
    decisionNote:
      "We ran a close piece on archives last issue. Please send us the next one.",
    decidedAt: "2026-07-14T11:20:00.000Z",
    commissionedPitchId: null,
    createdAt: "2026-07-11T12:00:00.000Z",
  },
  {
    id: "sub_5005",
    submitter: { slug: "ines", name: "Inês Carvalho" },
    format: "Long read",
    workingTitle: "The clinic that stayed open",
    pitch:
      "A report on the volunteer-run clinic that kept its doors open through the funding cut, told through one Tuesday shift.",
    deck: null,
    body: null,
    coverUrl: null,
    status: "submitted",
    decision: null,
    decisionNote: null,
    decidedAt: null,
    commissionedPitchId: null,
    createdAt: "2026-07-09T08:15:00.000Z",
  },
];
