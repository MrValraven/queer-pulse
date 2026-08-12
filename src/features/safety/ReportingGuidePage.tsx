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
import { ReportFlowSection, ModerationLogSection } from "./ReportSections";
import { QuickExit } from "./QuickExit";
import s from "./ReportPage.module.css";

/** The reporting-policy explainer: how a report is handled and the public
 *  moderation record. The report *form* lives on its own page (ReportPage). */
export function ReportingGuidePage() {
  const { t } = useTranslation();
  const pageTitle = t("safety:report.guide.meta.title");
  const pageDescription = t("safety:report.guide.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.reporting },
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
          <div className={s.heroLink}>
            <Button to={routes.report}>
              {t("safety:report.guide.makeReportCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </header>

      <ReportFlowSection />
      <ModerationLogSection />

      <QuickExit />
    </PageShell>
  );
}
