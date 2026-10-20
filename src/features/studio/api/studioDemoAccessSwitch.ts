import { safeStorage } from "../../../shared/storage/safeStorage";

/** Demo only: `?studioAccess=off` makes `useStudioAccess()` report no grant,
 *  so the Studio teaser card can be reviewed; `?studioAccess=on` restores it.
 *  The choice is kept in this browser so it survives navigation. */
export const DEMO_STUDIO_ACCESS_STORAGE_KEY = "qp.demoStudioAccess.v1";
const SWITCH_PARAM = "studioAccess";

/** Reads the switch. Writing the remembered choice here is idempotent, so a
 *  render that calls it twice lands in the same state. */
export function isDemoStudioAccessOff(
  search: string = typeof window === "undefined" ? "" : window.location.search,
): boolean {
  const requested = new URLSearchParams(search).get(SWITCH_PARAM);
  if (requested === "off") {
    safeStorage.set(DEMO_STUDIO_ACCESS_STORAGE_KEY, "off");
    return true;
  }
  if (requested === "on") {
    safeStorage.remove(DEMO_STUDIO_ACCESS_STORAGE_KEY);
    return false;
  }
  return safeStorage.get(DEMO_STUDIO_ACCESS_STORAGE_KEY) === "off";
}
