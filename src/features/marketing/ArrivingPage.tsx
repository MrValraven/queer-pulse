import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  NeighbourhoodsSection,
  HealthSection,
  HousingSection,
  OrgsSection,
  FirstStepSection,
  CommQuickSection,
} from "./ArrivingSections";
import styles from "./ArrivingPage.module.css";

export function ArrivingPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("marketing:arriving.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="marketing:arriving.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" delay={120}>
            {t("marketing:arriving.hero.body")}
          </Reveal>
        </div>
      </div>

      <NeighbourhoodsSection />
      <HealthSection />
      <HousingSection />
      <OrgsSection />
      <FirstStepSection />
      <CommQuickSection />

      <Outro
        title={
          <Translation
            i18nKey="marketing:arriving.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:arriving.outro.sub")}
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          {t("marketing:arriving.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
