/**
 * The desk's row density, remembered per browser. Storage can be missing or
 * throw (private mode, blocked site data) and the desk must still render, so
 * every read and write is guarded and any failure reads as the default.
 */

export type DeskDensity = "comfortable" | "compact";

/** Where the chosen row density is remembered between visits. */
export const DESK_DENSITY_STORAGE_KEY = "qp.desk.density";

export function readStoredDensity(): DeskDensity {
  try {
    const storedDensity = window.localStorage.getItem(DESK_DENSITY_STORAGE_KEY);
    return storedDensity === "compact" ? "compact" : "comfortable";
  } catch {
    return "comfortable";
  }
}

export function writeStoredDensity(density: DeskDensity): void {
  try {
    window.localStorage.setItem(DESK_DENSITY_STORAGE_KEY, density);
  } catch {
    // Not remembered this time; the choice still applies for this visit.
  }
}
