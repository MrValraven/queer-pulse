import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useJoinRequestSample } from "./api/useJoinRequestSample";
import styles from "./AdminMembersPage.module.css";

/**
 * Read-only periodic peer-review sample of past join-request decisions
 * (guideline audit P8/E8). Rendered as the "Quality sample" tab on the
 * members admin page, the same way the pending queue lives as a tab rather
 * than a standalone route (`AdminVerifyQueue` inside `AdminMembersPage`).
 *
 * Deliberate scope cut, stated in the body copy below and not just in this
 * comment: this gives a second admin something to look at and discuss, but
 * it doesn't record a second signoff or agree/disagree outcome — that would
 * need its own migration and table this task doesn't build. "Resample" just
 * re-runs the random query.
 */
export function AdminJoinRequestSamplePage() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, isFetching } = useJoinRequestSample(10);

  return (
    <div>
      <p className={styles.queueIntro}>{t("admin:members.sample.intro")}</p>
      <p className={styles.queueIntroEm}>
        <em>{t("admin:members.sample.explainer")}</em>
      </p>
      <Button
        variant="ghost"
        size="md"
        onClick={() => void refetch()}
        disabled={isFetching}
      >
        {t("admin:members.sample.resampleCta")}
      </Button>

      {isLoading ? (
        <div className={styles.queueGrid}>
          {[0, 1, 2].map((placeholder) => (
            <div className={styles.queueCard} key={placeholder}>
              <SkeletonLine width="55%" height={18} />
              <SkeletonLine width="80%" />
            </div>
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <p className={styles.queueIntro}>{t("admin:members.sample.empty")}</p>
      ) : (
        <div className={styles.queueGrid}>
          {(data ?? []).map((item, index) => (
            <FadeIn key={item.id} delay={index * 60}>
              <div className={styles.queueCard}>
                <div className={styles.queueName}>{item.name}</div>
                <div className={styles.queueApplied}>{item.appliedLine}</div>
                <p className={styles.queueMsg}>&ldquo;{item.message}&rdquo;</p>
                <dl className={styles.queueFacts}>
                  <div className={styles.queueFact}>
                    <dt className={styles.queueFactLabel}>
                      {t("admin:members.sample.decisionLabel")}
                    </dt>
                    <dd className={styles.queueFactValue}>
                      {item.status === "approved" || item.status === "declined"
                        ? t(`admin:members.verify.status.${item.status}`)
                        : item.status}
                    </dd>
                  </div>
                </dl>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
