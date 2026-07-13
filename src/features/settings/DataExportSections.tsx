import { FiCheck, FiDownload, FiLoader } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ACCORDION_ITEMS, DATA_TYPES } from "./dataExport.data";
import type { ExportJob } from "./api/account.api";
import styles from "./DataExportPage.module.css";

type Format = "JSON" | "CSV" | "Both";

/** form → identity (job building) → download-ready. */
export type ExportPhase = "form" | "building" | "ready";

export function DataExportSteps({ phase }: { phase: ExportPhase }) {
  const state = (n: number): "" | "active" | "done" => {
    if (phase === "form") return n === 1 ? "active" : "";
    if (phase === "building") {
      if (n === 1) return "done";
      if (n === 2) return "active";
      return "";
    }
    // ready
    if (n === 3) return "active";
    return "done";
  };
  const cls = (n: number) =>
    [
      styles.stepItem,
      state(n) === "active" && styles.stepItemActive,
      state(n) === "done" && styles.stepItemDone,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className={styles.stepsRow}>
      <div className={cls(1)}>
        <div className={styles.stepNum}>
          {state(1) === "done" ? <FiCheck /> : "1"}
        </div>
        <div>
          <div className={styles.stepLabel}>Choose what to export</div>
          <div className={styles.stepDesc}>
            Select the data types you want included in your archive.
          </div>
        </div>
      </div>
      <div className={cls(2)}>
        <div className={styles.stepNum}>
          {state(2) === "done" ? <FiCheck /> : "2"}
        </div>
        <div>
          <div className={styles.stepLabel}>Confirm your identity</div>
          <div className={styles.stepDesc}>
            We email a verification link to your registered address.
          </div>
        </div>
      </div>
      <div className={cls(3)}>
        <div className={styles.stepNum}>3</div>
        <div>
          <div className={styles.stepLabel}>Download your archive</div>
          <div className={styles.stepDesc}>
            A single-use link, available for 7 days.
          </div>
        </div>
      </div>
    </div>
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
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        Request your <em>data archive</em>
      </h2>
      <p className={styles.cardSub}>
        Select the categories you want included. You can request a full export
        or only specific data types. We'll email you a secure link the moment
        your archive is ready.
      </p>

      <div className={styles.fieldLabel}>What to include</div>
      <div className={styles.dataTypes}>
        {DATA_TYPES.map((dt, i) => (
          <div
            key={dt.label}
            className={[styles.dtItem, checked[i] && styles.dtItemChecked]
              .filter(Boolean)
              .join(" ")}
            role="button"
            tabIndex={0}
            aria-pressed={checked[i]}
            onClick={() => toggleType(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleType(i);
              }
            }}
          >
            <div className={styles.dtCheck}>
              <svg className={styles.dtCheckIcon} viewBox="0 0 10 8">
                <polyline points="1,4 3.5,7 9,1" />
              </svg>
            </div>
            <div>
              <div className={styles.dtLabel}>{dt.label}</div>
              <div className={styles.dtSub}>{dt.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.fieldLabel}>File format</div>
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
            {f}
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
        >
          <circle cx="9" cy="9" r="7.5" />
          <line x1="9" y1="7" x2="9" y2="9.5" />
          <circle cx="9" cy="12" r=".5" fill="currentColor" />
        </svg>
        <p className={styles.legalNoteText}>
          Under <strong>GDPR Article 20</strong>, we provide your data within{" "}
          <strong>30 days</strong> of a verified request. The archive is
          encrypted in transit and the download link is single-use.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onSubmit}
        disabled={submitting}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {submitting ? "Requesting…" : "Request my data archive"}
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
  const expiry =
    job.expiresAt &&
    new Date(job.expiresAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
    });

  if (job.status === "ready" && job.downloadUrl) {
    return (
      <div
        className={`${styles.card} ${styles.confirmCard} ${styles.screenIn}`}
      >
        <div className={styles.confirmIcon}>
          <FiCheck size={24} color="var(--jade)" aria-hidden="true" />
        </div>
        <h2 className={styles.confirmTitle}>Your archive is ready</h2>
        <p className={styles.confirmBody}>
          We've also emailed this link to your registered address. It's
          single-use
          {expiry ? (
            <>
              {" "}
              and expires on <strong>{expiry}</strong>
            </>
          ) : null}
          .
        </p>
        <Button variant="jade" href={job.downloadUrl} download={filename}>
          <FiDownload style={{ verticalAlign: "-2px", marginRight: 8 }} />
          Download {filename}
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
            ? "That link has expired"
            : "That didn't work"}
        </h2>
        <p className={styles.confirmBody}>
          {job.status === "expired"
            ? "For your safety, export links expire after 7 days. Request a fresh archive and we'll build it again."
            : "We couldn't build your archive just now — nothing left your account. Try again in a moment."}
        </p>
        <Button variant="primary" onClick={onRetry}>
          Request again
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
      <h2 className={styles.confirmTitle}>Building your archive</h2>
      <p className={styles.confirmBody}>
        We're gathering your data and packaging it up. This can take a little
        while — we'll email you the moment it's ready, so you can close this
        page.
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
  return (
    <div className={styles.includedSection}>
      <h2 className={styles.incTitle}>
        What's <em>included</em>
      </h2>
      <p className={styles.incSub}>
        A breakdown of every data category we hold and what each contains.
      </p>
      {ACCORDION_ITEMS.map((item, i) => (
        <div key={item.title} className={styles.accItem}>
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
            <span className={styles.accName}>{item.title}</span>
            <span
              className={[styles.accArrow, openAcc === i && styles.accArrowOpen]
                .filter(Boolean)
                .join(" ")}
            >
              ▼
            </span>
          </div>
          {openAcc === i && (
            <div className={styles.accBody}>
              {item.body}
              <div className={styles.accTags}>
                {item.tags.map((t) => (
                  <span key={t} className={styles.accTag}>
                    {t}
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
