import { useCallback, useEffect, useRef } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { canMirrorHidePushPreviews } from "../../pushPrivacy";
import {
  isFromViewerSide,
  readStaffedIdentityIds,
  type MessageViewer,
} from "../../shared/api/mailboxViewer";
import {
  useConversationMessageFrames,
  useRealtime,
} from "../../shared/api/realtime";
import type { AuthorSummary } from "../../shared/contracts/contracts";
import type { ServerToClientEvents } from "../../shared/contracts/realtime";
import { useToast } from "../../shared/components/feedback/useToast";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { conversationToView } from "../messages/api/messages.adapters";
import { getConversations } from "../messages/api/messages.api";
import type { Conversation } from "../messages/data";
import { useHidePushPreviews } from "../settings/api/useHidePushPreviews";
import {
  buildIncomingMessageCopy,
  claimToastSlot,
  conversationPathFor,
  decideIncomingMessageBanner,
  incomingMessagePreviewText,
  isBannerEligibleMessage,
  resolveIncomingConversationRow,
  type CachedConversationRow,
} from "./incomingMessageBanner";
import { showIncomingMessageNotification } from "./showIncomingMessageNotification";

type ConversationMessageFrame = ServerToClientEvents["conversation:message"];

/**
 * `resolveIncomingConversationRow` narrows its result to
 * `CachedConversationRow`, but the object behind it is always a real cached
 * `Conversation` (the pick just omits these fields from the type). Widened
 * locally in this file to keep `incomingMessageBanner.ts` untouched.
 */
type ConversationRowWithMailboxState = CachedConversationRow &
  Pick<Conversation, "mailboxIdentityId" | "claimedByUserId">;

/**
 * Final review I1. A banner must never fire for a message already on the
 * viewer's own side, nor for a customer message on a staffed mailbox thread a
 * colleague currently claims.
 *
 * `isFromViewerSide` catches the business "messaging itself" case: a
 * colleague's reply sent as a mailbox identity the viewer staffs, matching
 * the rule the realtime unread handler already applies
 * (`shared/api/realtime.ts` `isFromOwnSide`).
 *
 * The claim check mirrors the backend push rule
 * (`push.listener.ts` `loadMessagePushThreadAudience`): once a staffed
 * mailbox thread is claimed, only the claimant is notified. This is a
 * simplified client-side mirror (no block/reachability lookup), scoped to
 * gating a local toast.
 */
export function isOwnSideOrClaimedByColleagueMessage(input: {
  sender: Pick<AuthorSummary, "handle" | "identityId"> | null | undefined;
  viewer: MessageViewer;
  mailboxIdentityId: string | undefined;
  claimedByUserId: string | null | undefined;
  myUserId: string | null;
}): boolean {
  if (isFromViewerSide(input.sender, input.viewer)) return true;
  const isStaffedMailboxThread =
    !!input.mailboxIdentityId &&
    input.viewer.staffedIdentityIds.has(input.mailboxIdentityId);
  const isClaimedByAnotherColleague =
    !!input.claimedByUserId && input.claimedByUserId !== input.myUserId;
  return isStaffedMailboxThread && isClaimedByAnotherColleague;
}

/**
 * Every live, per-mailbox inbox list (`useConversations` keys its scoped
 * entries `["conversations", demoMode, deletedToken, scopeCacheKey]`). This
 * prefix matches every one of them regardless of scope, so the cached-row
 * read below sees every mailbox's list at once.
 */
const LIVE_CONVERSATIONS_QUERY_ROOT = ["conversations", false] as const;
/**
 * A private cache slot for the fallback load below, shaped like a real
 * `useConversations` key (live mode's deleted token is always "") but with a
 * scope segment no real mailbox scope ever produces (`scopeCacheKey` only
 * ever returns a mailbox identity uuid or "unresolved"), so this can never
 * collide with, or be mistaken for, an actual mailbox's cached list. It does
 * NOT dedupe with the inbox's own fetch (each mailbox has its own scoped
 * key); it exists only so a cold lookup for a conversation not yet cached in
 * any mailbox list has somewhere to land.
 */
const LIVE_CONVERSATIONS_QUERY_KEY = [
  "conversations",
  false,
  "",
  "incoming-message-banner",
] as const;

function readNotificationPermission(): NotificationPermission | "unsupported" {
  return typeof Notification === "undefined"
    ? "unsupported"
    : Notification.permission;
}

/**
 * One load of the live inbox list with the same key and fetcher as
 * `useConversations` (repeated here because that hook exports no query
 * options). `ensureQueryData` hands back a cached list without refetching and
 * joins an in-flight fetch for the same key. Live mode only: the caller stops
 * in demo mode before this can run.
 */
function loadLiveConversationList(
  queryClient: QueryClient,
  t: TFunction,
): Promise<Conversation[]> {
  return queryClient.ensureQueryData<Conversation[]>({
    queryKey: LIVE_CONVERSATIONS_QUERY_KEY,
    queryFn: async () => {
      const rows = await getConversations();
      return rows.map((row) => conversationToView(row, t));
    },
  });
}

/**
 * PRD-332. A message landing in a conversation the member is not looking at
 * raises a toast (tab visible, away from Messages) or a system notification
 * (tab hidden, permission granted). See `decideIncomingMessageBanner` for the
 * full table.
 *
 * Inert in demo mode: the realtime layer opens no socket there, and the handler
 * stops before any lookup if a frame ever arrives, so demo never fetches. Mute
 * state and the group shape come from the inbox row: the cached list first,
 * else one `ensureQueryData` load of it. A row still unknown after that
 * suppresses the banner, because a muted chat must never raise one.
 *
 * Also suppressed: a message already on the viewer's own side (a colleague's
 * reply sent as a business the viewer staffs), and a customer message on a
 * staffed mailbox thread a colleague currently claims. See
 * `isOwnSideOrClaimedByColleagueMessage`.
 */
export function useIncomingMessageBanner(): void {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { getActiveConversationId } = useRealtime();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Same fetch gate as PushPreviewMirrorProvider, so this adds no request.
  // While unknown, the hook reports the privacy-safe default (hidden).
  const { isHidingPreviews } = useHidePushPreviews({
    isFetchEnabled: canMirrorHidePushPreviews(),
  });
  // Live mode only (the handler below returns before reading these in demo
  // mode), so no demo-viewer fallback is needed here unlike `useMessageViewer`.
  const myHandle = user?.profile.slug ?? null;
  const myUserId = user?.id ?? null;

  // Everything the frame handler reads that changes between renders, kept in
  // a ref so the handler keeps one identity and never resubscribes.
  const latestRef = useRef({
    demoMode,
    pathname,
    isHidingPreviews,
    t,
    showToast,
    navigate,
    myHandle,
    myUserId,
  });
  useEffect(() => {
    latestRef.current = {
      demoMode,
      pathname,
      isHidingPreviews,
      t,
      showToast,
      navigate,
      myHandle,
      myUserId,
    };
  }, [
    demoMode,
    pathname,
    isHidingPreviews,
    t,
    showToast,
    navigate,
    myHandle,
    myUserId,
  ]);

  const lastToastAtByConversationRef = useRef(new Map<string, number>());

  const presentIncomingMessage = useCallback(
    async ({ conversationId, message }: ConversationMessageFrame) => {
      if (latestRef.current.demoMode || !isBannerEligibleMessage(message)) {
        return;
      }
      const conversationRow = await resolveIncomingConversationRow(
        conversationId,
        {
          readCachedLists: () =>
            queryClient.getQueriesData({
              queryKey: LIVE_CONVERSATIONS_QUERY_ROOT,
            }),
          loadConversationList: () =>
            loadLiveConversationList(queryClient, latestRef.current.t),
        },
      );
      // Read everything else after the lookup: the member may have navigated,
      // hidden the tab or left demo mode while the list loaded.
      const latest = latestRef.current;
      const now = Date.now();
      const action = decideIncomingMessageBanner({
        isDemoMode: latest.demoMode,
        conversationId,
        activeConversationId: getActiveConversationId(),
        pathname: latest.pathname,
        visibilityState: document.visibilityState,
        notificationPermission: readNotificationPermission(),
        conversationRow,
        now,
        messageKind: message.kind,
        isMessageDeleted: message.deletedAt !== null,
      });
      if (action === "ignore" || conversationRow === null) return;

      const mailboxRow =
        conversationRow as unknown as ConversationRowWithMailboxState;
      if (
        isOwnSideOrClaimedByColleagueMessage({
          sender: message.sender,
          viewer: {
            myHandle: latest.myHandle,
            staffedIdentityIds: readStaffedIdentityIds(queryClient),
          },
          mailboxIdentityId: mailboxRow.mailboxIdentityId,
          claimedByUserId: mailboxRow.claimedByUserId,
          myUserId: latest.myUserId,
        })
      ) {
        return;
      }

      const copy = buildIncomingMessageCopy({
        senderName: message.sender.displayName,
        groupTitle: conversationRow.isGroup ? conversationRow.name : null,
        previewText: incomingMessagePreviewText(message, latest.t),
        isHidingPreviews: latest.isHidingPreviews,
        t: latest.t,
      });
      const conversationPath = conversationPathFor(conversationId);

      if (action === "toast") {
        if (
          !claimToastSlot(
            lastToastAtByConversationRef.current,
            conversationId,
            now,
          )
        ) {
          return;
        }
        latest.showToast(copy.toastMessage, "info", undefined, {
          label: latest.t("messages:incomingBanner.open"),
          onClick: () => void latestRef.current.navigate(conversationPath),
        });
        return;
      }

      void showIncomingMessageNotification({
        conversationId,
        conversationPath,
        title: copy.notificationTitle,
        body: copy.notificationBody,
      });
    },
    [getActiveConversationId, queryClient],
  );

  // The realtime layer expects a synchronous handler; the lookup may await.
  const handleConversationMessage = useCallback(
    (frame: ConversationMessageFrame) => {
      void presentIncomingMessage(frame);
    },
    [presentIncomingMessage],
  );

  useConversationMessageFrames(handleConversationMessage);
}
