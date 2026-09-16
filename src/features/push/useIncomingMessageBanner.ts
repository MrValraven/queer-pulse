import { useCallback, useEffect, useRef } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { canMirrorHidePushPreviews } from "../../pushPrivacy";
import {
  useConversationMessageFrames,
  useRealtime,
} from "../../shared/api/realtime";
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
} from "./incomingMessageBanner";
import { showIncomingMessageNotification } from "./showIncomingMessageNotification";

type ConversationMessageFrame = ServerToClientEvents["conversation:message"];

/** Every live inbox list variant (`useConversations` keys on demo mode). */
const LIVE_CONVERSATIONS_QUERY_ROOT = ["conversations", false] as const;
/**
 * The live inbox list's full key exactly as `useConversations` builds it: live
 * mode never writes deleted ids, so its deleted token is always "". Sharing the
 * key is what makes the load below dedupe with the inbox's own fetch.
 */
const LIVE_CONVERSATIONS_QUERY_KEY = ["conversations", false, ""] as const;

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
 */
export function useIncomingMessageBanner(): void {
  const { demoMode } = useDemoMode();
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

  // Everything the frame handler reads that changes between renders, kept in
  // a ref so the handler keeps one identity and never resubscribes.
  const latestRef = useRef({
    demoMode,
    pathname,
    isHidingPreviews,
    t,
    showToast,
    navigate,
  });
  useEffect(() => {
    latestRef.current = {
      demoMode,
      pathname,
      isHidingPreviews,
      t,
      showToast,
      navigate,
    };
  }, [demoMode, pathname, isHidingPreviews, t, showToast, navigate]);

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
