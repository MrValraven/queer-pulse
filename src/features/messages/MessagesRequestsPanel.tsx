import { useState } from "react";
import { FiInbox } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { EmptyState, FadeIn, LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useConnectionActions } from "../connect/api/useConnectionActions";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import { ConnectionsGridSkeleton } from "../connect/ConnectionsSkeleton";
import type { ConnectionView } from "../connect/connections.data";
import {
  MessagesInboundRequestCard,
  MessagesOutboundRequestCard,
} from "./MessagesRequestCards";
import { GroupInviteRequestRow } from "./GroupInviteRequestRow";
import { useGroupInviteRequestActions } from "./useGroupInviteRequestActions";
import { useMessageRequestReply } from "./useMessageRequestReply";
import styles from "./MessagesPage.module.css";

const stagger = (index: number) => Math.min(index, 8) * 60;

/**
 * The Messages inbox's "Requests" tab (MSG-1, extended PRD-344): incoming
 * first-contact message requests, PLUS the member's own OUTBOUND pending
 * ones, under their own heading rather than mixed into one list. A message
 * request from a stranger IS a pending connection request carrying the intro
 * message (`MessageRequestsService.messageRequest`), so both sections reuse
 * `useConnectionActions`/`useConnectionsList` rather than a second data
 * layer: optimistic accept/decline/withdraw, error-toast-only feedback (the
 * card leaving its list IS the success feedback, matching `ConnectionsPage`).
 *
 * PRD-344: plain Accept now opens the materialized thread too, matching
 * Reply. PRD-340: Reply no longer pre-accepts before the member has typed
 * anything; `useMessageRequestReply` owns that inline-composer state, and
 * SENDING the reply is what accepts the request.
 */
export function MessagesRequestsPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inbound = useConnectionsList("incoming");
  const outbound = useConnectionsList("sent");
  const { acceptRequest, declineRequest, withdrawRequest } =
    useConnectionActions();
  const groupInvites = useGroupInviteRequestActions();
  const reply = useMessageRequestReply();
  // Disables the acted-on card's buttons only, keyed by slug. Shared across
  // both sections since a slug can only ever appear in one of them at once.
  const [busySlug, setBusySlug] = useState<string | null>(null);

  /** Accept, then open the materialized thread: same handoff Reply gives. */
  async function handleAccept(view: ConnectionView) {
    setBusySlug(view.slug);
    const didAccept = await acceptRequest({
      slug: view.slug,
      id: view.meta.id,
    });
    setBusySlug((current) => (current === view.slug ? null : current));
    if (!didAccept) return;
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    void navigate(routes.messages, {
      state: { to: { slug: view.slug, name: view.name } },
    });
  }

  function handleDecline(view: ConnectionView) {
    setBusySlug(view.slug);
    void declineRequest({ slug: view.slug, id: view.meta.id }).finally(() =>
      setBusySlug((current) => (current === view.slug ? null : current)),
    );
  }

  function handleWithdraw(view: ConnectionView) {
    setBusySlug(view.slug);
    void withdrawRequest({ slug: view.slug, id: view.meta.id }).finally(() =>
      setBusySlug((current) => (current === view.slug ? null : current)),
    );
  }

  if (inbound.loading || outbound.loading) {
    return <ConnectionsGridSkeleton count={3} />;
  }

  // A request someone sent must never be lost to an outage: the empty state
  // here would tell them nobody has written. The outbound list degrades
  // quietly on its own error instead (it's also always reachable under
  // Connections > Sent), rather than blocking the whole tab on a lower-stakes
  // fetch.
  if (inbound.isError) {
    return (
      <LoadErrorState
        compact
        onRetry={inbound.refetch}
        description={t("messages:requests.loadErrorBody")}
      />
    );
  }

  const outboundViews = outbound.isError ? [] : outbound.views;
  const hasGroupInvites = groupInvites.invites.length > 0;

  if (
    inbound.views.length === 0 &&
    outboundViews.length === 0 &&
    !hasGroupInvites
  ) {
    return (
      <EmptyState
        compact
        icon={<FiInbox />}
        title={t("messages:requests.emptyTitle")}
        description={t("messages:requests.emptyDescription")}
      />
    );
  }

  const hasOtherSections = inbound.views.length > 0 || outboundViews.length > 0;

  return (
    <div className={styles.requestsPanel}>
      {hasGroupInvites && (
        <div className={styles.requestsSection}>
          {hasOtherSections && (
            <h3 className={styles.requestsSectionHeading}>
              {t("messages:requests.groupInvite.sectionHeading")}
            </h3>
          )}
          <div className={styles.requestsList}>
            {groupInvites.invites.map((invite, index) => (
              <FadeIn key={invite.id} delay={stagger(index)}>
                <GroupInviteRequestRow
                  invite={invite}
                  isBusy={groupInvites.busyInviteId === invite.id}
                  onAccept={() => void groupInvites.handleAccept(invite)}
                  onDecline={() => void groupInvites.handleDecline(invite)}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      )}
      {inbound.views.length > 0 && (
        <div className={styles.requestsSection}>
          {outboundViews.length > 0 && (
            <h3 className={styles.requestsSectionHeading}>
              {t("messages:requests.inboundHeading")}
            </h3>
          )}
          <div className={styles.requestsList}>
            {inbound.views.map((view, index) => (
              <FadeIn key={view.slug} delay={stagger(index)}>
                <MessagesInboundRequestCard
                  view={view}
                  onAccept={() => void handleAccept(view)}
                  onDecline={() => handleDecline(view)}
                  isBusy={
                    busySlug === view.slug ||
                    (reply.replyingSlug === view.slug && reply.isSubmitting)
                  }
                  isReplying={reply.replyingSlug === view.slug}
                  replyDraft={reply.draft}
                  onReplyDraftChange={reply.setDraft}
                  onStartReply={() => reply.startReply(view.slug)}
                  onCancelReply={reply.cancelReply}
                  onSubmitReply={() => void reply.submitReply(view)}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      )}
      {outboundViews.length > 0 && (
        <div className={styles.requestsSection}>
          {inbound.views.length > 0 && (
            <h3 className={styles.requestsSectionHeading}>
              {t("messages:requests.outboundHeading")}
            </h3>
          )}
          <div className={styles.requestsList}>
            {outboundViews.map((view, index) => (
              <FadeIn key={view.slug} delay={stagger(index)}>
                <MessagesOutboundRequestCard
                  view={view}
                  onWithdraw={() => handleWithdraw(view)}
                  isBusy={busySlug === view.slug}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
