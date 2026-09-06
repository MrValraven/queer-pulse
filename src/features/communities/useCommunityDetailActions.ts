import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ApiError } from "../../shared/api/client";
import type { Community } from "../homepage/data/types";
import { useRemoveMember } from "./api/useCommunityMutations";
import type { JoinCommunityPayload } from "./api/communityJoin.api";
import {
  useJoinCommunityWithRules,
  useWithdrawJoinRequest,
} from "./api/useCommunityJoin";
import { useDeclineCommunityInvite } from "./api/useCommunityInvites";

/**
 * Everything the community detail page can DO, and the confirm-dialog state
 * each destructive action sits behind: save, share, join, leave, withdraw a
 * pending request (PRD-148) and decline a standing invitation (PRD-140).
 *
 * Split out of `useCommunityDetailState` so both stay under the repo's
 * 200-line limit, and because the split falls on a real seam: everything here
 * is a write plus the dialog that gates it, and everything left there is a
 * read plus the view-model it derives.
 *
 * `community` is nullable because this hook runs BEFORE its caller's
 * loading/error/not-found early returns (hook order cannot be conditional).
 * Every handler that needs it is only ever invoked from the resolved page, so
 * the null guards below are belt and braces rather than a real state.
 */
export function useCommunityDetailActions({
  slug,
  community,
  standingInviteId,
}: {
  slug: string | undefined;
  community: Community | null;
  /** The id of this viewer's standing invitation here, once the invitations
   *  list has arrived. Null while it is in flight, which is what keeps
   *  "Decline" from firing a DELETE at an id that does not exist yet. */
  standingInviteId: string | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const { join, leave, requestToJoin } = useCommunityMembership();
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [decliningInvite, setDecliningInvite] = useState(false);

  // The rules-aware join: the payload carries the applicant's note, their
  // involvement answer and the house-rules version they agreed to in the
  // wizard, and the wizard reads the refusal codes off the failure.
  const joinMutation = useJoinCommunityWithRules(slug ?? "");
  // Self-leave reuses the member-removal mutation with the viewer's own slug —
  // it hits the same DELETE /communities/:slug/members/:memberSlug the backend
  // treats as "leave the community yourself" (P1-11).
  const leaveMutation = useRemoveMember(slug ?? "");
  // PRD-148, and PRD-140's other half. Both are live-only: the demo membership
  // store has no primitive for either, so the affordances behind them are
  // gated on `demoMode` and the prototype behaves exactly as it did.
  const withdrawMutation = useWithdrawJoinRequest(slug ?? "");
  const declineInviteMutation = useDeclineCommunityInvite();

  // Bookmark this community via the backend-wired SavedProvider (kind "group") —
  // independent of membership: you can save a community to revisit without
  // joining it.
  const savedId = `group:${slug}`;
  const saved = isSaved(savedId);
  const onToggleSave = () => {
    if (!community) return;
    const nowSaved = toggleSave({
      id: savedId,
      kind: "group",
      title: community.name,
      href: `/community/${slug}`,
      meta: community.count,
      description: community.description,
    });
    showToast(
      t(
        nowSaved
          ? "communities:detail.save.savedToast"
          : "communities:detail.save.removedToast",
      ),
      "success",
    );
  };

  // Join / request-to-join. Both resolve only once the write has actually
  // landed, so `JoinModal` can hold its welcome step until then; the demo
  // membership store is a demo-mode fixture and is never written from a live
  // path (live membership comes back off the refetched detail DTO).
  //
  // The RESOLVED VALUE matters now: `POST /join` answers an uninvited caller to
  // an `invite`-tier community with a successful `outcome: "invite_required"`
  // (PRD-141), which the wizard reads off what these return.
  const onJoined = async (payload: JoinCommunityPayload) => {
    if (demoMode) {
      if (slug) join(slug);
      return;
    }
    return joinMutation.mutateAsync(payload);
  };
  const onRequested = async (payload: JoinCommunityPayload) => {
    if (demoMode) {
      if (slug) requestToJoin(slug);
      return;
    }
    return joinMutation.mutateAsync(payload);
  };

  // Leave: demo drives the session provider (unchanged); live fires the real
  // DELETE with the viewer's own slug, then invalidates so the CTA flips back to
  // "Join". On failure the mutation's global error handler surfaces the reason —
  // membership is never optimistically dropped, so there's no false success.
  // Only ever reached after the member confirms in LeaveCommunityModal — leaving
  // is destructive, so it never fires straight off the "Joined" button. An
  // OWNER never reaches it at all: that dialog offers the transfer instead
  // (PRD-142), because the backend refuses to remove the owner.
  const performLeave = () => {
    if (!slug) return;
    if (demoMode) {
      setConfirmingLeave(false);
      leave(slug);
      return;
    }
    const mySlug = user?.profile.slug;
    if (!mySlug) {
      setConfirmingLeave(false);
      showToast(t("communities:common.error"), "error");
      return;
    }
    // The modal stays mounted until the DELETE settles, so its `pending` state
    // can actually render and a second tap can't fire a second request. It used
    // to close first, which made `pending={leaveMutation.isPending}` dead.
    leaveMutation.mutate(mySlug, {
      onSettled: () => setConfirmingLeave(false),
    });
  };

  // PRD-148. Withdraw the caller's own pending join request. Only ever reached
  // after the applicant confirms, because withdrawing throws the request away:
  // the row is deleted rather than parked, which is exactly what lets them ask
  // again straight afterwards with no wait attached.
  const performWithdrawRequest = () => {
    if (!slug || demoMode) return;
    withdrawMutation.mutate(undefined, {
      onSuccess: () =>
        showToast(t("communities:detail.withdraw.doneToast"), "success"),
      // The server answers 409 ONLY when a decision landed first, and it says
      // which. Reporting that as "we could not withdraw it" would be a lie in
      // both directions: an approved applicant is already a member, and a
      // declined one needs to know a reapply date now exists. A generic error
      // is right only for a genuine failure.
      onError: (error) => {
        if (error instanceof ApiError && error.status === 409) {
          const body = error.data as
            { code?: string; reapplyAfter?: string } | undefined;
          if (body?.code === "JOIN_REQUEST_ALREADY_ANSWERED") {
            showToast(
              t("communities:detail.withdraw.alreadyDeclinedToast", {
                date: body.reapplyAfter
                  ? fmt.date(new Date(body.reapplyAfter))
                  : "",
              }),
              "info",
            );
            return;
          }
          showToast(
            t("communities:detail.withdraw.alreadyApprovedToast"),
            "success",
          );
          return;
        }
        showToast(t("communities:common.error"), "error");
      },
      onSettled: () => setConfirmingWithdraw(false),
    });
  };

  // PRD-140. Decline a standing invitation. Nobody is told: the community
  // never learns the answer was no, which is the whole reason declining is
  // safe to offer at all.
  const performDeclineInvite = () => {
    if (!slug || demoMode || !standingInviteId) return;
    declineInviteMutation.mutate(
      { inviteId: standingInviteId, communitySlug: slug },
      {
        onSuccess: () =>
          showToast(t("communities:detail.invite.declinedToast"), "success"),
        onError: () => showToast(t("communities:common.error"), "error"),
        onSettled: () => setDecliningInvite(false),
      },
    );
  };

  // Share this community: the native share sheet on devices that support it
  // (mobile), else copy the link to the clipboard and confirm with a toast.
  const onShare = async () => {
    if (!community) return;
    const url = `${window.location.origin}/community/${slug}`;
    const shareData = {
      title: community.name,
      text: community.description,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // The member dismissed the share sheet. Not an error, so stay silent.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast(t("communities:detail.share.copiedToast"), "success");
    } catch {
      showToast(t("communities:common.error"), "error");
    }
  };

  return {
    saved,
    onToggleSave,
    onShare,
    onJoined,
    onRequested,
    performLeave,
    performWithdrawRequest,
    performDeclineInvite,
    leaveMutation,
    withdrawMutation,
    declineInviteMutation,
    confirmingLeave,
    setConfirmingLeave,
    confirmingWithdraw,
    setConfirmingWithdraw,
    decliningInvite,
    setDecliningInvite,
  };
}
