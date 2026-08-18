import type { AdminWriterApplicationDTO } from "./api/adminWriterApplications.api";

export const ADMIN_WRITER_APPLICATIONS: AdminWriterApplicationDTO[] = [
  {
    id: "demo-writer-app-1",
    applicant: {
      slug: "priya-nair",
      name: "Priya Nair",
      avatarUrl: null,
    },
    pitchNote:
      "I've been writing about queer nightlife in Lisbon for two years and want to bring that to the magazine.",
    sampleText:
      "The first time I danced at Trumps, I understood something about belonging that no essay had taught me...",
    sampleLink: null,
    status: "pending",
    reviewNote: null,
    createdAt: "2026-08-15T10:00:00.000Z",
    reviewedAt: null,
  },
  {
    id: "demo-writer-app-2",
    applicant: {
      slug: "leo-marques",
      name: "Leo Marques",
      avatarUrl: null,
    },
    pitchNote: "Long-time reader, first-time pitcher.",
    sampleText: null,
    sampleLink: "https://example.com/leo-marques/portfolio",
    status: "approved",
    reviewNote: null,
    createdAt: "2026-08-10T10:00:00.000Z",
    reviewedAt: "2026-08-12T10:00:00.000Z",
  },
];
