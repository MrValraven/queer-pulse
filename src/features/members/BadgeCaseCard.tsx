import { createPortal } from "react-dom";
import { useId } from "react";
import { Button, useDismiss } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RecognitionLevel } from "./api/recognition.adapters";
import type { Badge } from "./badges.data";
import { rarestBadge } from "./badgeSelectors";
import { BadgeMedallion } from "./BadgeMedallion";
import styles from "./BadgesPage.module.css";

interface BadgeCaseCardProps {
  memberName: string;
  level: RecognitionLevel;
  earnedBadges: Badge[];
  onClose: () => void;
}

const MAX_SHOWN = 10;

/**
 * A "case card" summarizing a member's earned badges, level and XP, opened from
 * the hero's "View your case".
 *
 * Read-only for now: there is no print stylesheet, canvas export or share here,
 * only Close. The hero's button used to say "Print your case", which sent
 * members looking for a file that was never produced; the label now matches
 * what the dialog actually does. Add the export first, then rename the CTA.
 */
export function BadgeCaseCard({
  memberName,
  level,
  earnedBadges,
  onClose,
}: BadgeCaseCardProps) {
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  const titleId = useId();
  const totalXp = earnedBadges.reduce(
    (sum, badge) => sum + (badge.xpReward ?? 0),
    0,
  );
  const shown = earnedBadges
    .slice()
    .sort((a, z) => {
      const rarest = rarestBadge([a, z]);
      return rarest === a ? -1 : 1;
    })
    .slice(0, MAX_SHOWN);
  const overflowCount = Math.max(0, earnedBadges.length - MAX_SHOWN);

  return createPortal(
    <div
      className={styles.earnScrim}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.caseCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.ccTop}>
          <div>
            <div className={styles.ccLv}>
              {t("members:badges.hero.levelWord")} {level.level} · {level.name}
            </div>
            <div id={titleId} className={styles.ccName}>
              {memberName}
            </div>
          </div>
          <div className={styles.ccSubtitle}>
            {t("members:badges.caseCard.subtitle")}
          </div>
        </div>
        <div className={styles.ccMeds}>
          {shown.length ? (
            <>
              {shown.map((badge) => (
                <BadgeMedallion
                  key={badge.key}
                  badge={badge}
                  earned
                  size="xs"
                  className={styles.medPlain}
                />
              ))}
              {overflowCount > 0 && (
                <span className={styles.ccMore}>+{overflowCount}</span>
              )}
            </>
          ) : (
            <span className={styles.ccEmpty}>
              {t("members:badges.caseCard.emptyDesc")}
            </span>
          )}
        </div>
        <div className={styles.ccFoot}>
          <span>
            {t("members:badges.caseCard.footStats", {
              count: earnedBadges.length,
              xp: totalXp.toLocaleString(),
            })}
          </span>
        </div>
        <div className={styles.ccActs}>
          <Button variant="ghost-dark" onClick={onClose}>
            {t("members:badges.caseCard.close")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
