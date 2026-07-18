import { useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useJoinRequests, type JoinRequestView } from "./api/useJoinRequests";
import { useReviewJoinRequest } from "./api/useReviewJoinRequest";
import { JoinRequestCard } from "./JoinRequestCard";
import { JoinRequestApprovedCard } from "./JoinRequestApprovedCard";
import styles from "./AdminMembersPage.module.css";

/**
 * Moderator review of incoming platform join requests. Sourced from
 * useJoinRequests (GET /join-requests?status=pending), with approve/decline wired
 * to useReviewJoinRequest (PATCH /join-requests/:id). The mutation invalidates the
 * ["join-requests"] query so the list refetches; declines drop the row locally
 * with a short leave animation so the action reads instantly in either mode.
 *
 * Approvals do *not* drop: the response carries an invite code, and since there
 * is no email service the reviewer has to copy that link and send it themselves.
 * The approved card is held in local state so it survives the refetch that
 * removes the row from the pending list.
 */
export function AdminVerifyQueue() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { data, isLoading } = useJoinRequests("pending");
  const reviewJoinRequest = useReviewJoinRequest();
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [declined, setDeclined] = useState<Set<string>>(new Set());
  // Approved rows keep their place, now carrying the invite code to hand over.
  const [approved, setApproved] = useState<JoinRequestView[]>([]);

  function unmarkLeaving(id: string) {
    setLeaving((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  }

  function resolve(item: JoinRequestView, status: "approved" | "declined") {
    if (status === "declined") {
      setLeaving((s) => new Set(s).add(item.id));
      window.setTimeout(() => {
        setDeclined((s) => new Set(s).add(item.id));
      }, 320);
    }
    reviewJoinRequest.mutate(
      { id: item.id, status },
      {
        onSuccess: (dto) => {
          if (status !== "approved") return;
          setApproved((list) =>
            list.some((r) => r.id === item.id)
              ? list
              : [{ ...item, inviteCode: dto.inviteCode }, ...list],
          );
        },
        onError: () => {
          unmarkLeaving(item.id);
          setDeclined((s) => {
            const next = new Set(s);
            next.delete(item.id);
            return next;
          });
          showToast(t("admin:members.verify.errorToast"), "error");
        },
      },
    );
    showToast(
      status === "approved"
        ? t("admin:members.verify.approvedToast", { name: item.name })
        : t("admin:members.verify.declinedToast", { name: item.name }),
      status === "approved" ? "success" : "info",
    );
  }

  if (isLoading) {
    return (
      <div className={styles.queueGrid}>
        {[0, 1, 2].map((i) => (
          <div className={styles.queueCard} key={i}>
            <SkeletonLine width="55%" height={18} />
            <SkeletonLine width="80%" />
            <SkeletonLine width="90%" height={40} />
          </div>
        ))}
      </div>
    );
  }

  const approvedIds = new Set(approved.map((r) => r.id));
  const queue = (data ?? []).filter(
    (r) => !declined.has(r.id) && !approvedIds.has(r.id),
  );

  if (queue.length === 0 && approved.length === 0) {
    return (
      <div className={styles.queueEmpty}>
        <p className={styles.queueIntro}>{t("admin:members.verify.empty")}</p>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.queueIntro}>{t("admin:members.verify.intro")}</p>
      <p className={styles.queueIntroEm}>
        <em>{t("admin:members.verify.introEm")}</em>
      </p>

      <div className={styles.queueGrid}>
        {approved.map((item) => (
          <FadeIn key={item.id}>
            <JoinRequestApprovedCard item={item} />
          </FadeIn>
        ))}
        {queue.map((item, i) => (
          <FadeIn key={item.id} delay={i * 60}>
            <JoinRequestCard
              item={item}
              leaving={leaving.has(item.id)}
              onDecision={(status) => resolve(item, status)}
            />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
