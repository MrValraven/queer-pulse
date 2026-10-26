import type { CSSProperties } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle, FiPauseCircle } from "react-icons/fi";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { Collapse } from "../../shared/components/ui/Collapse";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { AdminChip } from "./ui";
import type { AdminInviteQuotaMemberDTO } from "./api/adminInvites.api";
import styles from "./AdminInviteQuotaModal.module.css";

/**
 * This month's usage against the limit: "12 of 50" over a thin meter. At or
 * over the limit the meter turns accent and a "Limit reached" line folds in
 * under it, so the state reads in words as well as colour. The meter itself
 * is decorative (`aria-hidden`); the figure carries the meaning.
 *
 * While the member's invite access is paused, the meter goes muted and an
 * "Invites paused" line with its own icon takes the place of "Limit reached":
 * the pause is what stops their invites then, whatever the count.
 */
export function AdminInviteQuotaUsage({
  sentThisMonth,
  monthlyLimit,
  isPaused,
}: {
  sentThisMonth: number;
  monthlyLimit: number;
  /** True while the member's invite access is paused. */
  isPaused: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isAtLimit = !isPaused && sentThisMonth >= monthlyLimit;
  const fillRatio =
    monthlyLimit === 0 ? 1 : Math.min(sentThisMonth / monthlyLimit, 1);
  return (
    <div
      className={styles.usageCell}
      data-at-limit={isAtLimit || undefined}
      data-paused={isPaused || undefined}
    >
      <span className={styles.cellLabel}>
        {t("admin:adminInvites.quota.column.thisMonth")}
      </span>
      <span className={styles.usageFigure}>
        <Translation
          i18nKey="admin:adminInvites.quota.usage"
          values={{ sent: sentThisMonth, limit: monthlyLimit }}
          slots={{
            sent: (
              <RollingNumber
                value={fmt.number(sentThisMonth)}
                numericValue={sentThisMonth}
              />
            ),
            limit: (
              <RollingNumber
                value={fmt.number(monthlyLimit)}
                numericValue={monthlyLimit}
              />
            ),
          }}
        />
      </span>
      <span className={styles.meter} aria-hidden>
        <span
          className={styles.meterFill}
          style={{ "--meter-fill": fillRatio } as CSSProperties}
        />
      </span>
      <Collapse isOpen={isAtLimit}>
        <span className={styles.limitReached}>
          <FiAlertCircle aria-hidden />
          {t("admin:adminInvites.quota.limitReached")}
        </span>
      </Collapse>
      <Collapse isOpen={isPaused}>
        <span className={styles.invitesPaused}>
          <FiPauseCircle aria-hidden />
          {t("admin:adminInvites.quota.invitesPaused")}
        </span>
      </Collapse>
    </div>
  );
}

/**
 * The limit in force and where it comes from: a muted "Default · 7" (the
 * platform default plus any bonus), or a "Custom" chip beside the admin's
 * own number. Swapping between the two cross-fades; a changed number rolls.
 */
export function AdminInviteQuotaLimitValue({
  member,
}: {
  member: AdminInviteQuotaMemberDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const hasOverride = member.inviteMonthlyQuota !== null;
  const limitFigure = (
    <RollingNumber
      value={fmt.number(member.monthlyLimit)}
      numericValue={member.monthlyLimit}
    />
  );
  return (
    <div className={styles.limitCell}>
      <span className={styles.cellLabel}>
        {t("admin:adminInvites.quota.column.monthlyLimit")}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={hasOverride ? "custom" : "default"}
          className={hasOverride ? styles.limitCustom : styles.limitDefault}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16 }}
        >
          {hasOverride ? (
            <>
              <AdminChip tone="violet">
                {t("admin:adminInvites.quota.customChip")}
              </AdminChip>
              <span className={styles.limitNumber}>{limitFigure}</span>
            </>
          ) : (
            <Translation
              i18nKey="admin:adminInvites.quota.limitDefault"
              values={{ limit: member.monthlyLimit }}
              slots={{ limit: limitFigure }}
            />
          )}
        </m.span>
      </AnimatePresence>
    </div>
  );
}
