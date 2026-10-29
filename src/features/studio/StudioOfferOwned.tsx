import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioBuyerPurchaseView } from "./api/studioPurchases.adapters";
import { studioLibraryPath } from "./studioPaths";
import { StudioPurchaseDownloads } from "./StudioPurchaseDownloads";
import { StudioPurchaseWallControl } from "./StudioPurchaseWallControl";
import styles from "./StudioBuyPanel.module.css";

/** An item in the buyer's collection: the downloads behind a disclosure,
 *  the wall choice (release panel) and the way to every purchase. */
export function StudioOfferOwned({
  purchase,
  variant,
}: {
  purchase: StudioBuyerPurchaseView;
  variant: "release" | "track";
}) {
  const { t } = useTranslation();
  const downloadsId = useId();
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  return (
    <div className={styles.block}>
      <p className={styles.stateLine}>{t("studio:purchase.panel.owned")}</p>
      <div className={styles.actions}>
        <Button
          variant="quiet"
          size="sm"
          className={styles.toggleButton}
          aria-expanded={isDownloadsOpen}
          aria-controls={downloadsId}
          onClick={() => setIsDownloadsOpen((isOpen) => !isOpen)}
        >
          {isDownloadsOpen
            ? t("studio:purchase.panel.hideDownloadsCta")
            : t("studio:purchase.panel.downloadCta")}
        </Button>
      </div>
      <div id={downloadsId}>
        <Collapse isOpen={isDownloadsOpen}>
          <div className={styles.disclosed}>
            <StudioPurchaseDownloads purchase={purchase} headingLevel={3} />
          </div>
        </Collapse>
      </div>
      {variant === "release" && (
        <div className={styles.wall}>
          <StudioPurchaseWallControl purchase={purchase} />
        </div>
      )}
      <Link to={studioLibraryPath("purchases")} className={styles.quietLink}>
        {t("studio:purchase.panel.openPurchases")}
        <FiArrowRight aria-hidden />
      </Link>
    </div>
  );
}
