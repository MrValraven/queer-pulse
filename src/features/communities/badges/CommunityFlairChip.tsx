import { createElement } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { communityBadgeIcon } from "./communityBadgeIcons";
import { communityBadgeDisplayName } from "./communityBadgeDisplayName";
import {
  resolveCommunityFlairTint,
  type CommunityFlairTint,
} from "./communityBadges.catalog";
import type { CommunityFlairDTO } from "./api/communityBadges.api";
import styles from "./CommunityFlair.module.css";

const FLAIR_TINT_CLASS: Record<CommunityFlairTint, string> = {
  jade: styles.tintJade!,
  accent: styles.tintAccent!,
  plum: styles.tintPlum!,
  rose: styles.tintRose!,
  amber: styles.tintAmber!,
  violet: styles.tintViolet!,
};

export interface CommunityFlairChipProps {
  flair: Pick<CommunityFlairDTO, "name" | "starterKey" | "iconKey" | "tint">;
  size?: "sm" | "md";
}

/**
 * The worn community badge as a quiet pill after a member's name: icon, then
 * the display name (a translated starter name when untouched). Screen readers
 * hear "Badge:" first so the pill announces itself as a badge.
 */
export function CommunityFlairChip({
  flair,
  size = "sm",
}: CommunityFlairChipProps) {
  const { t } = useTranslation();
  const tintClass = FLAIR_TINT_CLASS[resolveCommunityFlairTint(flair.tint)];
  const sizeClass = size === "md" ? ` ${styles.chipMd}` : "";
  return (
    <span className={`${styles.chip} ${tintClass}${sizeClass}`}>
      {createElement(communityBadgeIcon(flair.iconKey), {
        className: styles.chipIcon,
        "aria-hidden": true,
      })}
      <span className="visuallyHidden">
        {t("communities:badges.flair.srPrefix")}
      </span>
      <span className={styles.chipName}>
        {communityBadgeDisplayName(flair, t)}
      </span>
    </span>
  );
}
