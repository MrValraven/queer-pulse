import { apiGetNullable, apiPost } from "../../../shared/api/client";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Mirrors `queerpulse-backend/src/magazine/writer-application-response.ts`.

export type WriterApplicationStatus = "pending" | "approved" | "declined";

export interface WriterApplicationDTO {
  id: string;
  pitchNote: string | null;
  sampleText: string | null;
  sampleLink: string | null;
  status: WriterApplicationStatus;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface CreateWriterApplicationInput {
  pitchNote?: string;
  sampleText?: string;
  sampleLink?: string;
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export const createWriterApplication = (dto: CreateWriterApplicationInput) =>
  apiPost<WriterApplicationDTO>("/magazine/writer-applications", dto);

/** GET /magazine/writer-applications/mine — the caller's latest application, or null. */
export const getMyWriterApplication = () =>
  apiGetNullable<WriterApplicationDTO>("/magazine/writer-applications/mine");
