import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * The member's work-profile safety preferences.
 *
 * This is outness-disclosure state: `outAtWork` decides whether a member's
 * queerness is ever surfaced to employers, and `safeOnly` decides whether the
 * jobs board hides unvetted employers from them. Treat every field here as
 * safety-critical — a value the UI shows must always be a value the server
 * actually holds (see `WorkProfileProvider`, which rolls back on a failed PUT).
 */
export type OutAtWork = "out" | "verified" | "private";

/** The only trans-support ids the backend accepts (mirrors `TRANS_SUPPORT`). */
export const TRANS_SUPPORT_IDS = [
  "chosen-name",
  "hide-legal",
  "transition-friendly",
] as const;

export type TransSupportId = (typeof TRANS_SUPPORT_IDS)[number];

export interface WorkPreferencesDTO {
  outAtWork: OutAtWork;
  transSupport: TransSupportId[];
  safeOnly: boolean;
}

/** What a member who has never saved gets — the safest reading of each field. */
export const DEFAULT_WORK_PREFERENCES: WorkPreferencesDTO = {
  outAtWork: "verified",
  transSupport: [],
  safeOnly: true,
};

const OUT_AT_WORK_VALUES = new Set<string>(["out", "verified", "private"]);
const TRANS_SUPPORT_SET = new Set<string>(TRANS_SUPPORT_IDS);

/**
 * Coerce whatever the wire carries into a whole, valid preferences object.
 *
 * A backend ahead of (or behind) this build must never leave the editor showing
 * a disclosure setting that isn't real: an unrecognised `outAtWork` falls back
 * to the default `verified` rather than being displayed as-is, and unknown
 * trans-support ids are dropped rather than rendered as silent no-ops.
 */
export function normalizeWorkPreferences(
  dto:
    | { outAtWork?: string; transSupport?: string[]; safeOnly?: boolean }
    | null
    | undefined,
): WorkPreferencesDTO {
  const outAtWork: OutAtWork =
    dto?.outAtWork && OUT_AT_WORK_VALUES.has(dto.outAtWork)
      ? (dto.outAtWork as OutAtWork)
      : DEFAULT_WORK_PREFERENCES.outAtWork;
  const transSupport = (dto?.transSupport ?? []).filter(
    (id): id is TransSupportId => TRANS_SUPPORT_SET.has(id),
  );
  return {
    outAtWork,
    transSupport,
    safeOnly:
      typeof dto?.safeOnly === "boolean"
        ? dto.safeOnly
        : DEFAULT_WORK_PREFERENCES.safeOnly,
  };
}

/** GET /me/work-preferences — defaults when the member has never saved. */
export async function getWorkPreferences(): Promise<WorkPreferencesDTO> {
  const res = await apiGet<Partial<WorkPreferencesDTO>>("/me/work-preferences");
  return normalizeWorkPreferences(res);
}

/** PUT /me/work-preferences — the whole object, every time. */
export async function putWorkPreferences(
  dto: WorkPreferencesDTO,
): Promise<WorkPreferencesDTO> {
  const res = await apiPut<Partial<WorkPreferencesDTO>>(
    "/me/work-preferences",
    dto,
  );
  return normalizeWorkPreferences(res);
}
