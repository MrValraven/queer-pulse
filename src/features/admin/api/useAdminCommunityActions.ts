import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { COMMUNITIES, type Community } from "../adminCommunities.data";
import {
  archiveAdminCommunity,
  freezeAdminCommunity,
  reassignAdminCommunityOwner,
  removeAdminCommunityMember,
  unfreezeAdminCommunity,
} from "./adminCommunities.api";
import {
  ADMIN_COMMUNITIES_KEY,
  adminCommunityDetailQueryKey,
} from "./useAdminCommunities";
import { useDemoAwareMutation } from "./demoAwareMutation";

/**
 * The five moderation-of-last-resort actions on `AdminCommunityDetail`'s
 * Settings tab — freeze/unfreeze, archive, reassign owner, remove member.
 * Each bypasses the community's own owner/mod authorization on purpose (see
 * `AdminCommunitiesController`'s doc on the backend); they exist for the case
 * a community's own leadership can't be reached or trusted.
 *
 * All five follow `useUpdateAdminCommunity`'s dual-mode shape
 * (`useDemoAwareMutation`): live PATCHes/POSTs/DELETEs the real endpoint and
 * invalidates the cached detail so the pane re-renders from authoritative
 * state; demo never touches the network. Freeze/unfreeze also optimistically
 * patch the cached `frozen` flag (both modes) so the toggle never lags the
 * tap, mirroring `useUpdateAdminCommunity`'s toggle rows exactly. Archive,
 * reassign-owner and remove-member have no equivalent single boolean to flip
 * client-side, so — like this codebase's existing `ArchiveConfirmModal`/
 * `TransferOwnershipModal` (`ModPanelDangerModals.tsx`) — their demo path is
 * a confirmed no-op: a toast, but the fixture visibly stays put.
 */

interface AdminCommunitySlugVars {
  slug: string;
}

interface FreezeToggleContext {
  previous?: Community;
}

/** Shared by `useFreezeAdminCommunity`/`useUnfreezeAdminCommunity` — same
 *  optimistic-patch/rollback shape as `useUpdateAdminCommunity`, just for the
 *  single `frozen` boolean rather than an arbitrary settings patch. */
function useFreezeToggle(
  frozen: boolean,
  call: (slug: string) => Promise<unknown>,
  logLabel: string,
) {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    void,
    Error,
    AdminCommunitySlugVars,
    FreezeToggleContext
  >({
    demoMode,
    logLabel,
    logContext: ({ slug }) => ({ slug }),
    demoResult: () => undefined,
    live: async ({ slug }) => {
      await call(slug);
    },
    onMutate: async ({ slug }) => {
      const key = adminCommunityDetailQueryKey(slug, demoMode, language);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Community>(key);
      if (previous) {
        queryClient.setQueryData<Community>(key, { ...previous, frozen });
      }
      // No backend to persist to in demo — keep the fixture itself in sync so
      // a later refetch (window focus / remount) doesn't revert the toggle
      // for the rest of the session.
      if (demoMode) {
        const fixture = COMMUNITIES.find((community) => community.slug === slug);
        if (fixture) fixture.frozen = frozen;
      }
      return { previous };
    },
    onError: (_error, { slug }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          adminCommunityDetailQueryKey(slug, demoMode, language),
          context.previous,
        );
      }
    },
    onLiveSuccess: (_data, { slug }) => {
      void queryClient.invalidateQueries({
        queryKey: adminCommunityDetailQueryKey(slug, demoMode, language),
      });
    },
  });
}

/** `POST /admin/communities/:slug/freeze` — admin override, works even when
 *  the community has no owner/mods left to freeze it themselves. */
export function useFreezeAdminCommunity() {
  return useFreezeToggle(true, freezeAdminCommunity, "admin.community.freeze");
}

/** `POST /admin/communities/:slug/unfreeze` — the reverse of
 *  {@link useFreezeAdminCommunity}. */
export function useUnfreezeAdminCommunity() {
  return useFreezeToggle(
    false,
    unfreezeAdminCommunity,
    "admin.community.unfreeze",
  );
}

/** `POST /admin/communities/:slug/archive` — one-way, admin override of the
 *  owner-only member-facing archive. No client-visible field flips (the DTO
 *  carries no `archived`/`archivedAt`), so this is a confirm-and-invalidate
 *  action rather than an optimistic toggle. */
export function useArchiveAdminCommunity() {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<void, Error, AdminCommunitySlugVars>({
    demoMode,
    logLabel: "admin.community.archive",
    logContext: ({ slug }) => ({ slug }),
    demoResult: () => undefined,
    live: async ({ slug }) => {
      await archiveAdminCommunity(slug);
    },
    onLiveSuccess: (_data, { slug }) => {
      void queryClient.invalidateQueries({
        queryKey: adminCommunityDetailQueryKey(slug, demoMode, language),
      });
    },
  });
}

export interface ReassignAdminCommunityOwnerVars {
  slug: string;
  /** The target's profile slug — the route/body param the admin-only
   *  reassign-owner endpoint addresses roster members by. */
  memberSlug: string;
}

/** `POST /admin/communities/:slug/reassign-owner` — admin override, works
 *  even when the community currently has no owner at all. Invalidates the
 *  whole `["admin-communities"]` prefix (not just the detail key) since the
 *  roster's owner/mod split changes, which the moderator-candidates query
 *  also depends on. */
export function useReassignAdminCommunityOwner() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    void,
    Error,
    ReassignAdminCommunityOwnerVars
  >({
    demoMode,
    logLabel: "admin.community.reassignOwner",
    logContext: ({ slug, memberSlug }) => ({ slug, memberSlug }),
    demoResult: () => undefined,
    live: async ({ slug, memberSlug }) => {
      await reassignAdminCommunityOwner(slug, memberSlug);
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_COMMUNITIES_KEY] });
    },
  });
}

export interface RemoveAdminCommunityMemberVars {
  slug: string;
  /** The target's profile slug — the route param the admin-only
   *  remove-member endpoint addresses roster members by (unlike the
   *  promote/demote moderator endpoints, which use the user id). */
  memberSlug: string;
}

/** `DELETE /admin/communities/:slug/members/:memberSlug` — admin override
 *  that removes any roster member outright, not just demotes a moderator.
 *  The backend itself 400s a removal targeting the current owner; the caller
 *  (`AdminCommunityModerators.tsx`) also guards this client-side so the
 *  error path never depends on a round trip. Same broad-prefix invalidate as
 *  {@link useReassignAdminCommunityOwner} — the roster changed. */
export function useRemoveAdminCommunityMember() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<void, Error, RemoveAdminCommunityMemberVars>({
    demoMode,
    logLabel: "admin.community.removeMember",
    logContext: ({ slug, memberSlug }) => ({ slug, memberSlug }),
    demoResult: () => undefined,
    live: async ({ slug, memberSlug }) => {
      await removeAdminCommunityMember(slug, memberSlug);
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_COMMUNITIES_KEY] });
    },
  });
}
