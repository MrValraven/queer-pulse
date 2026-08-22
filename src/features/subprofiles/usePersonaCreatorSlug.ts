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
 */
export function usePersonaCreatorSlug(
  id: string | undefined,
  memberCount: number,
): string | undefined {
  const { demoMode } = useDemoMode();
  const { profile } = useProfileData();
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

  if (!isShared) return profile.slug;
  return query.data?.find((member) => member.isCreator)?.slug;
}
