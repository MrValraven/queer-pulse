import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./DirectoryLayout.module.css";

/** The directory's page header, in the members directory's shape: eyebrow,
 *  serif title with its italic accent, one lead line and the note on who
 *  keeps the listings up, over a hairline. The page is a search and a result
 *  list, so the header stays compact and the places start high on the page.
 *  "List your business" sits at its right on desktop as a ghost button. On
 *  phones it is a compact text link under the lead and the note steps
 *  aside, so the header stays about as tall as the members one. */
export function DirectoryHeader({ isMobile }: { isMobile: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="wrap">
      <FadeIn as="header" className={styles.head}>
        <div className={styles.headCopy}>
          <div className={styles.eyebrow}>
            {t("marketing:directory.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:directory.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lead}>{t("marketing:directory.hero.sub")}</p>
          <p className={styles.note}>
            <span className={styles.live} aria-hidden />
            {t("marketing:directory.hero.note")}
          </p>
        </div>
        {/* Ghost keeps the listing wizard quieter than the search below it,
            since most visitors come here to find a place. */}
        <div className={styles.headAction}>
          {isMobile ? (
            <Link to={routes.listBusiness} className={styles.headLink}>
              <FiPlus aria-hidden /> {t("marketing:directory.hero.cta")}
            </Link>
          ) : (
            <Button variant="ghost" to={routes.listBusiness}>
              <FiPlus aria-hidden /> {t("marketing:directory.hero.cta")}
            </Button>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
