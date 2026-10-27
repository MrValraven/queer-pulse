import { useId } from "react";
import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ADMIN_LANDING_QUICK_LINKS } from "./adminLandingQuickLinks.data";
import styles from "./AdminLandingPage.module.css";

/**
 * The "Quick links" row on `/admin/landing`: opens each signed-out landing
 * page in a new tab, rendered the way a visitor sees it, so a curator can
 * check their picks in place on the live page.
 */
export function AdminLandingQuickLinks() {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={styles.quickLinks} aria-labelledby={headingId}>
      <div className={styles.quickLinksText}>
        <h2 id={headingId} className={styles.quickLinksHeading}>
          {t("admin:landing.quickLinks.heading")}
        </h2>
        <p className={styles.quickLinksHelper}>
          {t("admin:landing.quickLinks.helper")}
        </p>
      </div>
      <ul className={styles.quickLinksList}>
        {ADMIN_LANDING_QUICK_LINKS.map((link) => (
          <li key={link.id}>
            <Button
              variant="ghost"
              size="sm"
              className={styles.quickLinkButton}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiExternalLink aria-hidden />
              {t(link.labelKey)}
              <span className="visuallyHidden">
                {t("admin:landing.quickLinks.opensInNewTab")}
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
