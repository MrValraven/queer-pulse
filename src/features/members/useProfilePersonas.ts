import { useMemo } from "react";
import { useProfileSubprofiles } from "../subprofiles/api/usePublicSubprofile";
import { useSubprofiles } from "../subprofiles/api/useSubprofiles";
import {
  ownerViewToShowcaseView,
  type PublicSubprofileView,
} from "../subprofiles/api/subprofiles.adapters";

/** A member's persona for card/highlight rendering — self and visitor views
 *  both resolve to this shared shape (see {@link useProfilePersonas}). */
export type PersonaView = PublicSubprofileView;

/**
 * Single source of truth for a member's LINKED + published personas — feeds
 * both the profile's persona-highlights row and its "Personas" stat. Mirrors
 * the fetch/adapt logic in `ProfileSubprofilesSection` exactly, so results
 * are byte-identical to what that section renders: self view sees every
 * persona (incl. drafts/unlisted) via the owner query, adapted to the shared
 * public shape; a visitor sees only the linked + published ones the public
 * hook already scopes to (spec §4).
 */
export function useProfilePersonas({
  ownerSlug,
  isSelf,
}: {
  ownerSlug: string;
  isSelf: boolean;
}): { personas: PersonaView[]; isLoading: boolean } {
  // Rules of Hooks: both sources are called unconditionally on every render.
  // The owner query is *gated* via `enabled`, not conditionally called — a
  // visitor viewing someone else's profile (or a logged-out visitor) must
  // never hit GET /subprofiles/mine.
  const ownerQuery = useSubprofiles({ enabled: isSelf });
  const publicQuery = useProfileSubprofiles(ownerSlug);

  const isLoading = isSelf ? ownerQuery.isLoading : publicQuery.isLoading;

  const personas = useMemo<PersonaView[]>(() => {
    const ownerList = ownerQuery.data ?? [];
    const publicList = publicQuery.data ?? [];
    return isSelf
      ? ownerList.map((view) => ownerViewToShowcaseView(view, ownerSlug))
      : publicList;
  }, [isSelf, ownerQuery.data, publicQuery.data, ownerSlug]);

  return { personas, isLoading };
}
