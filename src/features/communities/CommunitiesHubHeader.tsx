import { Button, FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useHowCommunitiesWorkModal } from "../marketing/useHowCommunitiesWorkModal";
import { CommunitiesTopTabs } from "./CommunitiesTopTabs";
import type { TopTab } from "./useCommunitiesTopTab";
import styles from "./CommunitiesHubHeader.module.css";

/**
 * Header for the merged `/communities` page. Carries the page's single <h1>
 * (with its lead line), the My communities | Discover switch, and the
 * persistent "Start a community" action. The floating nav's band is already
 * reserved once by `main[data-page-main]` (base.css); this only adds its own
 * breathing room on top of that. Not sticky.
 */
export function CommunitiesHubHeader({
  active,
  onChange,
}: {
  active: TopTab;
  onChange: (next: TopTab) => void;
}) {
  const { t } = useTranslation();
  const { openModal, modalElement } = useHowCommunitiesWorkModal();

  return (
    <header className={styles.header}>
      <div className="wrap">
        <div className={styles.row}>
          <div className={styles.identity}>
            {/* FeatureHelp sits beside the heading, not inside it, so the info
                button doesn't pollute the h1's accessible name or inherit its
                hero-scale font-size (see CommunityDetailHero for the same
                pattern). */}
            <div className={styles.titleRow}>
              <h1 className={styles.title}>
                {t("communities:hubShell.title")}{" "}
                <em>{t("communities:hubShell.titleEm")}</em>
              </h1>
              <FeatureHelp id="communities.hub" />
            </div>
            <p className={styles.lead}>{t("communities:hubShell.subtitle")}</p>
            <CommunitiesTopTabs active={active} onChange={onChange} />
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={openModal}>
              {t("communities:hub.howItWorksCta")}
            </Button>
            <Button variant="primary" to={routes.startCommunity}>
              {t("communities:hub.startCta")}
            </Button>
          </div>
        </div>
      </div>
      {modalElement}
    </header>
  );
}
