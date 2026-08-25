import { Link } from "react-router-dom";
import { routes, linkToPath } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { issueLabelText } from "./magazineFormat";
import { MASTHEAD_META, MASTHEAD_NAV } from "./magazineMasthead.data";
import styles from "./MagazineMasthead.module.css";

export function MagazineMasthead({ active }: { active?: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();

  return (
    <div className={styles.masthead}>
      <div className="wrap">
        <div className={styles.mmTop}>
          <Link to={linkToPath(routes.magazine)} className={styles.mmBrand}>
            {/* eslint-disable local/no-literal-string -- brand wordmark: "QueerPulse" is a proper noun, never translated or inflected (see glossary-pt.md) */}
            Queer<em>Pulse</em>
            {/* eslint-enable local/no-literal-string */}
            <br />
            {t("magazine:masthead.brandMagazine")}
          </Link>
          <div className={styles.mmMeta}>
            {/* The current issue number/date is fabricated demo chrome — there
                is no cheap "current issue" endpoint to feed the masthead, so
                live mode shows only the (translated) publishing cadence. */}
            {demoMode && (
              <>
                <div className={styles.mmIssue}>
                  {issueLabelText(MASTHEAD_META.issueNumber, t)}
                </div>
                <div className={styles.mmDate}>
                  {fmt.date(MASTHEAD_META.date, {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </>
            )}
            <div className={styles.mmTagline}>
              {t(MASTHEAD_META.taglineKey)}
            </div>
          </div>
        </div>
        <nav
          className={styles.magNav}
          aria-label={t("magazine:masthead.sectionsAriaLabel")}
        >
          {MASTHEAD_NAV.filter((item) => demoMode || !item.demoOnly).map(
            (item) => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  to={linkToPath(item.href)}
                  className={`${styles.mnLink} ${isActive ? styles.mnLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {t(item.labelKey)}
                </Link>
              );
            },
          )}
        </nav>
      </div>
    </div>
  );
}
