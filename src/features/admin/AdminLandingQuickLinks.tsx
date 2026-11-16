import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ADMIN_LANDING_QUICK_LINKS } from "./adminLandingQuickLinks.data";
import { AdminPanel } from "./ui";
import styles from "./AdminLandingPage.module.css";
import phone from "./adminPhoneActions.module.css";

/**
 * The "Quick links" row on `/admin/landing`: opens each public landing page
 * in a new tab so a curator can check their picks in place on the live page.
 * The homepage and Studio render the way a visitor sees them (see
 * `adminLandingQuickLinks.data.ts`).
 */
export function AdminLandingQuickLinks() {
  const { t } = useTranslation();
  return (
    <AdminPanel
      className={styles.quickLinks}
      title={t("admin:landing.quickLinks.heading")}
      description={t("admin:landing.quickLinks.helper")}
    >
      <ul className={`${styles.quickLinksList} ${phone.scrollRow}`}>
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
    </AdminPanel>
  );
}
