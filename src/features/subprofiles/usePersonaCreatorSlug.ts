import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfileData } from "../../app/providers/useProfile";
import { listSubprofileMembers, type MemberDTO } from "./api/subprofiles.api";

/**
 * The profile slug of a persona's **creator**: the only slug that resolves a
 * linked persona's public address.
 *
 * The backend's nested route (`/members/:ownerSlug/:slug`) looks the persona up
 * by `userId` of the profile at `:ownerSlug`, i.e. the member who CREATED it.
 * `GET /subprofiles/mine` returns co-owned personas too and its DTO carries no
 * creator slug, so every owner-side surface used to build its link from the
 * signed-in member's own slug. For an accepted co-owner that is the wrong
 * member: View, "Open live", the share QR and the vCard `URL:` line all pointed
 * at an address that does not exist, and the Address pane previewed a path
 * under the wrong profile.
 *
 * Until the DTO carries the creator slug, resolve it from the members list,
 * which does say who the creator is (`MemberDTO.isCreator`):
 *
 * - A persona with a single owner (`memberCount <= 1`) is the signed-in
 *   member's own, so their slug is the answer and no request is made.
 * - A shared persona reads `GET /subprofiles/:id/members` under the exact key
 *   `useSubprofileMembers` uses, so the co-owners panel and this share one
 *   cache entry and one request.
 *
 * Returns `undefined` while the answer isn't known (still loading, or the call
 * failed). Callers must NOT fall back to the viewer's slug in that window: a
 * wrong link is worse than a moment's wait.
 *
 * Invariant this relies on: a persona's creator is always one of its members.
 * The backend enforces this at every point a creator could otherwise be left
 * behind: `SubprofileMembershipService.leave` transfers creator status to the
 * longest-standing remaining co-owner in the same transaction as the exit,
 * account erasure hands over first, and a one-time repair migration fixed any
 * persona that predates that rule. So the `memberCount <= 1` branch above
 * never has to ask: a persona with exactly one member has no one else it
 * could be, and that member is always the creator.
 */
export function usePersonaCreatorSlug(
  id: string | undefined,
  memberCount: number,
): string | undefined {
  const { profile } = useProfileData();
  const creator = useSharedPersonaCreator(id, memberCount);
  if (memberCount <= 1) return profile.slug;
  return creator?.slug;
}

/**
 * The full name of a persona's **creator**, the name the public page carries as
 * `ownerName` for a linked persona. Owner-side previews pass it through so a
 * persona still named after its kind ("Therapist") is addressed by the
 * creator's first name, as it is live. Same resolution and cache entry as
 * `usePersonaCreatorSlug`; `undefined` while a shared persona's members load.
 */
export function usePersonaCreatorName(
  id: string | undefined,
  memberCount: number,
): string | undefined {
  const { profile } = useProfileData();
  const creator = useSharedPersonaCreator(id, memberCount);
  if (memberCount <= 1) return `${profile.first} ${profile.last}`.trim();
  return creator?.name;
}

/** The creator's member row for a shared persona (`memberCount > 1`), read
 *  under the exact key `useSubprofileMembers` uses. `undefined` for a solo
 *  persona (no request is made) and while loading or after a failure. */
function useSharedPersonaCreator(
  id: string | undefined,
  memberCount: number,
): MemberDTO | undefined {
  const { demoMode } = useDemoMode();
  const isShared = memberCount > 1;

  const query = useQuery<MemberDTO[]>({
    queryKey: ["subprofile-members", demoMode, id],
    enabled: isShared && Boolean(id),
    queryFn: async ({ signal }) => {
      if (!id) return [];
      if (demoMode) {
        const { mockPersonaMembers } = await import("./data/subprofiles.data");
        return mockPersonaMembers(id);
      }
      return listSubprofileMembers(id, signal);
    },
  });

  if (!isShared) return undefined;
  return query.data?.find((member) => member.isCreator);
}

/**
 * Whether the signed-in member CREATED this persona, which is the only role the
 * backend lets delete it (`SubprofilesService.remove` throws `Forbidden` for
 * every other co-owner). A co-owner leaves instead, via
 * `DELETE /subprofiles/:id/members/me`.
 *
 * Reads the same members query `usePersonaCreatorSlug` does, so gating a Delete
 * affordance costs no extra request. `undefined` while the answer isn't known:
 * callers must treat that as "not yet", never as "yes", or a co-owner is handed
 * a destructive confirmation that can only end in a generic failure toast.
 */
export function usePersonaIsCreator(
  id: string | undefined,
  memberCount: number,
): boolean | undefined {
  const { profile } = useProfileData();
  const creatorSlug = usePersonaCreatorSlug(id, memberCount);
  if (!creatorSlug) return undefined;
  return creatorSlug === profile.slug;
}
