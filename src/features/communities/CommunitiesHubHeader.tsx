import { Button, FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useHowCommunitiesWorkModal } from "../marketing/useHowCommunitiesWorkModal";
import { CommunitiesTopTabs } from "./CommunitiesTopTabs";
import type { TopTab } from "./useCommunitiesTopTab";
import styles from "./CommunitiesHubHeader.module.css";

/**
 * Compact, utility-first header for the merged `/communities` page. Carries the
 * page's single <h1>, the My communities | Discover switch, and the persistent
 * "Start a community" action. Reserves the top nav band (the job the old
 * directory hero did — see `src/styles/nav-mode.css`) so the switch clears the
 * floating nav instead of hiding behind it. Not sticky.
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
            <h1 className={styles.title}>
              {t("communities:hubShell.title")}{" "}
              <FeatureHelp id="communities.hub" />
            </h1>
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
