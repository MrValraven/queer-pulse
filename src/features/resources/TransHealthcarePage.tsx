import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { PATHS } from "./transHealthcare.data";
import {
  TransHealthcareHero,
  TransHealthcareJourney,
  TransHealthcareSidebar,
  TransHealthcareOutro,
} from "./TransHealthcareSections";
import { CrisisStrip } from "./CrisisStrip";
import { SuggestEditTrigger } from "./SuggestEditTrigger";
import styles from "./TransHealthcarePage.module.css";

export function TransHealthcarePage() {
  const { t } = useTranslation();
  const [active, setActive] = useState("hrt-sns");
  const path = PATHS.find((p) => p.id === active) ?? PATHS[0]!;
  const pageTitle = t("resources:transHealthcare.meta.title");
  const pageDescription = t("resources:transHealthcare.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/trans-healthcare",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/trans-healthcare" },
        ])}
      />
      <TransHealthcareHero />

      <CrisisStrip />

      <div className={styles.pathBar}>
        <div className={styles.pbInner}>
          {PATHS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={[
                styles.pathBtn,
                active === p.id && styles.pathBtnActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActive(p.id)}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className={styles.body}>
          <TransHealthcareJourney path={path} />
          <TransHealthcareSidebar />
        </div>
      </div>

      <SuggestEditTrigger subject={pageTitle} context="trans_healthcare" />

      <TransHealthcareOutro />
    </PageShell>
  );
}
