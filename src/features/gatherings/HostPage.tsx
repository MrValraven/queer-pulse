import { FiArrowRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { HostSteps } from "./HostSteps";
import { HostSidebar } from "./HostSidebar";
import { HERO_TYPES } from "./hostPage.data";
import styles from "./HostPage.module.css";

export function HostPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>{t("gatherings:host.hero.eyebrow")}</div>
          <h1 className={styles.title}>
            <Translation
              i18nKey="gatherings:host.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lede}>{t("gatherings:host.hero.lead")}</p>
          <div className={styles.heroTypes}>
            {HERO_TYPES.map((typeKey) => (
              <span key={typeKey} className={styles.htype}>
                {t(typeKey)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            <HostSteps />
            <HostSidebar />
          </div>
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="gatherings:host.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("gatherings:host.outro.sub")}
      >
        <Button to={routes.createGathering} size="lg">
          {t("gatherings:host.createGatheringCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </Outro>
    </PageShell>
  );
}
