import { Button, Eyebrow, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import styles from "./Hero.module.css";

export function Hero() {
  const { t } = useTranslation();

  return (
    <header className={styles.hero} id="top">
      <div className="wrap">
        <div className={styles.inner}>
          {/* Above-the-fold on mount (this is the homepage's LCP element) — rendered
              directly instead of via <Reveal> so first paint isn't gated behind an
              IntersectionObserver + up to 900ms opacity/transform transition. */}
          <Eyebrow live className={styles.eyebrow}>
            {t("homepage:hero.eyebrow")}
          </Eyebrow>

          <h1 className={styles.title}>
            <Translation
              i18nKey="homepage:hero.title"
              components={{ em: <em /> }}
            />
          </h1>

          <p className={styles.sub}>{t("homepage:hero.sub")}</p>

          <div className={styles.cta}>
            <Button size="lg" to={routes.requestInvite}>
              {t("homepage:hero.requestInviteCta")}
            </Button>
            <Button size="lg" variant="ghost" href="#discovery">
              {t("homepage:hero.exploreMembersCta")}
            </Button>
          </div>

          <Reveal as="p" className={styles.note} delay={220}>
            <span className={styles.liveDot} aria-hidden />
            {t("homepage:hero.note")}
          </Reveal>
        </div>
      </div>
    </header>
  );
}
