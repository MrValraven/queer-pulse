import { Link } from "react-router-dom";
import { routes, linkToPath } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { issueLabelText } from "./magazineFormat";
import { useCurrentIssueLabel } from "./api/useMagazineFront";
import { MASTHEAD_META, MASTHEAD_NAV } from "./magazineMasthead.data";
import styles from "./MagazineMasthead.module.css";

export function MagazineMasthead({ active }: { active?: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const currentIssue = useCurrentIssueLabel();

  // CON-13: the issue label is real now. Demo keeps its fixed showcase issue;
  // live names the most recently PUBLISHED issue, straight off
  // `GET /magazine/current-issue`. Before any issue has shipped there is
  // nothing to name, so the label stays out and the tagline carries the block
  // on its own — the same honest-blank treatment as before, now reached only
  // when it is actually true.
  const issueNumber = demoMode
    ? String(MASTHEAD_META.issueNumber)
    : (currentIssue?.number ?? null);
  const issueDate = demoMode
    ? MASTHEAD_META.date
    : currentIssue?.publishedOn
      ? new Date(currentIssue.publishedOn)
      : null;

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
            {issueNumber && (
              <div className={styles.mmIssue}>
                {issueLabelText(issueNumber, t)}
              </div>
            )}
            {issueDate && (
              <div className={styles.mmDate}>
                {fmt.date(issueDate, { month: "long", year: "numeric" })}
              </div>
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
