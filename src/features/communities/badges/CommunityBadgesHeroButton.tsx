import { useSearchParams } from "react-router-dom";
import { FiAward } from "react-icons/fi";
import { IconButton, Tooltip } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  BADGE_SHEET_PUSHED_STATE,
  withBadgeSheetOpen,
} from "./communityBadgeSheet.model";
import styles from "./CommunityBadgesEntry.module.css";

/**
 * The phone way into the badge sheet: an icon in the hero's action row, shown
 * at the breakpoint where the sidebar (and its Badges card) folds away. Same
 * link as the card, `?badges=open` as a pushed history entry, so Back closes
 * the sheet.
 */
export function CommunityBadgesHeroButton({
  communityName,
}: {
  communityName: string;
}) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  const openBadgeSheet = () => {
    setSearchParams((current) => withBadgeSheetOpen(current), {
      state: BADGE_SHEET_PUSHED_STATE,
    });
  };

  return (
    <span className={styles.heroOnlyMobile}>
      <Tooltip label={t("communities:badges.entry.title")}>
        <IconButton
          tone="dark"
          onClick={openBadgeSheet}
          aria-label={t("communities:badges.entry.heroAria", {
            name: communityName,
          })}
        >
          <FiAward aria-hidden />
        </IconButton>
      </Tooltip>
    </span>
  );
}
