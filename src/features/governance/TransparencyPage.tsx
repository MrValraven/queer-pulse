import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, PageHero } from "../../shared/components/layout";
import {
  Button,
  HubBackLink,
  SegmentedControl,
  SkeletonCard,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import type { TransparencyPeriodSelector } from "./api/transparency.api";
import { useTransparencyReport } from "./api/useTransparencyReport";
import {
  ActionsSection,
  AppealsSection,
  MethodSection,
  ReportsSection,
  TimingSection,
} from "./TransparencySections";
import styles from "./TransparencyPage.module.css";

const PERIOD_SELECTORS: readonly TransparencyPeriodSelector[] = [
  "current",
  "previous",
];

/**
 * The public Transparency Report (`/about/governance/transparency`).
 *
 * Article VI clause 3 of the Constitution promises annual accounts "as part of
 * the Transparency Report", and until this page existed the report it names did
 * not. Everything here is counted at request time from the same moderation
 * tables the internal queue reads, through a public aggregate endpoint that
 * serves counts and durations and nothing else.
 *
 * Public and ungated on purpose: a report the collective shows only its own
 * members is not a transparency report.
 */
export function TransparencyPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TransparencyPeriodSelector>("current");
  const { report, isLoading, hasError, retry } = useTransparencyReport(period);
  const pageTitle = t("governance:transparency.meta.title");
  const pageDescription = t("governance:transparency.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: t("marketing:hub.governanceLabel"), path: routes.governance },
          { name: pageTitle, path: routes.transparencyReport },
        ])}
      />
      <PageHero
        plum={false}
        backLink={
          <HubBackLink
            to={routes.governance}
            label={t("marketing:hub.governanceLabel")}
          />
        }
        eyebrow={t("governance:transparency.hero.eyebrow")}
        title={
          <Translation
            i18nKey="governance:transparency.hero.title"
            components={{ em: <em /> }}
          />
        }
      >
        <div className={styles.heroExtra}>
          <p className={styles.dek}>{t("governance:transparency.hero.dek1")}</p>
          <p className={styles.dek}>
            <Translation
              i18nKey="governance:transparency.hero.dek2"
              components={{
                a: <Link to={routes.constitution} />,
                em: <em />,
              }}
            />
          </p>
          <div className={styles.periodBar}>
            <span className={styles.periodLabel}>
              {t("governance:transparency.period.label")}
            </span>
            <SegmentedControl
              label={t("governance:transparency.period.label")}
              options={PERIOD_SELECTORS.map((selector) => ({
                value: selector,
                label: t(`governance:transparency.period.option.${selector}`),
              }))}
              value={period}
              onChange={(value) =>
                setPeriod(value as TransparencyPeriodSelector)
              }
            />
            {report && <PeriodNote report={report} />}
          </div>
        </div>
      </PageHero>

      {isLoading && (
        <div className={styles.state}>
          <div className={styles.skeletonRows}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}

      {hasError && !isLoading && (
        <div className={styles.state}>
          <p className={styles.stateBody}>{t("governance:error.body")}</p>
          <Button variant="ghost" onClick={retry}>
            {t("governance:error.retry")}
          </Button>
        </div>
      )}

      {report && !hasError && (
        <>
          <div className={styles.body}>
            <ReportsSection report={report} />
            <TimingSection report={report} />
            <ActionsSection report={report} />
            <AppealsSection report={report} />
            <MethodSection report={report} />
          </div>
          <div className={styles.footerLinks}>
            <Button variant="ghost" to={routes.constitution}>
              {t("governance:transparency.links.constitution")}
            </Button>
            <Button variant="ghost" to={routes.codeOfConduct}>
              {t("governance:transparency.links.codeOfConduct")}
            </Button>
            <Button variant="ghost" to={routes.governance}>
              {t("governance:transparency.links.governance")}
            </Button>
          </div>
        </>
      )}
    </PageShell>
  );
}

/** The period's own boundaries, in words. A quarter still running says so:
 *  a partial count read as a final one is a misreading the page can prevent. */
function PeriodNote({
  report,
}: {
  report: NonNullable<ReturnType<typeof useTransparencyReport>["report"]>;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { period, generatedAt } = report;
  // `endsAt` is exclusive (Q3 ends at 1 October), so the date a reader is shown
  // steps back one millisecond into the last day the period actually covers.
  // Printing the exclusive bound would claim a day the figures do not include.
  const lastCoveredDay = new Date(new Date(period.endsAt).getTime() - 1);
  const values = {
    id: period.id,
    start: format.date(new Date(period.startsAt)),
    end: format.date(lastCoveredDay),
    until: format.date(new Date(period.coversUntil)),
  };
  return (
    <>
      <p className={styles.periodNote}>
        <Translation
          i18nKey={
            period.isComplete
              ? "governance:transparency.period.rangeComplete"
              : "governance:transparency.period.rangePartial"
          }
          components={{ b: <b /> }}
          values={values}
        />
      </p>
      <p className={styles.generated}>
        {t("governance:transparency.period.generated", {
          generated: format.date(new Date(generatedAt)),
        })}
      </p>
    </>
  );
}
