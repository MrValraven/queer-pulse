import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import { FiAward } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  BADGE_SHEET_PUSHED_STATE,
  withBadgeSheetOpen,
} from "./communityBadgeSheet.model";
import sidebarStyles from "../CommunityDetailPage.module.css";
import styles from "./CommunityBadgesEntry.module.css";

/**
 * The sidebar's "Badges" card, the desktop way into the badge sheet. A member
 * reads that they can check their progress and pick a badge to wear; a
 * visitor reads what members earn here. The button writes `?badges=open` as a
 * pushed history entry, so Back closes the sheet again, and the sheet host
 * mounted by the page does the rest. Phones get the hero button.
 */
export function CommunityBadgesSidebarCard({
  communityName,
  isMember,
}: {
  communityName: string;
  isMember: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const [, setSearchParams] = useSearchParams();

  const openBadgeSheet = () => {
    setSearchParams((current) => withBadgeSheetOpen(current), {
      state: BADGE_SHEET_PUSHED_STATE,
    });
  };

  return (
    <section
      className={[sidebarStyles.sbC, styles.sidebarOnly].join(" ")}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className={sidebarStyles.sbLbl}>
        {t("communities:badges.entry.title")}
      </h2>
      <p className={styles.body}>
        {isMember
          ? t("communities:badges.entry.body.member")
          : t("communities:badges.entry.body.visitor", {
              name: communityName,
            })}
      </p>
      <Button
        variant="ghost"
        className={[sidebarStyles.sbFull, styles.cta].join(" ")}
        onClick={openBadgeSheet}
      >
        <FiAward aria-hidden /> {t("communities:badges.entry.cta")}
      </Button>
    </section>
  );
}
