import { MEMBERS } from "../../members/data/members";
import { handleFormatError, normalizeHandle } from "../../../shared/handles";
import type { HandleCheck } from "./handles.api";

/**
 * The demo-mode namespace: every mock member's slug (their username) plus the
 * two seeded standalone subprofile handles. Stands in for the backend `handles`
 * registry so the availability check works with no network in demo mode.
 */
export const DEMO_TAKEN_HANDLES = new Set<string>([
  ...Object.keys(MEMBERS),
  "nightform",
  "grain",
]);

/** Demo equivalent of `GET /handles/check`: format → reserved → taken-set. */
export function checkHandleDemo(name: string): HandleCheck {
  const normalized = normalizeHandle(name);
  const fmt = handleFormatError(normalized);
  if (fmt) return { available: false, reason: fmt };
  if (DEMO_TAKEN_HANDLES.has(normalized)) {
    return { available: false, reason: "taken" };
  }
  return { available: true, reason: null };
}
