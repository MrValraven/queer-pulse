import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { SkeletonLine } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InviteLinkPanel } from "./InviteLinkPanel";
import { SentInvitesList } from "./SentInvitesList";
import { useInviteQuota, daysUntilReset } from "./api/useInviteQuota";
import styles from "./InvitePage.module.css";

export function InvitePage() {
  const { t } = useTranslation();
  const {
    data: quota,
    isLoading: quotaLoading,
    isError: quotaError,
  } = useInviteQuota();
  // Derived at render (not cached) so the countdown stays correct if the page
  // is left open across midnight.
  const resetsInDays = quota ? daysUntilReset(quota.resetsAt) : 0;

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.inner}>
          <Link to={routes.accountProfile} className={styles.backLink}>
            ← {t("auth:common.backToProfile")}
          </Link>
          <div className={styles.eyebrow}>{t("auth:invite.eyebrow")}</div>
          <div className={styles.title}>
            <Translation
              i18nKey="auth:invite.title"
              components={{ em: <em /> }}
            />
          </div>
          <div className={styles.sub}>{t("auth:invite.sub")}</div>
          {/* Hidden entirely if the quota can't be loaded (live-mode fetch
              error) — the compose flow still works, and an absent row is
              less alarming than a stuck skeleton or a wrong count. */}
          {!quotaError && (
            <div className={styles.quotaRow}>
              {quotaLoading || !quota ? (
                <SkeletonLine width="220px" />
              ) : (
                <>
                  <div className={styles.quotaChip}>
                    {quota.remaining === 0
                      ? t("auth:invite.quota.none")
                      : t("auth:invite.quota.available", {
                          count: quota.remaining,
                        })}
                  </div>
                  <div className={styles.resetNote}>
                    {resetsInDays === 0
                      ? t("auth:invite.quota.resets_zero")
                      : t("auth:invite.quota.resets", {
                          count: resetsInDays,
                        })}
                  </div>
                </>
              )}
            </div>
          )}

          <InviteLinkPanel />

          <SentInvitesList />
        </div>
      </div>
    </AppShell>
  );
}
