import { createPortal } from "react-dom";
import { useId } from "react";
import { Button, useDismiss } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RecognitionLevel } from "./api/recognition.adapters";
import type { Badge } from "./badges.data";
import { badgeDisplayMetaFor } from "./badgeCatalog.data";
import { levelNameKeyFor } from "./levelLadder.data";
import { BadgeMedallion } from "./BadgeMedallion";
import styles from "./BadgesPage.module.css";

interface BadgeEarnMomentProps {
  badge: Badge;
  level: RecognitionLevel;
  onClose: () => void;
}

function splitTitle(name: string): { lead: string; last: string } {
  const words = name.trim().split(" ");
  const last = words.pop() ?? name;
  return { lead: words.join(" "), last };
}

/** The celebration moment for earning a badge (or a "preview" of it from the
 *  momentum section, before it's actually earned). Self-contained modal. */
export function BadgeEarnMoment({
  badge,
  level,
  onClose,
}: BadgeEarnMomentProps) {
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  const titleId = useId();
  // The catalogue ships a stable id beside its English display words, so the
  // words resolve here rather than off the wire (see `badgeCatalog.data.ts`).
  // This modal always frames the badge as won, so the earned wording is the
  // right tense even for the momentum section's preview. An unmapped id keeps
  // the server's own English.
  // The ladder's words are owned by the frontend and keyed on the level
  // NUMBER (see `levelLadder.data.ts`); an unknown rung keeps the server's
  // own English name.
  const levelNameKey = levelNameKeyFor(level.level);
  const displayMeta = badgeDisplayMetaFor(badge.key);
  const { lead, last } = splitTitle(
    displayMeta ? t(displayMeta.nameKey) : badge.name,
  );

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
        className={styles.earnCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <BadgeMedallion badge={badge} earned size="big" landing />
        <div className={styles.earnKicker}>
          {badge.verifiedBy === "peer"
            ? t("members:badges.earn.kickerGiven")
            : t("members:badges.earn.kickerBadge")}
        </div>
        <h3 id={titleId}>
          {lead ? `${lead} ` : ""}
          <em>{last}</em>
        </h3>
        <p>
          {displayMeta
            ? t(displayMeta.earnedContextKey)
            : (badge.criteria ?? badge.when)}
        </p>
        {badge.xpReward !== undefined && (
          <p>{t("members:badges.earn.body", { xp: badge.xpReward })}</p>
        )}
        <div className={styles.earnActs}>
          <Button variant="ghost-dark" onClick={onClose}>
            {t("members:badges.earn.putInCase")}
          </Button>
        </div>
        <p className={styles.earnFootnote}>
          {t("members:badges.earn.footnote", {
            level: level.level,
            name: levelNameKey ? t(levelNameKey) : level.name,
          })}
        </p>
      </div>
    </div>,
    document.body,
  );
}
