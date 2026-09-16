// src/features/messages/useConversationBlockAction.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberContact } from "../connect/useMemberContact";
import type { BlockOptions } from "../social/api/social.api";
import { useBlockReportableMessages } from "./useBlockReportableMessages";

/** How long the "Undo" toast stays up before the PRD-346 follow-up toast
 *  offers the permanent path (Blocked members) instead. Matches the toast's
 *  own duration below, so the follow-up appears the instant Undo stops being
 *  an option, never overlapping it. */
const UNDO_WINDOW_MS = 6000;

type BlockFlowStep = "idle" | "reportMessages" | "confirmBlock";

/** Narrows an unblock's resolved value down to `restoredStatus` (PRD-363),
 *  without assuming the shape: an older backend answers `void`/`undefined`,
 *  demo mode synthesizes `{ restoredStatus: "accepted" }` (see
 *  `useSocialStore`'s `persistToggle`), and a signed-in unblock's live
 *  response carries whatever `UnblockResultDTO` the backend sends. */
function readRestoredStatus(
  result: unknown,
): "accepted" | "pending" | "none" | undefined {
  if (typeof result !== "object" || result === null) return undefined;
  const value = (result as { restoredStatus?: unknown }).restoredStatus;
  return value === "accepted" || value === "pending" || value === "none"
    ? value
    : undefined;
}

/**
 * Block/unblock-from-a-conversation state + confirm/undo flow, extracted out
 * of `ConversationSafetyMenu` to keep it under the component size cap.
 * `toggleBlock` (from `useSocial`) is the same dual-mode primitive
 * `ProfileSafetyMenu` uses — demo flips a local store, live POSTs/DELETEs
 * `/blocks/:slug` and invalidates the conversations list + unread badge (see
 * `SocialProvider`), so the thread disappears from the inbox and the
 * composer severs without a reload.
 *
 * PRD-362: passing `conversationId` (the thread this block started from)
 * offers a first step — "report messages before you block?" — over the
 * counterpart's most recent reportable messages already sitting in this
 * thread's cache (`useBlockReportableMessages`). `beginBlock` skips straight
 * to the existing confirm step when there is nothing to show (a fresh
 * thread, or `conversationId` omitted entirely — a caller with no
 * conversation in scope, matching the old two-argument call, gets the old
 * one-step behaviour unchanged).
 *
 * HANDOFF: the two-step flow above is fully built here but has no render
 * site yet. `ConversationMenu.tsx` (owned by a peer task this build) still
 * calls this hook with two arguments and renders only
 * `{safety && confirmingBlock && <BlockMemberModal ... />}` — it needs one
 * more conditional render, `{safety && reportingMessagesBeforeBlock &&
 * <BlockReportMessagesStep name={name} messages={reportableMessages}
 * onSkip={skipReportMessagesStep} onDone={finishReportMessagesStep}
 * onClose={cancelBlock} />}`, alongside the existing one, and the hook call
 * needs its own conversation id threaded through as the third argument.
 * Until then this stays dormant and safe: `reportableMessages` is always
 * `[]` without a third argument, so `beginBlock` always goes straight to the
 * confirm step exactly as it does today.
 *
 * PRD-363: unblocking (via Undo or directly) reads the settled result's
 * `restoredStatus` and announces it honestly instead of the flat "You
 * unblocked {name}" toast — a restored `"none"` connection means the DM
 * stays severed until a fresh request is sent, so the toast says that and
 * offers the same "send a connection request" action `ComposerConnectionNotice`
 * already puts in the composer. `toggleBlock`'s existing invalidation of
 * `["conversations"]`/`["connections"]`/`["messages"]` (see `useSocialStore`)
 * already refreshes the composer gate and connection state without a reload;
 * this hook only decides what the toast says.
 */
export function useConversationBlockAction(
  slug: string,
  name: string,
  conversationId?: string,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isBlocked, toggleBlock } = useSocial();
  const { contact } = useMemberContact(slug);
  const navigate = useNavigate();
  const [step, setStep] = useState<BlockFlowStep>("idle");
  const reportableMessages = useBlockReportableMessages(conversationId);
  const blocked = isBlocked(slug);

  function announceUnblock(didSucceed: boolean, result?: unknown) {
    if (!didSucceed) return;
    const restoredStatus = readRestoredStatus(result);
    if (restoredStatus === "none") {
      showToast(
        t("safety:blockMute.blocked.unblockedNoConnectionToast", { name }),
        "info",
        UNDO_WINDOW_MS,
        {
          label: t("messages:conversation.connectionRequiredSendCta"),
          onClick: () => contact({ slug, name }),
        },
      );
      return;
    }
    showToast(t("safety:profileMenu.unblockedToast", { name }), "success");
  }

  const undoBlock = () => {
    toggleBlock(slug, undefined, announceUnblock);
  };

  const beginBlock = () => {
    if (blocked) {
      toggleBlock(slug, undefined, announceUnblock);
      return;
    }
    setStep(reportableMessages.length > 0 ? "reportMessages" : "confirmBlock");
  };

  const confirmBlock = (options: BlockOptions) => {
    setStep("idle");
    toggleBlock(slug, options);
    // A block severs the composer instantly and drops the thread from the
    // inbox — offer a quick way back before either sticks, mirroring
    // `blockMute.blocked.undoCta`'s "Undo — unblock {name}" affordance.
    showToast(
      t(
        options.alsoReport
          ? "safety:profileMenu.blockedReportedToast"
          : "safety:profileMenu.blockedToast",
        { name },
      ),
      "success",
      UNDO_WINDOW_MS,
      {
        label: t("safety:blockMute.blocked.undoCta", { name }),
        onClick: undoBlock,
      },
    );
    // PRD-346: once the Undo window closes, the only path back to what just
    // happened used to be finding the row and its kebab again. This
    // follow-up toast offers the permanent one (the block/mute list) right
    // where the member is already looking. Timed to land the instant the
    // undo toast itself would have dismissed, never stacking on top of it.
    setTimeout(() => {
      showToast(
        t("safety:blockMute.blocked.manageFollowUpToast", { name }),
        "info",
        6000,
        {
          label: t("safety:blockMute.blocked.manageLink"),
          onClick: () => void navigate(routes.blockMute),
        },
      );
    }, UNDO_WINDOW_MS);
  };

  return {
    blocked,
    confirmingBlock: step === "confirmBlock",
    /** PRD-362 — see this hook's own docblock for the render site this
     *  still needs at the call site. */
    reportingMessagesBeforeBlock: step === "reportMessages",
    reportableMessages,
    beginBlock,
    cancelBlock: () => setStep("idle"),
    confirmBlock,
    skipReportMessagesStep: () => setStep("confirmBlock"),
    finishReportMessagesStep: () => setStep("confirmBlock"),
  };
}
