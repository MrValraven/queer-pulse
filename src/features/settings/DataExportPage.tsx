import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { readReauthLandingToken } from "./api/useReauthToken";
import type { ExportFormat } from "./api/account.api";
import styles from "./DataExportPage.module.css";

type Format = "JSON" | "CSV" | "Both";

const FORMAT_MAP: Record<Format, ExportFormat> = {
  JSON: "json",
  CSV: "csv",
  Both: "both",
};

/** `FORMAT_MAP` read backwards, for parsing `?format=` off the URL. */
const FORMAT_BY_WIRE_VALUE: Record<ExportFormat, Format> = {
  json: "JSON",
  csv: "CSV",
  both: "Both",
};

/**
 * The chosen categories and format live in the URL, not in component state.
 *
 * An export sits behind a step-up re-auth, which is a real Google OAuth round
 * trip: the SPA unloads, and `beginReauth` sends the browser back to
 * `pathname + search`. Anything in `useState` is gone by then, so a member who
 * chose "messages only, CSV" used to land back on the defaults and their next
 * press exported a different set than the one they picked, with a 3-per-hour
 * throttle capping how often they could correct it (PRD-305).
 *
 * The search string is the natural carrier because it is already what the
 * round trip preserves; `beginReauth`'s doc comment traces every hop that
 * keeps it intact. This value therefore comes back through an EXTERNAL
 * redirect and is parsed as untrusted input: every category is matched against
 * `DATA_TYPES` and the format against the three known values, and anything
 * unrecognised is dropped.
 *
 * `?format=` doubles as the marker for "this search is one we wrote". Without
 * it the parse keeps the older seed-link behaviour, where
 * `?categories=messages,events` from the Settings card narrows the form and an
 * empty or unrecognised list means the defaults. With it, an empty category
 * list is taken literally, so a member who unticked everything does not find
 * the defaults silently restored on landing.
 */
function parseSelection(searchParams: URLSearchParams): {
  checked: boolean[];
  format: Format;
} {
  const wireFormat = searchParams.get("format");
  const isOurSearch = wireFormat !== null && wireFormat in FORMAT_BY_WIRE_VALUE;
  const format = isOurSearch
    ? FORMAT_BY_WIRE_VALUE[wireFormat as ExportFormat]
    : "JSON";
  const rawCategories = searchParams.get("categories");
  const requestedIds = (rawCategories ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => DATA_TYPES.some((dataType) => dataType.id === id));
  if (!isOurSearch && requestedIds.length === 0) {
    return {
      checked: DATA_TYPES.map((dataType) => dataType.defaultChecked),
      format,
    };
  }
  return {
    checked: DATA_TYPES.map((dataType) => requestedIds.includes(dataType.id)),
    format,
  };
}

/**
 * What the archive is actually called. Only `json` is a bare file — `csv` and
 * `both` come back as a zip of per-category CSVs (plus the JSON, for `both`).
 *
 * This used to be hardcoded `queerpulse-export.json` for every format, so a CSV
 * export offered a `.json` download. The server's `Content-Disposition` is the
 * real authority here — the `download` attribute is ignored on a cross-origin
 * response, and the API is on a different host — but the UI should not name the
 * file something it isn't.
 */
const FILENAME: Record<Format, string> = {
  JSON: "queerpulse-export.json",
  CSV: "queerpulse-export.zip",
  Both: "queerpulse-export.zip",
};

export function DataExportPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { job, start, reset, isStarting } = useExportFlow();
  const [searchParams, setSearchParams] = useSearchParams();
  const { checked, format } = useMemo(
    () => parseSelection(searchParams),
    [searchParams],
  );
  const [openAcc, setOpenAcc] = useState<number | null>(null);
  // Read during the FIRST render, while the fragment the callback left is
  // still on the URL: `useReauthCompletion` clears it in an effect at the app
  // root. Non-null only on the landing itself, which is what keeps the resume
  // below from re-firing on a later visit.
  const [landingReauthToken] = useState(readReauthLandingToken);
  const hasResumedRef = useRef(false);

  // Stable ids, never the translated label. This array is sent to the live
  // `POST /account/export` endpoint as well as matched locally in
  // `buildDemoArchive`, so it must not change with the active language.
  const selectedCategoryIds = DATA_TYPES.filter(
    (_, index) => checked[index],
  ).map((dataType) => dataType.id);

  /** Park the selection in the URL, where the step-up round trip preserves it. */
  function writeSelection(nextChecked: boolean[], nextFormat: Format) {
    const next = new URLSearchParams(searchParams);
    next.set(
      "categories",
      DATA_TYPES.filter((_, index) => nextChecked[index])
        .map((dataType) => dataType.id)
        .join(","),
    );
    next.set("format", FORMAT_MAP[nextFormat]);
    // `replace` so tapping through the checkboxes does not bury the page the
    // member arrived from under a dozen history entries.
    setSearchParams(next, { replace: true });
  }

  function toggleType(index: number) {
    writeSelection(
      checked.map((isChecked, idx) => (idx === index ? !isChecked : isChecked)),
      format,
    );
  }

  function setFormat(nextFormat: Format) {
    writeSelection(checked, nextFormat);
  }

  function handleSubmit() {
    if (selectedCategoryIds.length === 0) {
      showToast(t("settings:dataExport.toast.selectType"), "error");
      return;
    }
    void start({
      categories: selectedCategoryIds,
      format: FORMAT_MAP[format],
    });
  }

  // Resume on the step-up landing. The member already pressed start once, and
  // the choices they pressed it with are on the URL, so making them press it
  // again buys nothing: an export creates a read-only archive and destroys
  // nothing, unlike the deactivation and deletion flows that share this
  // step-up and deliberately keep their second press. Armed by the landing
  // fragment rather than the cached token, so it runs once, on the trip the
  // member started, and never on a later visit while that token is still
  // valid. Demo mode never produces the fragment, so it never fires there.
  useEffect(() => {
    if (!landingReauthToken || hasResumedRef.current) return;
    hasResumedRef.current = true;
    if (selectedCategoryIds.length === 0) return;
    void start({
      categories: selectedCategoryIds,
      format: FORMAT_MAP[format],
      reauthToken: landingReauthToken,
    });
    // Runs once, on the landing. `selectedCategoryIds` is rebuilt every render
    // and would otherwise retrigger the effect, which the ref already guards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landingReauthToken]);

  const phase: ExportPhase = !job
    ? "form"
    : job.status === "ready"
      ? "ready"
      : job.status === "failed" || job.status === "expired"
        ? "form"
        : "building";

  return (
    <PageShell>
      <header className={styles.hero} data-plum>
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

      <div className={styles.body}>
        <div className="wrap">
          <DataExportSteps phase={phase} />

          {!job ? (
            <DataExportForm
              checked={checked}
              toggleType={toggleType}
              format={format}
              setFormat={setFormat}
              onSubmit={handleSubmit}
              submitting={isStarting}
            />
          ) : (
            <DataExportStatus
              job={job}
              filename={FILENAME[format]}
              onRetry={reset}
            />
          )}

          <DataExportIncluded openAcc={openAcc} setOpenAcc={setOpenAcc} />
        </div>
      </div>

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
