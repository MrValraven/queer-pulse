import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, FadeIn } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityBadgeDTO } from "./api/communityBadges.api";
import { CommunityFlairChip } from "./CommunityFlairChip";
import { COMMUNITY_BADGE_RULE_COPY } from "./communityBadgeCopy.data";
import { badgeProgressView } from "./communityBadgeSheet.model";
import styles from "./CommunityBadgeSheet.module.css";

type RuleCopy =
  (typeof COMMUNITY_BADGE_RULE_COPY)[keyof typeof COMMUNITY_BADGE_RULE_COPY];

export interface CommunityBadgeRowProps {
  badge: CommunityBadgeDTO;
  isMember: boolean;
  isWorn: boolean;
  isFocused: boolean;
  isPending: boolean;
  onWear: () => void;
  onStopWearing: () => void;
}

/**
 * One badge in the sheet: the chip, how it is earned and, for a member, a
 * quiet progress bar with its count, the earned date and the wear action.
 * Wearing is always the member's own choice; an earned badge stays private
 * until they press "Wear this badge".
 */
export function CommunityBadgeRow({
  badge,
  isMember,
  isWorn,
  isFocused,
  isPending,
  onWear,
  onStopWearing,
}: CommunityBadgeRowProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const chipId = useId();
  // A rule type a newer backend added and this build does not know has no
  // copy: the row keeps its chip, date and wear action and drops the lines.
  const ruleCopy: RuleCopy | undefined = Object.hasOwn(
    COMMUNITY_BADGE_RULE_COPY,
    badge.ruleType,
  )
    ? COMMUNITY_BADGE_RULE_COPY[badge.ruleType]
    : undefined;
  const progress = isMember ? badgeProgressView(badge) : null;
  const isEarned = progress?.isEarned === true;

  // Held while a wear call is in flight: aria-disabled keeps focus on the
  // button, where a real `disabled` would drop it to the page body.
  const pressUnlessPending = (action: () => void) => () => {
    if (!isPending) action();
  };

  return (
    <article
      className={[styles.row, isFocused && styles.rowFocused]
        .filter(Boolean)
        .join(" ")}
      data-focused={isFocused ? "true" : undefined}
    >
      <span id={chipId} className={styles.rowChip}>
        <CommunityFlairChip flair={badge} size="md" />
      </span>
      {ruleCopy && (
        <p className={styles.rowEarn}>
          {t(ruleCopy.earnKey, { count: badge.threshold })}
        </p>
      )}
      {progress && ruleCopy && (
        <div className={styles.rowProgress}>
          <span className={styles.track} aria-hidden>
            <span
              className={styles.fill}
              style={{ transform: `scaleX(${progress.ratio})` }}
            />
          </span>
          <p className={styles.rowProgressLine}>
            {t(ruleCopy.progressKey, {
              count: badge.threshold,
              total: fmt.number(badge.threshold),
              // The bar stops at full, so the count does too: an earned
              // badge reads "365 of 365 days" for a member of 620 days.
              progress: fmt.number(
                Math.min(progress.progressCount, badge.threshold),
              ),
            })}
          </p>
        </div>
      )}
      {progress && (
        <p className={styles.rowStatus}>
          {isEarned && badge.earnedAt !== null
            ? t("communities:badges.sheet.earnedOn", {
                date: fmt.date(new Date(badge.earnedAt)),
              })
            : t("communities:badges.sheet.notEarned")}
        </p>
      )}
      {isEarned && (
        <FadeIn key={isWorn ? "worn" : "free"} className={styles.rowActions}>
          {isWorn ? (
            <>
              <p className={styles.wearing}>
                <FiCheck aria-hidden className={styles.wearingIcon} />
                {t("communities:badges.sheet.wearing")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className={styles.actionButton}
                aria-describedby={chipId}
                aria-disabled={isPending || undefined}
                onClick={pressUnlessPending(onStopWearing)}
              >
                {t("communities:badges.sheet.stopWearing")}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={styles.actionButton}
              aria-describedby={chipId}
              aria-disabled={isPending || undefined}
              onClick={pressUnlessPending(onWear)}
            >
              {t("communities:badges.sheet.wear")}
            </Button>
          )}
        </FadeIn>
      )}
    </article>
  );
}
