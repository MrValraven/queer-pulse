import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  claimFrameCount,
  patchConversationClaim,
} from "../../../shared/api/claimCache";
import {
  claimStateFromResponse,
  type ClaimState,
  type ConversationClaimant,
} from "../../../shared/api/conversationClaim";
import { ApiError } from "../../../shared/api/client";
import { MAILBOXES_QUERY_KEY_PREFIX } from "../../../shared/api/mailboxViewer";
import {
  currentUser,
  currentUserSlug,
} from "../../members/data/demoCurrentUser";
import type { Conversation } from "../data";
import { isNotStaffError } from "../mailboxes/mailboxScope";
import { recordDemoClaim } from "./demoClaims";
import {
  claimConversation,
  releaseConversation,
  takeOverConversation,
  type ClaimResponse,
} from "./mailboxes.api";

/** Where a thread stands for the member answering it as a business: `none`
 *  on a personal thread, a group, or a read-only mailbox. */
export type ClaimStatus = "none" | "unclaimed" | "mine" | "theirs";

export function claimStatusOf(
  conversation: Pick<
    Conversation,
    "mailboxSeatIdentityId" | "isMailboxReadOnly" | "claimedBy"
  >,
  myHandle: string | null,
): ClaimStatus {
  if (!conversation.mailboxSeatIdentityId || conversation.isMailboxReadOnly) {
    return "none";
  }
  if (!conversation.claimedBy) return "unclaimed";
  return myHandle && conversation.claimedBy.handle === myHandle
    ? "mine"
    : "theirs";
}

const UNCLAIMED: ClaimState = {
  claimedBy: null,
  claimedByUserId: null,
  claimedAt: null,
  claimTakenOverFrom: null,
};

function claimStateOf(conversation: Conversation): ClaimState {
  return {
    claimedBy: conversation.claimedBy ?? null,
    claimedByUserId: conversation.claimedByUserId ?? null,
    claimedAt: conversation.claimedAt ?? null,
    claimTakenOverFrom: conversation.claimTakenOverFrom ?? null,
  };
}

/** 403 `IDENTITY_REMOVED`: moderation removed the persona after the
 *  mailboxes loaded. Read from the body's `code`, as `isNotStaffError` does. */
function isIdentityRemovedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    !!error.data &&
    typeof error.data === "object" &&
    "code" in error.data &&
    (error.data as { code?: unknown }).code === "IDENTITY_REMOVED"
  );
}

/** The member as a claimant: the demo viewer in demo mode, the signed-in
 *  profile in live mode. */
function useMyClaimant(): {
  claimant: ConversationClaimant | null;
  userId: string | null;
} {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  return useMemo(() => {
    if (demoMode) {
      return {
        claimant: {
          handle: currentUserSlug,
          name: `${currentUser.first} ${currentUser.last}`,
          firstName: currentUser.first,
        },
        userId: user?.id ?? null,
      };
    }
    if (!user) return { claimant: null, userId: null };
    const { slug, firstName, lastName } = user.profile;
    return {
      claimant: {
        handle: slug,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
      },
      userId: user.id,
    };
  }, [demoMode, user]);
}

/**
 * Claim, release and take over a mailbox thread against the three real
 * routes. Each action applies an optimistic claim to every cached row first;
 * demo mode also records it for the demo list's rebuilds (`demoClaims.ts`)
 * and stops there, leaving the network alone. In live mode the
 * response is applied only while no `conversation:claim` frame for the
 * thread has landed since the action began: a frame that landed while the
 * request was in flight is newer truth (a losing claim's re-read can name a
 * claimant who was releasing at that moment), so the frame wins and the
 * response is dropped. The per-thread frame counter is the whole ordering
 * contract, so no clock is compared. The toast still follows the response.
 *
 * "I hold it" is `claimedByUserId === myUserId`: `isNewlyClaimed` reads true
 * for an already-held claim and false for a no-op take-over. Nothing here
 * invalidates `["conversations"]`, since the response or the frame carries
 * the whole claim state; each live action refreshes the unread counts.
 */
export function useConversationClaim(conversation: Conversation) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { claimant: myClaimant, userId: myUserId } = useMyClaimant();
  const [isPending, setIsPending] = useState(false);

  const runAction = useCallback(
    async <Response extends ClaimResponse>(
      optimistic: ClaimState,
      request: () => Promise<Response>,
      onResponse: (response: Response, applyResponse: () => void) => void,
    ) => {
      const conversationId = conversation.id;
      const previousState = claimStateOf(conversation);
      const framesAtStart = claimFrameCount(conversationId);
      const isResponseCurrent = () =>
        claimFrameCount(conversationId) === framesAtStart;
      const patchIfCurrent = (state: ClaimState) => {
        if (isResponseCurrent()) {
          patchConversationClaim(queryClient, conversationId, state);
        }
      };
      patchConversationClaim(queryClient, conversationId, optimistic);
      if (demoMode) {
        recordDemoClaim(conversationId, optimistic);
        return;
      }
      setIsPending(true);
      try {
        const response = await request();
        onResponse(response, () =>
          patchIfCurrent(claimStateFromResponse(response)),
        );
      } catch (error) {
        patchIfCurrent(previousState);
        // A lost seat leaves the switcher; a removed persona turns read-only.
        if (isNotStaffError(error) || isIdentityRemovedError(error)) {
          void queryClient.invalidateQueries({
            queryKey: MAILBOXES_QUERY_KEY_PREFIX,
          });
        }
        showToast(t("messages:mailbox.claim.error"), "error");
      } finally {
        setIsPending(false);
        void queryClient.invalidateQueries({
          queryKey: ["conversations-unread-count"],
        });
      }
    },
    [conversation, demoMode, queryClient, showToast, t],
  );

  const mineNow = useCallback(
    (claimTakenOverFrom: ConversationClaimant | null): ClaimState => ({
      claimedBy: myClaimant,
      claimedByUserId: myUserId,
      claimedAt: new Date().toISOString(),
      claimTakenOverFrom,
    }),
    [myClaimant, myUserId],
  );

  const claim = useCallback(
    () =>
      runAction(
        mineNow(null),
        () => claimConversation(conversation.id),
        (response, applyResponse) => {
          applyResponse();
          if (response.claimedByUserId === null) {
            // The thread came free again between the claim and its re-read,
            // so the row reads unclaimed and the member can try again.
            showToast(t("messages:mailbox.claim.error"), "error");
          } else if (response.claimedByUserId === myUserId) {
            showToast(t("messages:mailbox.claim.claimedToast"), "success");
          } else {
            showToast(t("messages:mailbox.claim.lostRaceToast"), "info");
          }
        },
      ),
    [conversation.id, mineNow, myUserId, runAction, showToast, t],
  );

  const release = useCallback(
    () =>
      runAction(
        UNCLAIMED,
        () => releaseConversation(conversation.id),
        (response, applyResponse) => {
          applyResponse();
          if (response.isReleased) {
            showToast(t("messages:mailbox.claim.releasedToast"), "success");
            return;
          }
          const holder = claimStateFromResponse(response).claimedBy;
          if (holder) {
            showToast(
              t("messages:mailbox.claim.theirs", { name: holder.firstName }),
              "info",
            );
          }
        },
      ),
    [conversation.id, runAction, showToast, t],
  );

  const takeOver = useCallback(() => {
    // The claimant the member confirmed against, read from the cached row
    // (the conversation read and every claim frame keep it current).
    const confirmedClaimant = conversation.claimedBy ?? null;
    const fromUserId = conversation.claimedByUserId ?? null;
    if (!demoMode && !fromUserId) {
      showToast(t("messages:mailbox.claim.error"), "error");
      return Promise.resolve();
    }
    return runAction(
      mineNow(confirmedClaimant),
      () => takeOverConversation(conversation.id, fromUserId ?? ""),
      (response, applyResponse) => {
        applyResponse();
        if (response.claimedByUserId !== myUserId) {
          showToast(t("messages:mailbox.claim.lostRaceToast"), "info");
          return;
        }
        const previousClaimant =
          claimStateFromResponse(response).claimTakenOverFrom;
        showToast(
          previousClaimant
            ? t("messages:mailbox.claim.tookOverToast", {
                name: previousClaimant.firstName,
              })
            : t("messages:mailbox.claim.claimedToast"),
          "success",
        );
      },
    );
  }, [conversation, demoMode, mineNow, myUserId, runAction, showToast, t]);

  return { claim, release, takeOver, isPending };
}

/**
 * Demo mode only: a reply sent as the business claims an unclaimed thread on
 * the server, in the same transaction as the message. Demo has no server, so
 * this mirrors that claim in the cache after a demo send (no toast). Live mode
 * returns a no-op: the server claims, and its `conversation:claim` frame
 * updates every row.
 */
export function useDemoReplyClaim(active: Conversation): () => void {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { claimant, userId } = useMyClaimant();
  return useCallback(() => {
    if (!demoMode || claimStatusOf(active, null) !== "unclaimed") return;
    const state: ClaimState = {
      claimedBy: claimant,
      claimedByUserId: userId,
      claimedAt: new Date().toISOString(),
      claimTakenOverFrom: null,
    };
    patchConversationClaim(queryClient, active.id, state);
    recordDemoClaim(active.id, state);
  }, [active, claimant, demoMode, queryClient, userId]);
}

/**
 * The take-over confirm's open state, tied to the claim it was opened
 * against: the claimant's handle and claim time. When the claim moves while
 * the confirm is open (released, or taken by someone else), the confirm
 * closes, and it never reopens by itself on a later claim, whose claim time
 * differs.
 */
export function useTakeOverConfirm(
  conversation: Conversation,
  claimStatus: ClaimStatus,
) {
  const [confirmingClaimKey, setConfirmingClaimKey] = useState<string | null>(
    null,
  );
  const currentClaimKey =
    claimStatus === "theirs" && conversation.claimedBy
      ? `${conversation.claimedBy.handle}|${conversation.claimedAt ?? ""}`
      : null;
  const isOpen =
    confirmingClaimKey !== null && confirmingClaimKey === currentClaimKey;
  const open = useCallback(
    () => setConfirmingClaimKey(currentClaimKey),
    [currentClaimKey],
  );
  const close = useCallback(() => setConfirmingClaimKey(null), []);
  return {
    isOpen,
    claimantName: conversation.claimedBy?.firstName ?? "",
    open,
    close,
  };
}
