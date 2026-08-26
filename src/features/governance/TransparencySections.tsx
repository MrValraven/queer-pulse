import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import type { TransparencyReportDTO } from "./api/transparency.api";
import {
  CountTable,
  HeadlineFigure,
  HeadlineRow,
  HeadlineText,
} from "./TransparencyFigures";
import {
  ACTION_KEYS,
  APPEAL_OUTCOME_KEYS,
  NOT_COUNTED_KEYS,
  REASON_CATEGORY_KEYS,
} from "./transparencyLabels";
import styles from "./TransparencyPage.module.css";

/** Only keys this page has a label for are rendered, so a vocabulary the
 *  backend grows before the catalogue does degrades to a shorter table rather
 *  than to a raw identifier on a published document. */
function labelLookup(
  allowedKeys: readonly string[],
  translate: (key: string) => string,
  prefix: string,
) {
  return (key: string): string | undefined =>
    allowedKeys.includes(key) ? translate(`${prefix}${key}`) : undefined;
}

export function ReportsSection({ report }: { report: TransparencyReportDTO }) {
  const { t } = useTranslation();
  const floor = report.smallCountFloor;
  return (
    <section className={styles.section} id="reports">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="governance:transparency.reports.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.lead}>{t("governance:transparency.reports.lead")}</p>
      <HeadlineRow>
        <HeadlineFigure
          count={report.reports.received}
          smallCountFloor={floor}
          label={t("governance:transparency.reports.received")}
        />
        <HeadlineFigure
          count={report.reports.resolved}
          smallCountFloor={floor}
          label={t("governance:transparency.reports.resolved")}
        />
      </HeadlineRow>
      <CountTable
        caption={t("governance:transparency.reports.tableCaption")}
        rowHeader={t("governance:transparency.reports.categoryColumn")}
        countHeader={t("governance:transparency.reports.countColumn")}
        rows={report.reports.byCategory}
        smallCountFloor={floor}
        labelFor={labelLookup(
          REASON_CATEGORY_KEYS,
          t,
          "governance:transparency.category.",
        )}
      />
    </section>
  );
}

export function TimingSection({ report }: { report: TransparencyReportDTO }) {
  const { t } = useTranslation();
  const format = useFormat();
  const withheld = t("governance:transparency.timing.withheld");
  const asHours = (hours: number | null) =>
    hours === null
      ? withheld
      : t("governance:transparency.timing.hours", {
          value: format.number(hours),
        });
  return (
    <section className={styles.section} id="timing">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="governance:transparency.timing.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.lead}>{t("governance:transparency.timing.lead")}</p>
      <HeadlineRow>
        <HeadlineText
          value={asHours(report.reports.medianHoursToResolution)}
          isPublished={report.reports.medianHoursToResolution !== null}
          label={t("governance:transparency.timing.median")}
        />
        <HeadlineText
          value={asHours(report.reports.p90HoursToResolution)}
          isPublished={report.reports.p90HoursToResolution !== null}
          label={t("governance:transparency.timing.p90")}
        />
      </HeadlineRow>
    </section>
  );
}

export function ActionsSection({ report }: { report: TransparencyReportDTO }) {
  const { t } = useTranslation();
  const floor = report.smallCountFloor;
  return (
    <section className={styles.section} id="actions">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="governance:transparency.actions.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.lead}>{t("governance:transparency.actions.lead")}</p>
      <HeadlineRow>
        <HeadlineFigure
          count={report.actions.accountsRemoved}
          smallCountFloor={floor}
          label={t("governance:transparency.actions.accountsRemoved")}
        />
        <HeadlineFigure
          count={report.communities.frozen}
          smallCountFloor={floor}
          label={t("governance:transparency.communities.frozen")}
        />
      </HeadlineRow>
      <CountTable
        caption={t("governance:transparency.actions.tableCaption")}
        rowHeader={t("governance:transparency.actions.actionColumn")}
        countHeader={t("governance:transparency.actions.countColumn")}
        rows={report.actions.byType}
        smallCountFloor={floor}
        labelFor={labelLookup(
          ACTION_KEYS,
          t,
          "governance:transparency.action.",
        )}
      />
    </section>
  );
}

export function AppealsSection({ report }: { report: TransparencyReportDTO }) {
  const { t } = useTranslation();
  const format = useFormat();
  const floor = report.smallCountFloor;
  const rate = report.appeals.overturnRatePercent;
  return (
    <section className={styles.section} id="appeals">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="governance:transparency.appeals.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.lead}>{t("governance:transparency.appeals.lead")}</p>
      <HeadlineRow>
        <HeadlineFigure
          count={report.appeals.filed}
          smallCountFloor={floor}
          label={t("governance:transparency.appeals.filed")}
        />
        <HeadlineText
          value={
            rate === null
              ? t("governance:transparency.appeals.rateWithheld")
              : t("governance:transparency.appeals.ratePercent", {
                  value: format.number(rate),
                })
          }
          isPublished={rate !== null}
          label={t("governance:transparency.appeals.overturnRate")}
        />
      </HeadlineRow>
      <CountTable
        caption={t("governance:transparency.appeals.tableCaption")}
        rowHeader={t("governance:transparency.appeals.outcomeColumn")}
        countHeader={t("governance:transparency.appeals.countColumn")}
        rows={report.appeals.byOutcome}
        smallCountFloor={floor}
        labelFor={labelLookup(
          APPEAL_OUTCOME_KEYS,
          t,
          "governance:transparency.outcome.",
        )}
      />
    </section>
  );
}

/** How the figures are made, and what they leave out. Both belong on the page
 *  itself: a report a reader cannot audit is a press release. */
export function MethodSection({ report }: { report: TransparencyReportDTO }) {
  const { t } = useTranslation();
  return (
    <section className={styles.section} id="method">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="governance:transparency.method.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.notes}>
        <p>{t("governance:transparency.method.counted")}</p>
        <p>
          <Translation
            i18nKey="governance:transparency.method.suppression"
            components={{ b: <b /> }}
            values={{ floor: report.smallCountFloor }}
          />
        </p>
        <p>{t("governance:transparency.method.pairs")}</p>
      </div>
      <h3 className={styles.subTitle}>
        {t("governance:transparency.notCounted.title")}
      </h3>
      <div className={styles.notes}>
        <ul className={styles.notesList}>
          {NOT_COUNTED_KEYS.map((key) => (
            <li key={key}>{t(`governance:transparency.notCounted.${key}`)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
