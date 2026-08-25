import { FiCheck, FiChevronDown, FiDownload, FiLoader } from "react-icons/fi";
import { Button, Stepper } from "../../shared/components/ui";
import type { StepperStep } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ACCORDION_ITEMS, DATA_TYPES } from "./dataExport.data";
import type { ExportJob } from "./api/account.api";
import styles from "./DataExportPage.module.css";

type Format = "JSON" | "CSV" | "Both";

/** form → identity (job building) → download-ready. */
export type ExportPhase = "form" | "building" | "ready";

export function DataExportSteps({ phase }: { phase: ExportPhase }) {
  const { t } = useTranslation();
  // form → identity → download-ready maps to the active step index; the shared
  // Stepper marks every earlier index as done and later ones as pending.
  const current = phase === "form" ? 0 : phase === "building" ? 1 : 2;
  const steps: StepperStep[] = [
    {
      key: "choose",
      label: t("settings:dataExport.steps.step1.label"),
      description: t("settings:dataExport.steps.step1.desc"),
    },
    {
      key: "confirm",
      label: t("settings:dataExport.steps.step2.label"),
      description: t("settings:dataExport.steps.step2.desc"),
    },
    {
      key: "download",
      label: t("settings:dataExport.steps.step3.label"),
      description: t("settings:dataExport.steps.step3.desc"),
    },
  ];

  return (
    <Stepper
      steps={steps}
      current={current}
      marker="number"
      orientation="vertical"
      ariaLabel={t("settings:dataExport.steps.aria")}
      className={styles.stepsBlock}
    />
  );
}

export function DataExportForm({
  checked,
  toggleType,
  format,
  setFormat,
  onSubmit,
  submitting,
}: {
  checked: boolean[];
  toggleType: (i: number) => void;
  format: Format;
  setFormat: (f: Format) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Translation
          i18nKey="settings:dataExport.form.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.cardSub}>{t("settings:dataExport.form.sub")}</p>

      <div className={styles.fieldLabel}>
        {t("settings:dataExport.form.includeLabel")}
      </div>
      <div className={styles.dataTypes}>
        {DATA_TYPES.map((dt, i) => (
          <div
            key={dt.id}
            className={[styles.dtItem, checked[i] && styles.dtItemChecked]
              .filter(Boolean)
              .join(" ")}
            // A multi-select list of categories: each row is a checkbox, so
            // screen readers announce "checked/not checked" rather than the
            // toggle-button semantics `aria-pressed` implies.
            role="checkbox"
            tabIndex={0}
            aria-label={t(dt.labelKey)}
            aria-checked={checked[i]}
            onClick={() => toggleType(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleType(i);
              }
            }}
          >
            <div className={styles.dtCheck}>
              <svg
                className={styles.dtCheckIcon}
                viewBox="0 0 10 8"
                aria-hidden
              >
                <polyline points="1,4 3.5,7 9,1" />
              </svg>
            </div>
            <div>
              <div className={styles.dtLabel}>{t(dt.labelKey)}</div>
              <div className={styles.dtSub}>{t(dt.subKey)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.fieldLabel}>
        {t("settings:dataExport.form.formatLabel")}
      </div>
      <div className={styles.fmtRow}>
        {(["JSON", "CSV", "Both"] as Format[]).map((f) => (
          <button
            type="button"
            key={f}
            className={[styles.fmtBtn, format === f && styles.fmtBtnSelected]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setFormat(f)}
          >
            {f === "Both" ? t("settings:dataExport.format.both") : f}
          </button>
        ))}
      </div>

      <div className={styles.legalNote}>
        <svg
          className={styles.legalNoteIcon}
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="9" cy="9" r="7.5" />
          <line x1="9" y1="7" x2="9" y2="9.5" />
          <circle cx="9" cy="12" r=".5" fill="currentColor" />
        </svg>
        <p className={styles.legalNoteText}>
          <Translation
            i18nKey="settings:dataExport.form.legalNote"
            components={{ strong: <strong /> }}
          />
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onSubmit}
        disabled={submitting}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {submitting
          ? t("settings:dataExport.form.submitting")
          : t("settings:dataExport.form.submit")}
      </Button>
    </div>
  );
}

/** Live status view: queued/processing → ready-with-download → failed/expired. */
export function DataExportStatus({
  job,
  filename,
  onRetry,
}: {
  job: ExportJob;
  filename: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const expiry =
    job.expiresAt &&
    fmt.date(new Date(job.expiresAt), { day: "numeric", month: "long" });

  if (job.status === "ready" && job.downloadUrl) {
    return (
      <div
        className={`${styles.card} ${styles.confirmCard} ${styles.screenIn}`}
      >
        <div className={styles.confirmIcon}>
          <FiCheck size={24} color="var(--jade)" aria-hidden="true" />
        </div>
        <h2 className={styles.confirmTitle}>
          {t("settings:dataExport.status.ready.title")}
        </h2>
        <p className={styles.confirmBody}>
          {expiry ? (
            <Translation
              i18nKey="settings:dataExport.status.ready.bodyWithExpiry"
              components={{ strong: <strong /> }}
              values={{ date: expiry }}
            />
          ) : (
            t("settings:dataExport.status.ready.body")
          )}
        </p>
        <Button variant="jade" href={job.downloadUrl} download={filename}>
          <FiDownload style={{ verticalAlign: "-2px", marginRight: 8 }} />
          {t("settings:dataExport.status.download", { filename })}
        </Button>
      </div>
    );
  }

  if (job.status === "failed" || job.status === "expired") {
    return (
      <div
        className={`${styles.card} ${styles.confirmCard} ${styles.screenIn}`}
      >
        <h2 className={styles.confirmTitle}>
          {job.status === "expired"
            ? t("settings:dataExport.status.expired.title")
            : t("settings:dataExport.status.failed.title")}
        </h2>
        <p className={styles.confirmBody}>
          {job.status === "expired"
            ? t("settings:dataExport.status.expired.body")
            : t("settings:dataExport.status.failed.body")}
        </p>
        <Button variant="primary" onClick={onRetry}>
          {t("settings:dataExport.status.retry")}
        </Button>
      </div>
    );
  }

  // queued | processing
  return (
    <div className={`${styles.card} ${styles.confirmCard} ${styles.screenIn}`}>
      <div className={styles.confirmIcon}>
        <FiLoader size={24} className={styles.spin} aria-hidden="true" />
      </div>
      <h2 className={styles.confirmTitle}>
        {t("settings:dataExport.status.building.title")}
      </h2>
      <p className={styles.confirmBody}>
        {t("settings:dataExport.status.building.body")}
      </p>
    </div>
  );
}

export function DataExportIncluded({
  openAcc,
  setOpenAcc,
}: {
  openAcc: number | null;
  setOpenAcc: (n: number | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.includedSection}>
      <h2 className={styles.incTitle}>
        <Translation
          i18nKey="settings:dataExport.included.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.incSub}>{t("settings:dataExport.included.sub")}</p>
      {ACCORDION_ITEMS.map((item, i) => (
        <div key={item.id} className={styles.accItem}>
          <div
            className={styles.accHeader}
            role="button"
            tabIndex={0}
            aria-expanded={openAcc === i}
            onClick={() => setOpenAcc(openAcc === i ? null : i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenAcc(openAcc === i ? null : i);
              }
            }}
          >
            <span className={styles.accName}>{t(item.titleKey)}</span>
            <span
              className={[styles.accArrow, openAcc === i && styles.accArrowOpen]
                .filter(Boolean)
                .join(" ")}
              aria-hidden
            >
              <FiChevronDown />
            </span>
          </div>
          {openAcc === i && (
            <div className={styles.accBody}>
              {t(item.bodyKey)}
              <div className={styles.accTags}>
                {item.tagKeys.map((tagKey) => (
                  <span key={tagKey} className={styles.accTag}>
                    {t(tagKey)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
