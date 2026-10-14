import { Link } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useShareLink } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPressKitView } from "./api/studio.adapters";
import { studioPressPrintPath } from "./studioPaths";
import styles from "./StudioPressLayout.module.css";

/** Sticky press kit bar: brand, crumb, Copy press link, Download one-sheet
 *  (it opens the A4 page, which prints once ready), and the demo's mock
 *  asset download. */
export function StudioPressBar({
  pressKit,
  isShowcase,
}: {
  pressKit: StudioPressKitView | null;
  isShowcase: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { share } = useShareLink({
    copied: t("studio:press.copiedToast"),
    failed: t("studio:press.bar.copyLinkFailToast"),
  });
  return (
    <div className={styles.bar}>
      <Link to={routes.studio} className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        <span className={styles.wordmark}>
          <Translation
            i18nKey="studio:brand.lockup"
            components={{ em: <span className={styles.wordmarkItalic} /> }}
          />
        </span>
      </Link>
      {pressKit && (
        <span className={styles.crumb}>
          <Translation
            i18nKey="studio:press.bar.crumb"
            values={{ name: pressKit.artist.name }}
            components={{ em: <em /> }}
          />
        </span>
      )}
      <div className={styles.actions}>
        <Button
          variant="ghost"
          onClick={() => void share(window.location.href)}
        >
          {t("studio:press.bar.copyLinkCta")}
        </Button>
        {pressKit && (
          <Button to={studioPressPrintPath(pressKit.artist.id, true)}>
            <FiDownload aria-hidden /> {t("studio:oneSheet.downloadCta")}
          </Button>
        )}
        {isShowcase && (
          <Button
            variant="ghost"
            onClick={() =>
              showToast(t("studio:press.bar.preparingToast"), "success")
            }
          >
            {t("studio:press.bar.downloadAssetsCta")}
          </Button>
        )}
      </div>
    </div>
  );
}
