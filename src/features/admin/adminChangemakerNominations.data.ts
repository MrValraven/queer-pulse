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
    createdAt: "2026-07-23T14:30:00.000Z",
  },
  {
    id: "nom_3002",
    nominator: { slug: "ines", name: "Inês Marques" },
    nomineeName: "The Casa Arco-Íris collective",
    createdAt: "2026-07-21T10:12:00.000Z",
  },
  {
    id: "nom_3003",
    nominator: { slug: "marco", name: "Marco Vieira" },
    nomineeName: "Lena Duarte",
    createdAt: "2026-07-18T16:45:00.000Z",
  },
  {
    id: "nom_3004",
    nominator: { slug: "sofia", name: "Sofia Antunes" },
    nomineeName: "Rafael Nunes",
    createdAt: "2026-07-12T09:05:00.000Z",
  },
];
