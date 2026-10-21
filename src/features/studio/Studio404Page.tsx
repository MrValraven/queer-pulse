import { AnimatePresence, m } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_404_LINKS, studioMissingKindOf } from "./Studio404Page.data";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import { StudioShell } from "./StudioShell";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioHistoryNav } from "./useStudioHistoryNav";
import styles from "./studioError.module.css";

const INSTANT = { duration: 0 };
const FLAT_DOT_COUNT = 18;
const FLAT_DOT_KEYS = Array.from(
  { length: FLAT_DOT_COUNT },
  (_, dotIndex) => `dot-${dotIndex}`,
);

/**
 * The Studio 404, inside the Studio frame and following the app theme. It
 * names what the address pointed at ("This release isn't here" on a broken
 * album link) and offers only places that exist in live: Search, the
 * library and Studio home. "Go back" shows only when an earlier entry of
 * this tab exists, so it never leaves QueerPulse.
 */
export function Studio404Page() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { canGoBack, goBack } = useStudioHistoryNav();
  const { reducedMotion } = useMotionPrefs();
  const kind = studioMissingKindOf(pathname);
  useStudioDocumentTitle(t(`studio:error404.kind.${kind}.eyebrow`));

  return (
    <StudioShell>
      <section
        className={`${styles.err} ${styles.errOrbRight}`}
        aria-labelledby="studio-404-title"
      >
        <div className={styles.errNum} aria-hidden>
          404
        </div>
        <div className={styles.errContent}>
          <p className={styles.errEyebrow}>
            {t(`studio:error404.kind.${kind}.eyebrow`)}
          </p>
          <h1 id="studio-404-title" className={styles.errTitle}>
            <Translation
              i18nKey={`studio:error404.kind.${kind}.title`}
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("studio:error404.body")}</p>

          <div className={styles.deadairFlat} aria-hidden>
            {FLAT_DOT_KEYS.map((dotKey) => (
              <span key={dotKey} />
            ))}
          </div>

          <div className={styles.errActions}>
            <Button to={routes.studio}>{t("studio:error404.backCta")}</Button>
            <AnimatePresence initial={false}>
              {canGoBack && (
                <m.span
                  key="go-back"
                  className={styles.errActionSlot}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: reducedMotion ? INSTANT : STUDIO_FADE,
                  }}
                  exit={{
                    opacity: 0,
                    transition: reducedMotion ? INSTANT : STUDIO_EXIT,
                  }}
                >
                  <Button variant="quiet" onClick={goBack}>
                    <FiArrowLeft aria-hidden /> {t("studio:error404.goBackCta")}
                  </Button>
                </m.span>
              )}
            </AnimatePresence>
          </div>

          <h2 className={styles.errLinksTitle}>
            {t("studio:error404.tryInsteadTitle")}
          </h2>
          <ul className={styles.errGrid}>
            {STUDIO_404_LINKS.map((link) => {
              const LinkIcon = link.icon;
              return (
                <li key={link.key}>
                  <Link to={link.to} className={styles.errLink}>
                    <LinkIcon aria-hidden className={styles.errLinkIcon} />
                    <span className={styles.errLinkLabel}>
                      <Translation
                        i18nKey={link.labelKey}
                        components={{ em: <em /> }}
                      />
                    </span>
                    <span className={styles.errLinkSub}>{t(link.subKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </StudioShell>
  );
}
