import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useCommunityGiving } from "../api/useCommunityGiving";
import { GIVING_PANEL_ID, GIVING_TAB_ID } from "./givingConstants";
import { givingMethodIcon, givingMethodTitle } from "./givingPlatforms";
import {
  revealGivingPanel,
  type GivingNavigationState,
} from "./useGivingPanelFocus";
import sidebarStyles from "../CommunityDetailPage.module.css";
import styles from "./CommunityGivingSidebarCard.module.css";

/** How many method names the card lists before folding the rest into
 *  "{count} more". */
const VISIBLE_METHOD_LIMIT = 3;

/**
 * The sidebar's "Support {name}" card: the intro (two lines at most) and the
 * names of up to three ways to support, never their values. The button opens
 * the Support tab, where the values, copy buttons and links live. While the
 * section loads or fails the card keeps only its heading and button, so a
 * failure here never blocks the way to the tab.
 */
export function CommunityGivingSidebarCard({
  slug,
  communityName,
}: {
  slug: string;
  communityName: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { giving, isLoading, isError } = useCommunityGiving(slug);
  const [searchParams, setSearchParams] = useSearchParams();
  const { reducedMotion } = useMotionPrefs();

  const loadedGiving = isLoading || isError ? null : giving;
  const intro = loadedGiving?.intro?.trim() ?? "";
  const methods = loadedGiving?.methods ?? [];
  const visibleMethods = methods.slice(0, VISIBLE_METHOD_LIMIT);
  const hiddenMethodCount = methods.length - visibleMethods.length;

  // A pushed entry (no `replace`), so Back returns to the tab the viewer
  // came from. On phones the sidebar sits below the tab content, so the
  // navigation state asks the tab to scroll its panel into view once it has
  // rendered (`setSearchParams` runs in a transition, so a scroll from here
  // could fire before the panel exists). When the tab is already open there
  // is nothing to navigate to, so the button brings the panel into view and
  // moves focus to its heading.
  const openGivingTab = () => {
    if (searchParams.get("tab") === GIVING_TAB_ID) {
      const panel = document.getElementById(GIVING_PANEL_ID);
      if (panel) {
        revealGivingPanel(panel, reducedMotion);
        return;
      }
    }
    const navigationState: GivingNavigationState = {
      shouldScrollToGiving: true,
    };
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        params.set("tab", GIVING_TAB_ID);
        params.delete("mod");
        return params;
      },
      { state: navigationState },
    );
  };

  return (
    <section className={sidebarStyles.sbC} aria-labelledby={headingId}>
      <h2 id={headingId} className={sidebarStyles.sbLbl}>
        {t("communities:detail.giving.heading", { name: communityName })}
      </h2>
      {intro && <p className={styles.intro}>{intro}</p>}
      {visibleMethods.length > 0 && (
        <ul className={styles.methods}>
          {visibleMethods.map((method) => {
            const MethodIcon = givingMethodIcon(method);
            return (
              <li key={method.id} className={styles.method}>
                <MethodIcon aria-hidden className={styles.methodIcon} />
                <span className={styles.methodName}>
                  {givingMethodTitle(method)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {hiddenMethodCount > 0 && (
        <p className={styles.more}>
          {t("communities:detail.giving.sidebar.more", {
            count: hiddenMethodCount,
          })}
        </p>
      )}
      <Button
        variant="ghost"
        className={[sidebarStyles.sbFull, styles.cta].join(" ")}
        onClick={openGivingTab}
      >
        {t("communities:detail.giving.sidebar.cta")}{" "}
        <FiArrowRight aria-hidden />
      </Button>
    </section>
  );
}
