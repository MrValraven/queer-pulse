import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import styles from "./Outro.module.css";

export function Outro() {
  const { t } = useTranslation();

  return (
    <section className={styles.outro}>
      <div className="wrap">
        <div className={styles.inner}>
          <Reveal as="h2" className={styles.title}>
            <Translation
              i18nKey="homepage:outro.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.sub} delay={80}>
            {t("homepage:outro.sub")}
          </Reveal>
          <Reveal delay={140}>
            <Button size="lg" to={routes.requestInvite}>
              {t("homepage:outro.cta")}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
