import { apiGet } from "../../../shared/api/client";
import type { Paginated } from "../../../shared/api/refs";
import type { JobCardDTO } from "./jobs.api";

// ── The viewer's own postings ────────────────────────────────────────────────
// GET /me/jobs is the "my postings" read that backs PostedJobsProvider's live
// hydration — the roles the current member has published, newest first. Mirrors
// getJobs' Paginated envelope + URLSearchParams style.

/** GET /me/jobs?page= — the current member's own posted jobs. */
export function getMyJobs(page?: number) {
  const q = new URLSearchParams();
  if (page) q.set("page", String(page));
  const qs = q.toString();
  return apiGet<Paginated<JobCardDTO>>(`/me/jobs${qs ? `?${qs}` : ""}`);
}
