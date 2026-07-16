import { Link } from "react-router-dom";
import { routes, linkToPath } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { issueLabelText } from "./magazineFormat";
import { MASTHEAD_META, MASTHEAD_NAV } from "./magazineMasthead.data";
import styles from "./MagazineMasthead.module.css";

export function MagazineMasthead({ active }: { active?: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.masthead}>
      <div className="wrap">
        <div className={styles.mmTop}>
          <Link to={linkToPath(routes.magazine)} className={styles.mmBrand}>
            Queer<em>Pulse</em>
            <br />
            Magazine
          </Link>
          <div className={styles.mmMeta}>
            <div className={styles.mmIssue}>
              {issueLabelText(MASTHEAD_META.issueNumber, t)}
            </div>
            <div className={styles.mmDate}>
              {fmt.date(MASTHEAD_META.date, { month: "long", year: "numeric" })}
            </div>
            <div className={styles.mmTagline}>
              {t(MASTHEAD_META.taglineKey)}
            </div>
          </div>
        </div>
        <nav
          className={styles.magNav}
          aria-label={t("magazine:masthead.sectionsAriaLabel")}
        >
          {MASTHEAD_NAV.map((item) => {
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
          })}
        </nav>
      </div>
    </div>
  );
}
