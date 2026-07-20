import { PageShell } from "../../shared/components/layout";
import { HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ModerationLogSection, ReportFormSection } from "./ReportSections";
import s from "./ReportPage.module.css";

export function ReportPage() {
  const { t } = useTranslation();
  const pageTitle = t("safety:report.meta.title");
  const pageDescription = t("safety:report.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.report },
        ])}
      />
      <header className={s.hero}>
        <div className="wrap">
          <HubBackLink
            to={routes.safety}
            label={t("safety:nav.safetyGuideLabel")}
            tone="light"
          />
          <div className={s.eyebrow}>
            <span className={s.live} /> {t("safety:report.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="safety:report.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p>{t("safety:report.hero.lead")}</p>
        </div>
      </header>

      <ReportFormSection />
      <ModerationLogSection />
    </PageShell>
  );
}
