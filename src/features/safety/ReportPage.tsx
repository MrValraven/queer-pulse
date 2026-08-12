import { FiArrowRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ReportFormSection } from "./ReportSections";
import { QuickExit } from "./QuickExit";
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
              i18nKey="safety:report.form.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p>{t("safety:report.form.lead")}</p>
          <div className={s.heroLink}>
            <Button variant="ghost" to={routes.reporting}>
              {t("safety:report.howReportingWorksLink")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </header>

      <ReportFormSection />

      <QuickExit />
    </PageShell>
  );
}
