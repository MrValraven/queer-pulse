import { useContext } from "react";
import { ProfileDataContext } from "../../app/providers/useProfile";
import type { SubprofileKind } from "./api/subprofiles.api";
import { personaKindsForProfessions } from "./professionKinds.data";

/** At most this many suggestions, so the row stays a shortcut rather than a
 *  second picker. */
export const MAX_SUGGESTED_KINDS = 4;

/**
 * The persona kinds the signed-in member's own work profile points at
 * (`profession[]`, through the profession → kind crosswalk), best fit first.
 * Reads the profile context directly and tolerates its absence, so the create
 * picker still renders (with no suggestions) outside a `ProfileProvider`.
 */
export function useSuggestedPersonaKinds(): SubprofileKind[] {
  const profileData = useContext(ProfileDataContext);
  const professions = profileData?.profile?.profession ?? [];
  return personaKindsForProfessions(professions).slice(0, MAX_SUGGESTED_KINDS);
}
