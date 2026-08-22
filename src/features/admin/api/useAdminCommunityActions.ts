import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { COMMUNITIES, type Community } from "../adminCommunities.data";
import {
  archiveAdminCommunity,
  freezeAdminCommunity,
  reassignAdminCommunityOwner,
  removeAdminCommunityMember,
  unarchiveAdminCommunity,
  unfreezeAdminCommunity,
} from "./adminCommunities.api";
import {
  ADMIN_COMMUNITIES_KEY,
  adminCommunityDetailQueryKey,
} from "./useAdminCommunities";
import { adminCommunityGovernanceLogPrefix } from "./useAdminCommunityGovernanceLog";
import { useDemoAwareMutation } from "./demoAwareMutation";

/**
 * The moderation-of-last-resort actions on `AdminCommunityDetail`'s Settings
 * tab — freeze/unfreeze, archive/unarchive, reassign owner, remove member.
 * Each bypasses the community's own owner/mod authorization on purpose (see
 * `AdminCommunitiesController`'s doc on the backend); they exist for the case
 * a community's own leadership can't be reached or trusted.
 *
 * All of them follow `useUpdateAdminCommunity`'s dual-mode shape
 * (`useDemoAwareMutation`): live PATCHes/POSTs/DELETEs the real endpoint and
 * invalidates the cached detail so the pane re-renders from authoritative
 * state; demo never touches the network. Freeze/unfreeze also optimistically
 * patch the cached `frozen` flag (both modes) so the toggle never lags the
 * tap, mirroring `useUpdateAdminCommunity`'s toggle rows exactly.
 * Archive/unarchive, reassign-owner and remove-member have no equivalent
 * single boolean to flip client-side ahead of the round trip (archive/
 * unarchive's `archived` flag only exists on the detail DTO, not the card
 * used to seed the cache), so — like this codebase's existing
 * `ArchiveConfirmModal`/`TransferOwnershipModal` (`ModPanelDangerModals.tsx`)
 * — their demo path is a confirmed no-op: a toast, but the fixture visibly
 * stays put.
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
      // The override also wrote a governance-log entry (`adminOverride: true`),
      // so the audit trail on the Governance tab is stale until refetched.
      void queryClient.invalidateQueries({
        queryKey: adminCommunityGovernanceLogPrefix(slug),
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

/** `POST /admin/communities/:slug/archive` — admin override of the
 *  owner-only member-facing archive, reversible via
 *  {@link useUnarchiveAdminCommunity} (COM-18). This is a
 *  confirm-and-invalidate action rather than an optimistic toggle: the
 *  card-level DTO carries no `archived` flag, only the detail one does, so
 *  there's nothing cheap to patch client-side ahead of the round trip. */
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
      // The override also wrote a governance-log entry (`adminOverride: true`),
      // so the audit trail on the Governance tab is stale until refetched.
      void queryClient.invalidateQueries({
        queryKey: adminCommunityGovernanceLogPrefix(slug),
      });
    },
  });
}

/** `POST /admin/communities/:slug/unarchive` — the reverse of
 *  {@link useArchiveAdminCommunity} (COM-18: archiving a community used to be
 *  a one-way door, even for admins). Same confirm-and-invalidate shape as
 *  archive — no optimistic patch, since the card-level DTO carries no
 *  `archived` flag to flip ahead of the round trip. */
export function useUnarchiveAdminCommunity() {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<void, Error, AdminCommunitySlugVars>({
    demoMode,
    logLabel: "admin.community.unarchive",
    logContext: ({ slug }) => ({ slug }),
    demoResult: () => undefined,
    live: async ({ slug }) => {
      await unarchiveAdminCommunity(slug);
    },
    onLiveSuccess: (_data, { slug }) => {
      void queryClient.invalidateQueries({
        queryKey: adminCommunityDetailQueryKey(slug, demoMode, language),
      });
      // The override also wrote a governance-log entry (`adminOverride: true`),
      // so the audit trail on the Governance tab is stale until refetched.
      void queryClient.invalidateQueries({
        queryKey: adminCommunityGovernanceLogPrefix(slug),
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
