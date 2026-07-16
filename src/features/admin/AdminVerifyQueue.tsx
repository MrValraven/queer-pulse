import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useJoinRequests, type JoinRequestView } from "./api/useJoinRequests";
import { useReviewJoinRequest } from "./api/useReviewJoinRequest";
import styles from "./AdminMembersPage.module.css";

/**
 * Moderator review of incoming platform join requests. Sourced from
 * useJoinRequests (GET /join-requests?status=pending), with approve/decline wired
 * to useReviewJoinRequest (PATCH /join-requests/:id). The mutation invalidates the
 * ["join-requests"] query so the list refetches; we also drop the row locally with
 * a short leave animation so the action reads instantly in either mode.
 */
export function AdminVerifyQueue() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { data, isLoading } = useJoinRequests("pending");
  const reviewJoinRequest = useReviewJoinRequest();
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  function resolve(item: JoinRequestView, status: "approved" | "declined") {
    setLeaving((s) => new Set(s).add(item.id));
    window.setTimeout(() => {
      setResolved((s) => new Set(s).add(item.id));
    }, 320);
    reviewJoinRequest.mutate(
      { id: item.id, status },
      {
        onError: () => {
          setLeaving((s) => {
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

  const queue = (data ?? []).filter((r) => !resolved.has(r.id));

  if (queue.length === 0) {
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
        {queue.map((item, i) => (
          <FadeIn key={item.id} delay={i * 60}>
            <div
              className={`${styles.queueCard} ${leaving.has(item.id) ? styles.queueCardLeaving : ""}`}
            >
              <div className={styles.queueHead}>
                <AdminAvatar
                  initials={item.initials}
                  tone={item.tone}
                  size="md"
                  src={portrait(item.name)}
                />
                <div>
                  <div className={styles.queueName}>{item.name}</div>
                  <div className={styles.queueVouch}>{item.mutualLine}</div>
                  <div className={styles.queueApplied}>{item.appliedLine}</div>
                </div>
              </div>

              <p className={styles.queueMsg}>"{item.message}"</p>

              <div className={styles.queueActions}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => resolve(item, "declined")}
                >
                  {t("admin:members.verify.declineCta")}
                </Button>
                <Button
                  variant="jade"
                  size="md"
                  onClick={() => resolve(item, "approved")}
                >
                  {t("admin:members.verify.approveCta")}
                </Button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
