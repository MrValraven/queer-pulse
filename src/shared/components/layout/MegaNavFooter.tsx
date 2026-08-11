import { Link } from "react-router-dom";
import { linkToPath, routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./MegaNav.module.css";

/**
 * Footer strip spanning the mega panel: Help & FAQ, Accessibility, and a
 * language toggle on the left (dot-separated); Emergency resources, in coral, on
 * the right. The language button flips the app language and stays in the panel.
 */
export function MegaNavFooter({ onClose }: { onClose: () => void }) {
  const { t, language, setLanguage } = useTranslation();
  const other = language === "pt" ? "en" : "pt";

  return (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        <Link
          to={linkToPath(routes.help)}
          className={styles.footerLink}
          onClick={onClose}
        >
          {t("shared:megaNav.about.col.using.helpFaq")}
        </Link>
        <span className={styles.footerSep} aria-hidden />
        <Link
          to={linkToPath(routes.help) + "#accessibility"}
          className={styles.footerLink}
          onClick={onClose}
        >
          {t("shared:megaNav.footer.accessibility")}
        </Link>
        <span className={styles.footerSep} aria-hidden />
        <button
          type="button"
          className={styles.footerLink}
          onClick={() => setLanguage(other)}
        >
          {t(`common:language.${other}`)}
        </button>
      </div>
      <div className={styles.footerRight}>
        <Link
          to={linkToPath(routes.safety)}
          className={[styles.footerLink, styles.emergency].join(" ")}
          onClick={onClose}
        >
          {t("shared:megaNav.footer.emergency")}
        </Link>
      </div>
    </div>
  );
}
