import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Button, Collapse, IconButton } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mediaMax } from "../../../shared/theme/breakpoints";
import type { CommunityBadgeAdminDTO } from "./api/communityBadges.api";
import { COMMUNITY_BADGE_RULE_COPY } from "./communityBadgeCopy.data";
import { communityBadgeDisplayName } from "./communityBadgeDisplayName";
import { CommunityFlairChip } from "./CommunityFlairChip";
import styles from "./ModToolsBadges.module.css";

type RuleCopy =
  (typeof COMMUNITY_BADGE_RULE_COPY)[keyof typeof COMMUNITY_BADGE_RULE_COPY];

/** On a phone, Delete shrinks to its icon so the switch, Edit and Delete
 *  share one line. */
const COMPACT_ACTIONS_QUERY = mediaMax("sm");

/**
 * One badge in the Mod tools pane: the chip, how members earn it, how many
 * hold it, and while it is switched off, what that means. Owner-level staff
 * get the on and off switch, Edit and Delete; everyone else sees the switch
 * held in place and no buttons. While a save is in flight every switch holds
 * still with `aria-disabled`, which keeps keyboard focus on the switch just
 * pressed where a real `disabled` would drop it to the page body.
 */
export function ModToolsBadgeRow({
  badge,
  canManage,
  isTogglePending,
  onToggleEnabled,
  onEdit,
  onDelete,
}: {
  badge: CommunityBadgeAdminDTO;
  canManage: boolean;
  /** Any switch in the pane is mid-save. Every switch holds still until it
   *  lands, so two saves can never cross. */
  isTogglePending: boolean;
  onToggleEnabled: (isEnabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const badgeName = communityBadgeDisplayName(badge, t);
  const isCompact = useMediaQuery(COMPACT_ACTIONS_QUERY);
  // A rule type a newer backend added and this build does not know has no
  // copy: the row keeps its chip and holder count and drops the earn line.
  const ruleCopy: RuleCopy | undefined = Object.hasOwn(
    COMMUNITY_BADGE_RULE_COPY,
    badge.ruleType,
  )
    ? COMMUNITY_BADGE_RULE_COPY[badge.ruleType]
    : undefined;
  const deleteLabel = t("communities:badges.manage.deleteAria", {
    badge: badgeName,
  });
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <CommunityFlairChip flair={badge} size="md" />
        <p className={styles.rowMeta}>
          {ruleCopy && (
            <>
              <span>{t(ruleCopy.earnKey, { count: badge.threshold })}</span>
              <span className={styles.rowDot} aria-hidden="true" />
            </>
          )}
          <span>
            {t("communities:badges.manage.holders", {
              count: badge.holderCount,
            })}
          </span>
        </p>
        <Collapse isOpen={!badge.isEnabled}>
          <p className={styles.offNote}>
            {t("communities:badges.manage.offNote")}
          </p>
        </Collapse>
      </div>
      <div className={styles.rowControls}>
        <label className={styles.switchHit}>
          <input
            type="checkbox"
            role="switch"
            className={styles.switch}
            checked={badge.isEnabled}
            disabled={!canManage}
            aria-disabled={isTogglePending || undefined}
            aria-label={t("communities:badges.manage.enabledAria", {
              badge: badgeName,
            })}
            onChange={(event) => {
              if (isTogglePending) return;
              onToggleEnabled(event.target.checked);
            }}
          />
        </label>
        {canManage && (
          <>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("communities:badges.manage.editAria", {
                badge: badgeName,
              })}
              onClick={onEdit}
            >
              <FiEdit2 aria-hidden />
              {t("communities:badges.manage.edit")}
            </Button>
            {isCompact ? (
              <IconButton aria-label={deleteLabel} onClick={onDelete}>
                <FiTrash2 aria-hidden />
              </IconButton>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                aria-label={deleteLabel}
                onClick={onDelete}
              >
                <FiTrash2 aria-hidden />
                {t("communities:badges.manage.delete")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
