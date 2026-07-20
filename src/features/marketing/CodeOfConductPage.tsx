import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { downloadBlob } from "./downloadBlob";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import styles from "./CodeOfConductPage.module.css";
import { TOC } from "./codeOfConductPage.data";
import {
  CocPactSection,
  CocHarmSection,
  CocEnforceSection,
  CocReportCta,
  CocChangesSection,
} from "./CodeOfConductSections";

const REPORT = routes.report;
const EMERGENCY = routes.emergency;
const CHANGELOG = routes.changelog;

const COC_VERSION_DATE = new Date(2026, 0, 14);

function buildCocText(t: TFunction, date: string): string {
  return `${t("marketing:coc.download.headerTitle")} (v2.1)
====================================
${t("marketing:coc.download.headerMeta", { date })}

${t("marketing:coc.download.intro")}

§01 ${t("marketing:coc.download.section01")}
§02 ${t("marketing:coc.download.section02")}
§03 ${t("marketing:coc.download.section03")}
§04 ${t("marketing:coc.download.section04")}
§05 ${t("marketing:coc.download.section05")}
§06 ${t("marketing:coc.download.section06")}
§07 ${t("marketing:coc.download.section07")}

${t("marketing:coc.download.mockNote")}
`;
}

export function CodeOfConductPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const versionDate = fmt.date(COC_VERSION_DATE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const pageTitle = t("marketing:coc.meta.title");
  const pageDescription = t("marketing:coc.meta.description");
  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: t("marketing:hub.governanceLabel"), path: routes.governance },
          { name: pageTitle, path: routes.codeOfConduct },
        ])}
      />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <HubBackLink
            to={routes.governance}
            label={t("marketing:coc.hero.backLabel")}
          />
          <div className={styles.eyebrow}>
            {t("marketing:coc.hero.eyebrow", { date: versionDate })}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:coc.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="marketing:coc.hero.dek"
              components={{ b: <b />, em: <em /> }}
            />
          </p>
        </div>
      </section>

      <div className={styles.distinction}>
        <div className={styles.distCol}>
          <h4>{t("marketing:coc.distinction.thisPage.title")}</h4>
          <p>
            <Translation
              i18nKey="marketing:coc.distinction.thisPage.body"
              components={{ b: <b /> }}
            />
          </p>
        </div>
        <div className={styles.distCol}>
          <h4>{t("marketing:coc.distinction.sister.title")}</h4>
          <p>
            <Translation
              i18nKey="marketing:coc.distinction.sister.body"
              components={{ b: <b /> }}
            />
          </p>
        </div>
      </div>

      <nav className={styles.toc}>
        <div className={styles.tocInner}>
          {TOC.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {t(`marketing:${section.labelKey}`)}
            </a>
          ))}
        </div>
      </nav>

      <article className={styles.body}>
        <CocPactSection />
        <CocHarmSection />
        <CocEnforceSection />
        <CocReportCta
          reportPath={REPORT}
          emergencyPath={EMERGENCY}
          onCrisisChat={() =>
            showToast(t("marketing:coc.crisisChatToast"), "info")
          }
        />
        <CocChangesSection
          changelogPath={CHANGELOG}
          onDownload={() =>
            downloadBlob(
              "code-of-conduct-v2.1.txt",
              buildCocText(t, versionDate),
              "text/plain",
            )
          }
        />
      </article>
    </PageShell>
  );
}
