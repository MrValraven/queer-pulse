import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  EmptyState,
  LoadErrorState,
  Spinner,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useGroupJoinPreview } from "./api/useGroupJoinPreview";
import { useJoinGroupByToken } from "./api/useGroupManagementMutations";
import { groupErrorCodeOf, groupErrorMessage } from "./api/groupErrorMessages";
import { JoinGroupPreviewCard } from "./JoinGroupPreviewCard";
import styles from "./JoinGroupPage.module.css";

/**
 * PRD-358: the group invite-link landing page (`/messages/join/:token`).
 * Gated the same as the rest of `/messages` (a logged-out visitor is bounced
 * to sign in first, same as tapping any other messages link); see the
 * `/messages/*` addition in `authGate.ts`.
 *
 * Four states: loading, an invalid/rotated/dissolved link (`INVITE_LINK_INVALID`,
 * terminal, no retry can fix it), a load fault of some other kind (retryable),
 * and the resolved preview, which itself branches on `isMember` (Open chat vs
 * Join). `GROUP_FULL`/`GROUP_DISSOLVED`/`REMOVED_FROM_GROUP` are refusals of
 * the JOIN action itself, not of the preview load, so they surface as a toast
 * on the Join button rather than as a page state; the preview can resolve
 * cleanly and still have the join underneath it refused a moment later (the
 * group filled up, or the caller was removed since the link was generated).
 */
export function JoinGroupPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { demoMode } = useDemoMode();
  const { token } = useParams<{ token: string }>();
  const preview = useGroupJoinPreview(token);
  const joinGroup = useJoinGroupByToken();
  const [isJoining, setIsJoining] = useState(false);

  async function handleJoin() {
    if (!token) return;
    setIsJoining(true);
    try {
      const joined = await joinGroup.mutateAsync(token);
      if (demoMode) {
        // No local demo group thread stands in for a fresh join (the preview
        // itself reuses the ALREADY-LEFT demo group), so this simulates
        // rather than pretending to open a thread that would not exist in
        // the inbox.
        showToast(t("messages:join.joinedDemo"), "info");
        void navigate(routes.messages);
      } else {
        void navigate(
          joined
            ? `${routes.messages}?c=${encodeURIComponent(joined.id)}`
            : routes.messages,
        );
      }
    } catch (error) {
      showToast(
        groupErrorMessage(error, t, t("messages:group.error.generic")),
        "error",
      );
    } finally {
      setIsJoining(false);
    }
  }

  function handleOpenChat() {
    if (!preview.data) return;
    void navigate(
      `${routes.messages}?c=${encodeURIComponent(preview.data.conversationId)}`,
    );
  }

  const isInvalidLink =
    groupErrorCodeOf(preview.error) === "INVITE_LINK_INVALID";

  return (
    <AppShell>
      <div className={styles.page}>
        {preview.data ? (
          <JoinGroupPreviewCard
            preview={preview.data}
            isJoining={isJoining}
            onJoin={() => void handleJoin()}
            onOpenChat={handleOpenChat}
          />
        ) : preview.isError && isInvalidLink ? (
          <EmptyState
            icon={<FiUsers aria-hidden />}
            title={t("messages:join.invalidLinkTitle")}
            description={t("messages:join.invalidLinkBody")}
            action={{
              label: t("messages:join.backToMessages"),
              to: routes.messages,
            }}
          />
        ) : preview.isError ? (
          <LoadErrorState
            title={t("messages:join.errorTitle")}
            description={t("messages:join.errorBody")}
            onRetry={() => void preview.refetch()}
          />
        ) : (
          // Covers both an in-flight fetch AND the query sitting disabled
          // while `useGroupJoinPreview` waits on auth to finish checking
          // (`enabled: false` means TanStack Query's own `isLoading` is
          // FALSE, since nothing is actually fetching yet), either way,
          // there is no data and no settled error, so the honest answer is
          // "still loading", not a blank page.
          <div className={styles.loading} role="status" aria-live="polite">
            <Spinner /> {t("messages:join.loading")}
          </div>
        )}
      </div>
    </AppShell>
  );
}
