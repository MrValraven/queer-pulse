import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Member } from "../../members/data/members";
import {
  inviteCoOwner,
  listSubprofileInvites,
  revokeSubprofileInvite,
  type PersonaInviteDTO,
} from "./subprofiles.api";

/** Build a plausible optimistic invite for the demo branch of `invite()` — no
 *  network, and the static mock registry is never mutated (mirrors
 *  `useSubprofileMutations`'s `demoCreatedDto`: a fresh object returned to the
 *  caller, not persisted for a later refetch to rediscover). Resolves the
 *  invited member against the shared demo member registry by slug, since the
 *  seeded `MemberDTO`/`PersonaInviteDTO` mocks use the member slug as `userId`.
 *
 *  `getMember`/`currentUserSlug` are passed in rather than imported at module
 *  scope: `../../members/data/members` is the ~3400-line demo member registry,
 *  and a top-level *value* import would statically bundle it into the live
 *  path too (Rollup can't tree-shake around a runtime `demoMode` check). The
 *  caller dynamic-imports it inside the demo branch only. */
function demoInvitedDto(
  subprofileId: string,
  slug: string,
  getMember: (slug: string) => Member | undefined,
  currentUserSlug: string,
): PersonaInviteDTO {
  const invitedMember = getMember(slug);
  return {
    id: `invite-demo-${Date.now()}`,
    subprofileId,
    invitedUserId: slug,
    invitedByUserId: currentUserSlug,
    status: "pending",
    createdAt: new Date().toISOString(),
    invitedName: invitedMember
      ? `${invitedMember.first} ${invitedMember.last}`
      : slug,
    invitedSlug: slug,
    invitedAvatarUrl: invitedMember?.photo ?? null,
  };
}

/**
 * A persona's outstanding/resolved co-owner invites, plus the owner actions
 * that send/withdraw one. Demo reads/resolves against the mock registry (no
 * network, nothing persisted); live calls the `/subprofiles/:id/invites` pair.
 */
export function useSubprofileInvites(id: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const invalidateInvites = () => {
    void queryClient.invalidateQueries({ queryKey: ["subprofile-members"] });
    void queryClient.invalidateQueries({ queryKey: ["subprofile-invites"] });
  };

  const query = useQuery<PersonaInviteDTO[]>({
    queryKey: ["subprofile-invites", demoMode, id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      if (!id) return [];
      if (demoMode) {
        const { mockPersonaInvites } = await import("../data/subprofiles.data");
        return mockPersonaInvites(id);
      }
      return listSubprofileInvites(id, signal);
    },
  });

  const invite = useMutation<PersonaInviteDTO, Error, { slug: string }>({
    // The invite panel toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug }) => {
      if (!id) throw new Error("Subprofile id required");
      if (!demoMode) return inviteCoOwner(id, slug);
      const { getMember, currentUserSlug } =
        await import("../../members/data/members");
      return demoInvitedDto(id, slug, getMember, currentUserSlug);
    },
    onSuccess: invalidateInvites,
  });

  const revoke = useMutation<{ ok: true }, Error, string>({
    // The invite panel toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (inviteId) => {
      if (!id) throw new Error("Subprofile id required");
      if (!demoMode) return revokeSubprofileInvite(id, inviteId);
      return { ok: true };
    },
    onSuccess: invalidateInvites,
  });

  return { ...query, invite, revoke };
}
