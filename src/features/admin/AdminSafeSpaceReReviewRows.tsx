import { useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { intlLocale } from "../../shared/i18n/locale";
import { formatDate } from "../../shared/lib/date";
import { businessPath } from "../../app/routeMap";
import { AdminChip } from "./ui";
import {
  AdminSafeSpaceBadgeActionModal,
  type BadgeActionTarget,
} from "./AdminSafeSpaceBadgeActionModal";
import type { SafeSpaceReReviewDueDTO } from "../safety/api/safeSpaceGovernance.api";
import styles from "./AdminSafeSpaceGovernance.module.css";

/**
 * Badges that have been speaking for themselves for over a year, most overdue
 * first, alongside which of them are currently suspended.
 *
 * The open-flag count appears here and nowhere a member or a venue owner can
 * reach: a running tally in public would turn a safety mechanism into a
 * pillory and make flagging unsafe for the person doing it.
 */
export function AdminSafeSpaceReReviewRows({
  spaces,
}: {
  spaces: SafeSpaceReReviewDueDTO[];
}) {
  const { t } = useTranslation();
  const [target, setTarget] = useState<BadgeActionTarget | null>(null);

  if (spaces.length === 0) {
    return (
      <p className={styles.emptyLine}>
        {t("safety:governance.reReview.empty")}
      </p>
    );
  }

  return (
    <>
      <div className={styles.rows}>
        {spaces.map((space, index) => (
          <FadeIn key={space.listingId} delay={Math.min(index, 8) * 50}>
            <ReReviewRow space={space} onAct={setTarget} />
          </FadeIn>
        ))}
      </div>

      {target && (
        <AdminSafeSpaceBadgeActionModal
          target={target}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}

function ReReviewRow({
  space,
  onAct,
}: {
  space: SafeSpaceReReviewDueDTO;
  onAct: (target: BadgeActionTarget) => void;
}) {
  const { t, language } = useTranslation();
  const locale = intlLocale(language);

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{space.name}</span>
          {space.isBadgeSuspended ? (
            <AdminChip tone="danger" dot>
              {t("safety:governance.reReview.suspendedChip")}
            </AdminChip>
          ) : (
            <AdminChip tone="amber" dot>
              {t("safety:governance.reReview.dueChip", {
                count: space.daysOverdue,
                days: space.daysOverdue,
              })}
            </AdminChip>
          )}
          {space.openFlagCount > 0 && (
            <AdminChip tone="coral">
              {t("safety:governance.reReview.openFlags", {
                count: space.openFlagCount,
              })}
            </AdminChip>
          )}
        </div>
        <div className={styles.rowMeta}>
          {space.badgeAwardedAt
            ? t("safety:governance.reReview.awarded", {
                date: formatDate(space.badgeAwardedAt, locale),
              })
            : t("safety:governance.reReview.noAwardDate")}
        </div>
      </div>

      <div className={styles.rowChips}>
        <Button
          variant="ghost"
          size="md"
          to={businessPath(space.slug)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("safety:governance.reReview.openCta")}
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() =>
            onAct({
              ref: space.ref,
              name: space.name,
              kind: space.isBadgeSuspended ? "restore" : "suspend",
            })
          }
        >
          {t(
            space.isBadgeSuspended
              ? "safety:governance.badge.restoreCta"
              : "safety:governance.badge.suspendCta",
          )}
        </Button>
      </div>
    </div>
  );
}
