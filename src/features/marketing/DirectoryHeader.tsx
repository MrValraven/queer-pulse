import { FiArrowRight, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DirectoryLayout.module.css";
import { useListingDraftCta } from "./useListingDraftCta";

/** The directory's page header, in the members directory's shape: eyebrow,
 *  serif title with its italic accent, one lead line and the note on who
 *  keeps the listings up, over a hairline. The page is a search and a result
 *  list, so the header stays compact and the places start high on the page.
 *  "List your business" sits at its right on desktop as a ghost button. On
 *  phones it is a compact text link under the lead and the note steps
 *  aside, so the header stays about as tall as the members one. With a saved
 *  listing draft the same slot reads "Continue <name>" and links into it. */
export function DirectoryHeader({ isMobile }: { isMobile: boolean }) {
  const { t } = useTranslation();
  const listingCta = useListingDraftCta();
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
            <Link to={listingCta.to} className={styles.headLink}>
              {!listingCta.isContinuing && <FiPlus aria-hidden />}
              <span className={styles.headCtaLabel}>{listingCta.label}</span>
              {listingCta.isContinuing && <FiArrowRight aria-hidden />}
            </Link>
          ) : (
            <Button variant="ghost" to={listingCta.to}>
              {!listingCta.isContinuing && <FiPlus aria-hidden />}
              <span className={styles.headCtaLabel}>{listingCta.label}</span>
              {listingCta.isContinuing && <FiArrowRight aria-hidden />}
            </Button>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
