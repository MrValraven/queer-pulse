import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import styles from "./StudioPressPage.module.css";

/** Sticky press-kit topbar: brand + crumb + copy-link / download-assets actions. */
export function StudioPressBar() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { share } = useShareLink({
    copied: t("studio:press.copiedToast"),
    failed: t("studio:press.bar.copyLinkFailToast"),
  });

  function copyLink() {
    const url =
      typeof window !== "undefined" ? window.location.href : routes.studioPress;
    void share(url);
  }

  return (
    <div className={styles.bar}>
      <Link to={routes.studio} className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        <span className={styles.wm}>
          Queer<span className={styles.q}>Pulse</span>
        </span>
      </Link>
      <span className={styles.crumb}>
        <Translation
          i18nKey="studio:press.bar.crumb"
          values={{ name: "Mariana Sol" }}
          components={{ em: <em /> }}
        />
      </span>
      <div className={styles.acts}>
        <Button variant="ghost-dark" onClick={copyLink}>
          {t("studio:press.bar.copyLinkCta")}
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            showToast(t("studio:press.bar.preparingToast"), "success")
          }
        >
          {t("studio:press.bar.downloadAssetsCta")}
        </Button>
      </div>
    </div>
  );
}
