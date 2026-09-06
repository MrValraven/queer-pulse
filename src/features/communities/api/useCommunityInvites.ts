import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  declineMyCommunityInvite,
  getCommunityPendingInvites,
  getMyCommunityInvites,
  inviteCommunityMembers,
  revokeCommunityInvite,
  type CommunityInvitesResponseDTO,
  type CommunityPendingInviteDTO,
  type MyCommunityInviteDTO,
} from "./communityInvites.api";

/**
 * `POST /communities/:slug/invites` — send invitations to up to 25 members
 * (owner, co-owner or moderator).
 *
 * The response is the point of this call, so the caller keeps it and renders
 * who was invited alongside who was skipped and why. Demo mode answers with a
 * summary shaped from the same slugs so the panel's result view is reachable
 * there too, without touching the network.
 *
 * Nothing about the roster is invalidated on success: an invitation changes no
 * roster and no join-request queue. The people named decide for themselves.
 */
export function useInviteCommunityMembers(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CommunityInvitesResponseDTO, Error, string[]>({
    // The panel reports its own failure, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (memberSlugs) => {
      if (demoMode) {
        return {
          invited: memberSlugs,
          skipped: [],
          invitedCount: memberSlugs.length,
          skippedCount: 0,
        };
      }
      return inviteCommunityMembers(slug, memberSlugs);
    },
    onSuccess: () => {
      // Kept deliberately narrow. An invitation moves the notifications badge
      // for its recipient, never for the sender, and it moves exactly one
      // surface on this side: the pending list below the send form, which
      // reads under this same key (PRD-140). No roster and no join-request
      // queue changes, because nobody was added to anything.
      void queryClient.invalidateQueries({
        queryKey: ["community-invites", slug],
      });
    },
  });
}

export interface MyCommunityInvitesResult {
  invites: MyCommunityInviteDTO[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const NOOP = () => {};
const EMPTY: MyCommunityInvitesResult = {
  invites: [],
  isLoading: false,
  isError: false,
  refetch: NOOP,
};

/**
 * `GET /me/community-invites` — the caller's own standing invitations, newest
 * first, each carrying the community card and who sent it.
 *
 * Demo mode has no invitation record at all (the mock registry stores
 * memberships and pending requests, nothing else), so it short-circuits to an
 * empty shelf rather than inventing invitations from fixtures. That keeps the
 * prototype's behaviour exactly as it was.
 *
 * `options.enabled` is how a surface that only sometimes needs the list opts
 * in: the community detail page reads it ONLY for a viewer whose detail DTO
 * already said they hold an invitation here, because the id it needs to
 * decline with lives on this list and nowhere else.
 */
export function useMyCommunityInvites(
  options: { enabled?: boolean } = {},
): MyCommunityInvitesResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["my-community-invites"],
    enabled: !demoMode && enabled,
    queryFn: () => getMyCommunityInvites(),
  });

  if (demoMode) return EMPTY;
  if (!query.data) {
    return {
      ...EMPTY,
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: () => void query.refetch(),
    };
  }
  return {
    invites: query.data.items,
    isLoading: false,
    isError: false,
    refetch: () => void query.refetch(),
  };
}

/**
 * `DELETE /me/community-invites/:id` — decline one standing invitation.
 *
 * `communitySlug` is carried alongside the id purely so the community's own
 * detail can be re-read afterwards: declining clears `invitedAt`, and a
 * `private` community stops being visible to the caller entirely once it is
 * gone. Errors stay silent app-wide because each caller renders the failure
 * next to the row it belongs to.
 */
export function useDeclineCommunityInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { inviteId: string; communitySlug?: string | undefined }
  >({
    meta: { silentError: true },
    mutationFn: async ({ inviteId }) => {
      if (demoMode) return;
      await declineMyCommunityInvite(inviteId);
    },
    onSuccess: (_result, { communitySlug }) => {
      void queryClient.invalidateQueries({
        queryKey: ["my-community-invites"],
      });
      if (communitySlug) {
        void queryClient.invalidateQueries({
          queryKey: ["community", communitySlug],
        });
      }
    },
  });
}

export interface CommunityPendingInvitesResult {
  invites: CommunityPendingInviteDTO[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const EMPTY_PENDING: CommunityPendingInvitesResult = {
  invites: [],
  isLoading: false,
  isError: false,
  refetch: NOOP,
};

/**
 * `GET /communities/:slug/invites` — the invitations this community is still
 * waiting on, newest first (owner, co-owner or moderator only).
 *
 * `options.enabled` carries the staff gate. The endpoint 403s anybody who does
 * not speak for the community, so the caller passes the answer it already has
 * from the detail DTO's `myRole` and the request is simply never made for
 * anybody else.
 *
 * Demo mode has no invitation record at all (the mock registry stores
 * memberships and pending requests, nothing else), so it short-circuits to an
 * empty list without touching the network. That renders the pane's real empty
 * state, which is the honest demo outcome rather than an invented invitation,
 * and it is the same line `useCommunityBans` and `useCommunityGovernanceLog`
 * take for the same reason.
 *
 * `isError` is kept apart from an empty list on purpose: a moderator has to be
 * able to tell a dropped request from a community that genuinely has nothing
 * out, or the pane quietly reports "nobody is waiting" over a failure.
 */
export function useCommunityPendingInvites(
  slug: string | undefined,
  options: { enabled?: boolean } = {},
): CommunityPendingInvitesResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const query = useQuery({
    // The same key the send mutation above invalidates: sending an invitation
    // is the one thing that adds a row to this list.
    queryKey: ["community-invites", slug],
    enabled: !demoMode && enabled && Boolean(slug),
    queryFn: () => getCommunityPendingInvites(slug!),
  });

  if (demoMode) return EMPTY_PENDING;
  return {
    invites: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * `DELETE /communities/:slug/invites/:id` — withdraw a standing invitation
 * (owner, co-owner or moderator).
 *
 * The invitee is never told, and the copy in front of this says so. See
 * `revokeCommunityInvite`.
 *
 * Only the pending list is invalidated. Withdrawing an invitation puts nobody
 * on the roster and takes nobody off it, so neither the roster nor the
 * community detail changes as a result. Errors stay silent app-wide because
 * the pane toasts its own failure next to the row it belongs to.
 */
export function useRevokeCommunityInvite(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { inviteId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ inviteId }) => {
      if (demoMode) return;
      await revokeCommunityInvite(slug, inviteId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["community-invites", slug],
      });
    },
  });
}
