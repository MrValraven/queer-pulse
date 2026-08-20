import { FiInbox } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { IncomingCard } from "../connect/ConnectionCards";
import { useConnectionActions } from "../connect/api/useConnectionActions";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import { ConnectionsGridSkeleton } from "../connect/ConnectionsSkeleton";
import type { ConnectionView } from "../connect/connections.data";
import styles from "./MessagesPage.module.css";

const stagger = (index: number) => Math.min(index, 8) * 60;

/**
 * The Messages inbox's "Requests" tab (MSG-1): incoming first-contact message
 * requests. A message request from someone who isn't yet an accepted
 * connection IS a pending connection request carrying the intro message —
 * `MessageRequestsService.messageRequest` seeds exactly this when the two
 * aren't connected (see `message-requests.service.ts`). Rather than a second
 * accept/decline implementation, this reuses the SAME `IncomingCard` and
 * `useConnectionActions` the Connections page's own Incoming tab already
 * uses — same optimistic accept/decline, same error-toast-only feedback (no
 * success toast here either, matching `ConnectionsPage.tsx`'s own pattern:
 * the card leaving the list IS the feedback).
 */
export function MessagesRequestsPanel() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { views, loading } = useConnectionsList("incoming");
  const { acceptRequest, declineRequest } = useConnectionActions();

  function handleAccept(view: ConnectionView) {
    void acceptRequest({ slug: view.slug, id: view.meta.id });
    // Accepting materializes (or reuses) the DM conversation server-side —
    // refresh the inbox so it appears without waiting for the next poll/frame.
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }

  function handleDecline(view: ConnectionView) {
    void declineRequest({ slug: view.slug, id: view.meta.id });
  }

  if (loading) {
    return <ConnectionsGridSkeleton count={3} />;
  }

  if (views.length === 0) {
    return (
      <EmptyState
        compact
        icon={<FiInbox />}
        title={t("messages:requests.emptyTitle")}
        description={t("messages:requests.emptyDescription")}
      />
    );
  }

  return (
    <div className={styles.requestsList}>
      {views.map((view, index) => (
        <FadeIn key={view.slug} delay={stagger(index)}>
          <IncomingCard
            view={view}
            onAccept={() => handleAccept(view)}
            onDecline={() => handleDecline(view)}
          />
        </FadeIn>
      ))}
    </div>
  );
}
