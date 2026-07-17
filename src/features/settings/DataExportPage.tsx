import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DATA_TYPES } from "./dataExport.data";
import {
  DataExportForm,
  DataExportIncluded,
  DataExportStatus,
  DataExportSteps,
  type ExportPhase,
} from "./DataExportSections";
import { useExportFlow } from "./api/useExportFlow";
import type { ExportFormat } from "./api/account.api";
import styles from "./DataExportPage.module.css";

type Format = "JSON" | "CSV" | "Both";

const FORMAT_MAP: Record<Format, ExportFormat> = {
  JSON: "json",
  CSV: "csv",
  Both: "both",
};

export function DataExportPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { job, start, reset } = useExportFlow();
  const [checked, setChecked] = useState<boolean[]>(
    DATA_TYPES.map((d) => d.defaultChecked),
  );
  const [format, setFormat] = useState<Format>("JSON");
  const [openAcc, setOpenAcc] = useState<number | null>(null);

  function toggleType(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function handleSubmit() {
    // Stable ids, never the translated label — this array is sent to the
    // live `POST /account/export` endpoint as well as matched locally in
    // `buildDemoArchive`; it must not change with the active language.
    const categories = DATA_TYPES.filter((_, i) => checked[i]).map((d) => d.id);
    if (categories.length === 0) {
      showToast(t("settings:dataExport.toast.selectType"), "error");
      return;
    }
    void start({ categories, format: FORMAT_MAP[format] });
  }

  const phase: ExportPhase = !job
    ? "form"
    : job.status === "ready"
      ? "ready"
      : job.status === "failed" || job.status === "expired"
        ? "form"
        : "building";

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>
            {t("settings:dataExport.hero.eyebrow")}
          </div>
          <h1 className={styles.heading}>
            {t("settings:dataExport.hero.titleLine1")}
            <br />
            <em>{t("settings:dataExport.hero.titleLine2")}</em>
          </h1>
          <p className={styles.sub}>{t("settings:dataExport.hero.sub")}</p>
        </div>
      </header>

      <main className={styles.body}>
        <div className="wrap">
          <DataExportSteps phase={phase} />

          {!job ? (
            <DataExportForm
              checked={checked}
              toggleType={toggleType}
              format={format}
              setFormat={setFormat}
              onSubmit={handleSubmit}
              submitting={false}
            />
          ) : (
            <DataExportStatus
              job={job}
              filename="queerpulse-export.json"
              onRetry={reset}
            />
          )}

          <DataExportIncluded openAcc={openAcc} setOpenAcc={setOpenAcc} />
        </div>
      </main>

      <Outro
        title={
          <>
            {t("settings:dataExport.outro.titleLine1")}
            <br />
            <em>{t("settings:dataExport.outro.titleLine2")}</em>
          </>
        }
        sub={t("settings:dataExport.outro.sub")}
      >
        <Button variant="primary" size="lg" to={routes.contact}>
          {t("settings:dataExport.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
