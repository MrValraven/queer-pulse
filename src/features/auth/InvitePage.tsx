import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { AppShell } from "../../shared/components/layout";
import { Collapse, SkeletonLine } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InviteLinkPanel } from "./InviteLinkPanel";
import { InvitesPausedPanel } from "./InvitesPausedPanel";
import { SentInvitesList } from "./SentInvitesList";
import {
  useInviteQuota,
  daysUntilReset,
  inviteQuotaKey,
} from "./api/useInviteQuota";
import styles from "./InvitePage.module.css";

export function InvitePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const {
    data: quota,
    isLoading: quotaLoading,
    isError: quotaError,
    dataUpdatedAt: quotaUpdatedAt,
  } = useInviteQuota();
  // Both panels stay folded until the quota has an answer (data or error), so
  // a paused member never sees the compose form open and then fold away.
  const isQuotaSettled = quota !== undefined || quotaError;
  // Derived at render (not cached) so the countdown stays correct if the page
  // is left open across midnight.
  const resetsInDays = quota ? daysUntilReset(quota.resetsAt) : 0;
  // A create or resend can come back refused because our team paused this
  // member's invites after the quota was fetched. That refusal holds the
  // paused panel open at once, while the quota refetch catches up. It keeps
  // the quota's `dataUpdatedAt` from that moment, and once a newer quota
  // lands, the quota alone decides again.
  const [refusalQuotaUpdatedAt, setRefusalQuotaUpdatedAt] = useState<
    number | null
  >(null);
  const isRefusalCurrent =
    refusalQuotaUpdatedAt !== null && quotaUpdatedAt <= refusalQuotaUpdatedAt;
  const isInviteAccessPaused =
    quota?.hasInviteAccess === false || isRefusalCurrent;
  const handleInviteAccessPaused = () => {
    setRefusalQuotaUpdatedAt(quotaUpdatedAt);
    void queryClient.invalidateQueries({ queryKey: inviteQuotaKey(demoMode) });
  };

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.inner}>
          <Link to={routes.accountProfile} className={styles.backLink}>
            <FiArrowLeft aria-hidden /> {t("auth:common.backToProfile")}
          </Link>
          <div className={styles.eyebrow}>{t("auth:invite.eyebrow")}</div>
          <div className={styles.title}>
            <Translation
              i18nKey="auth:invite.title"
              components={{ em: <em /> }}
            />
          </div>
          <div className={styles.sub}>{t("auth:invite.sub")}</div>
          <Collapse isOpen={!isQuotaSettled}>
            <div className={styles.quotaRow}>
              <SkeletonLine width="220px" />
            </div>
          </Collapse>
          <Collapse isOpen={isQuotaSettled && isInviteAccessPaused}>
            <InvitesPausedPanel />
          </Collapse>

          <Collapse isOpen={isQuotaSettled && !isInviteAccessPaused}>
            {/* Hidden entirely if the quota can't be loaded (live-mode fetch
                error). The compose flow still works, and an absent row is
                less alarming than a stuck skeleton or a wrong count. */}
            <Collapse isOpen={!quotaError}>
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
            </Collapse>

            {/* A paused member's `remaining` is 0 too; that case is the
                paused panel above, so it never reads as a spent month. */}
            <InviteLinkPanel
              memberCount={quota?.memberCount}
              isQuotaExhausted={
                quota?.hasInviteAccess !== false && quota?.remaining === 0
              }
              onInviteAccessPaused={handleInviteAccessPaused}
            />
          </Collapse>

          <SentInvitesList
            isResendAllowed={!isInviteAccessPaused}
            onInviteAccessPaused={handleInviteAccessPaused}
          />
        </div>
      </div>
    </AppShell>
  );
}
