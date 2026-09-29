import type { AmbassadorIdentity } from "./ambassadors.api";

/**
 * Who is a QueerPulse Ambassador in demo mode: the demo fallback for
 * `GET /platform/ambassadors`, in the same slug-keyed shape the live map uses.
 * Keys are member slugs from `features/members/data/members.ts`.
 *
 * Beatriz, Diogo and Carla are on no staff roster, so they wear the tag. Inês
 * is here on purpose as well: she holds the badged `housing_moderator` grant in
 * `shared/staff/staffRegistry.data.ts`, so she is the demo of the staff-wins
 * rule and shows her staff badge alone.
 *
 * Callers that want the slugs (the directory's ambassador filter) read
 * `Object.keys(DEMO_AMBASSADORS)`.
 */
export const DEMO_AMBASSADORS: Record<string, AmbassadorIdentity> = {
  beatriz: { focusArea: "arts_and_culture", since: "2026-03-12T10:00:00.000Z" },
  diogo: { focusArea: "nightlife_safety", since: "2026-06-18T10:00:00.000Z" },
  carla: { focusArea: "work_and_careers", since: "2025-11-04T10:00:00.000Z" },
  ines: { focusArea: "housing", since: "2026-01-20T10:00:00.000Z" },
};
