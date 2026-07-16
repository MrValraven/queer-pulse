import { Button, Eyebrow, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { neighbourhoods } from "../data/gatherings";
import styles from "./Hero.module.css";

export function Hero() {
  const { t } = useTranslation();

  return (
    <header className={styles.hero} id="top">
      <div className="wrap">
        <div className={styles.inner}>
          <Reveal>
            <Eyebrow live className={styles.eyebrow}>
              {t("homepage:hero.eyebrow")}
            </Eyebrow>
          </Reveal>

          <Reveal as="h1" className={styles.title} delay={60}>
            <Translation
              i18nKey="homepage:hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>

          <Reveal as="p" className={styles.sub} delay={120}>
            {t("homepage:hero.sub")}
          </Reveal>

          <Reveal className={styles.cta} delay={180}>
            <Button size="lg" to={routes.requestInvite}>
              {t("homepage:hero.requestInviteCta")}
            </Button>
            <Button size="lg" variant="ghost" href="#discovery">
              {t("homepage:hero.exploreMembersCta")}
            </Button>
          </Reveal>

          <Reveal as="p" className={styles.note} delay={220}>
            <span className={styles.liveDot} aria-hidden />
            {t("homepage:hero.note")}
          </Reveal>

          <Reveal className={styles.ticker} delay={260}>
            {neighbourhoods.map((hood) => (
              <span key={hood} className={styles.hood}>
                {hood}
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </header>
  );
}
