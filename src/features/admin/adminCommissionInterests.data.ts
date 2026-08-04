import type { AdminCommissionInterestDTO } from "./api/adminCommissionInterests.api";

/**
 * Demo-mode sample of platform-wide commission interests for the admin oversight
 * page, so it renders fully with no backend. Fabricated data — it must never
 * appear as platform truth in live mode (the hook only serves this when
 * `demoMode` is on). Mirrors {@link AdminCommissionInterestDTO}.
 */
export const ADMIN_COMMISSION_INTERESTS: AdminCommissionInterestDTO[] = [
  {
    id: "com_2001",
    member: { slug: "marco", name: "Marco Vieira" },
    commissionTitle: "Portraits for the Pride zine cover",
    commissionCategory: "Photo",
    recipientName: "Inês Marques",
    message: "I shoot medium-format film and would love to collaborate.",
    createdAt: "2026-07-22T09:15:00.000Z",
  },
  {
    id: "com_2002",
    member: { slug: "sofia", name: "Sofia Antunes" },
    commissionTitle: "Original score for the community radio ident",
    commissionCategory: "Music",
    recipientName: "Rui Santos",
    message: null,
    createdAt: "2026-07-19T18:40:00.000Z",
  },
  {
    id: "com_2003",
    member: { slug: "joana", name: "Joana Reis" },
    commissionTitle: "Essay series on chosen family",
    commissionCategory: "Writing",
    recipientName: "Tiago Costa",
    message: "I have three drafts ready to pitch.",
    createdAt: "2026-07-15T12:05:00.000Z",
  },
  {
    id: "com_2004",
    member: { slug: "rui", name: "Rui Santos" },
    commissionTitle: "Poster set for the winter ball",
    commissionCategory: "Design",
    recipientName: "Joana Reis",
    message: null,
    createdAt: "2026-07-10T08:00:00.000Z",
  },
];
