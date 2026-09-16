import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { logError } from "../../../shared/observability/logger";
import type { WhoCanMessage } from "../../../shared/contracts/contracts";
import {
  DEFAULT_MESSAGING_PRIVACY,
  getMessagingPrivacy,
  putMessagingPrivacy,
  type MessagingPrivacyDTO,
} from "./messagingPrivacy.api";

export interface MessagingPrivacyResult {
  privacy: MessagingPrivacyDTO;
  /** Flip one share toggle. Saves immediately, mirroring every other row in
   *  this pane (`useSuggestionVisibility`, `useGroupAddPolicy`). */
  setShareReadReceipts: (next: boolean) => void;
  setShareTyping: (next: boolean) => void;
  setSharePresence: (next: boolean) => void;
  /** Change who may message the caller. Saves immediately. */
  setWhoCanMessage: (next: WhoCanMessage) => void;
  /** True while the live setting is first loading. */
  isLoading: boolean;
}

const MESSAGING_PRIVACY_QUERY_KEY = ["messaging-privacy"] as const;

/**
 * The member's messaging-privacy row, dual-mode (PRD-364/PRD-366).
 *
 * - **Demo**: in-memory, defaulting to sharing everything and `"everyone"`,
 *   so the pane is interactive in the standalone prototype without touching
 *   the network.
 * - **Live**: hydrates from `GET /me/messaging-privacy` and writes each
 *   change through a PARTIAL `PUT` (only the one field that changed) with an
 *   optimistic cache update, rolling back to what the server last confirmed
 *   and toasting on failure.
 *
 * Each control saves the instant it changes — this is the kind of privacy
 * choice a member makes the moment they decide it, not something that waits
 * for a pane-level Save button (mirrors `useHidePushPreviews`/
 * `useGroupAddPolicy`).
 */
export function useMessagingPrivacy(): MessagingPrivacyResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [demoPrivacy, setDemoPrivacy] = useState<MessagingPrivacyDTO>(
    DEFAULT_MESSAGING_PRIVACY,
  );

  const query = useQuery<MessagingPrivacyDTO>({
    queryKey: MESSAGING_PRIVACY_QUERY_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: () => getMessagingPrivacy(),
  });

  const applyPatch = useCallback(
    (patch: Partial<MessagingPrivacyDTO>) => {
      if (demoMode) {
        setDemoPrivacy((current) => ({ ...current, ...patch }));
        return;
      }
      const previous =
        queryClient.getQueryData<MessagingPrivacyDTO>(
          MESSAGING_PRIVACY_QUERY_KEY,
        ) ?? DEFAULT_MESSAGING_PRIVACY;
      queryClient.setQueryData<MessagingPrivacyDTO>(
        MESSAGING_PRIVACY_QUERY_KEY,
        { ...previous, ...patch },
      );
      void putMessagingPrivacy(patch)
        .then((fresh) =>
          queryClient.setQueryData<MessagingPrivacyDTO>(
            MESSAGING_PRIVACY_QUERY_KEY,
            fresh,
          ),
        )
        .catch((error) => {
          logError(error, { scope: "messaging-privacy" });
          // Roll back to exactly what the server last said, rather than the
          // previous local value, so two fast changes never leave a control
          // showing a state nobody chose.
          queryClient.setQueryData<MessagingPrivacyDTO>(
            MESSAGING_PRIVACY_QUERY_KEY,
            previous,
          );
          showToast(
            t("settings:visibility.messagingPrivacy.toastError"),
            "error",
          );
        });
    },
    [demoMode, queryClient, showToast, t],
  );

  const privacy = demoMode
    ? demoPrivacy
    : (query.data ?? DEFAULT_MESSAGING_PRIVACY);

  return {
    privacy,
    setShareReadReceipts: (next) => applyPatch({ shareReadReceipts: next }),
    setShareTyping: (next) => applyPatch({ shareTyping: next }),
    setSharePresence: (next) => applyPatch({ sharePresence: next }),
    setWhoCanMessage: (next) => applyPatch({ whoCanMessage: next }),
    isLoading: !demoMode && query.isLoading,
  };
}
