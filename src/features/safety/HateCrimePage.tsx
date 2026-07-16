import { PageShell } from "../../shared/components/layout";
import { Button, HubBackLink, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { HateCrimePanel } from "./HateCrimeTabs";
import styles from "./HateCrimePage.module.css";

const LEGAL = routes.legal;

export function HateCrimePage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <HubBackLink
            to={routes.safety}
            label={t("safety:nav.safetyGuideLabel")}
            tone="dark"
          />
          <div className={styles.eye}>{t("safety:hateCrime.eyebrow")}</div>
          <h1 className={styles.title}>
            {t("safety:hateCrime.title.line1")}
            <br />
            <Translation
              i18nKey="safety:hateCrime.title.line2"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("safety:hateCrime.sub")}</p>
          <div className={styles.important}>
            <p>
              <Translation
                i18nKey="safety:hateCrime.important"
                components={{ strong: <strong /> }}
              />
            </p>
          </div>
        </div>
      </header>

      <HateCrimePanel />

      <Outro
        title={
          <Translation
            i18nKey="safety:hateCrime.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("safety:hateCrime.outro.sub")}
      >
        <Button to={LEGAL} variant="primary" size="lg">
          {t("safety:hateCrime.outro.legalCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
