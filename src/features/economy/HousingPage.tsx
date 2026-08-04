import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { FeatureHelp, Reveal, Tabs } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { HousingBoard } from "./HousingBoard";
import { FlatmatesBoard } from "./FlatmatesBoard";
import styles from "./HousingPage.module.css";

export function HousingPage() {
  const { t } = useTranslation();
  const pageTitle = t("economy:housing.meta.title");
  const pageDescription = t("economy:housing.meta.description");
  const [params, setParams] = useSearchParams();
  const tabs = useMemo(
    () => [
      { id: "housing", label: t("economy:housing.tabs.housing") },
      { id: "flatmates", label: t("economy:housing.tabs.flatmates") },
    ],
    [t],
  );
  // Tab lives in the URL (?tab=flatmates) so the Flatmates view is deep-linkable
  // and back-button friendly; the default (no param) is the Housing board.
  const active = params.get("tab") === "flatmates" ? "flatmates" : "housing";

  const setActive = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === "flatmates") next.set("tab", "flatmates");
    else next.delete("tab");
    setParams(next);
  };

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          {
            name: t("shared:megaNav.lisbon.title"),
            path: routes.safeSpaces,
          },
          { name: pageTitle, path: routes.housing },
        ])}
      />
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("economy:housing.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="economy:housing.hero.title"
              components={{ em: <em /> }}
            />{" "}
            <FeatureHelp id="housing.hub" />
          </Reveal>
          <Reveal as="p" delay={120}>
            {t("economy:housing.hero.lead")}
          </Reveal>
          <Reveal className={styles.note} delay={160}>
            <span className={styles.noteDot} />
            {t("economy:housing.hero.note")}
          </Reveal>
        </div>
      </div>

      <div className={styles.tabBar}>
        <div className="wrap">
          <Tabs tabs={tabs} active={active} onChange={setActive} />
        </div>
      </div>

      {active === "flatmates" ? <FlatmatesBoard /> : <HousingBoard />}
    </PageShell>
  );
}
