import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { DATA_TYPES, ACCORDION_ITEMS } from "./dataExport.data";
import styles from "./DataExportPage.module.css";

type Format = "JSON" | "CSV" | "Both";

export function DataExportSteps({ submitted }: { submitted: boolean }) {
  const stepState = (n: number) => {
    if (submitted) {
      if (n === 1) return "done";
      if (n === 2) return "active";
    }
    if (n === 1) return "active";
    return "";
  };
  const stepCls = (n: number) => {
    const s = stepState(n);
    return [
      styles.stepItem,
      s === "active" && styles.stepItemActive,
      s === "done" && styles.stepItemDone,
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className={stepCls(1) + " " + stepCls(2)}>
      <div className={styles.stepsRow}>
        <div className={stepCls(1)}>
          <div className={styles.stepNum}>
            {stepState(1) === "done" ? <FiCheck /> : "1"}
          </div>
          <div>
            <div className={styles.stepLabel}>Choose what to export</div>
            <div className={styles.stepDesc}>
              Select the data types you want included in your archive.
            </div>
          </div>
        </div>
        <div className={stepCls(2)}>
          <div className={styles.stepNum}>2</div>
          <div>
            <div className={styles.stepLabel}>Confirm your identity</div>
            <div className={styles.stepDesc}>
              We send a verification link to your registered email.
            </div>
          </div>
        </div>
        <div className={styles.stepItem}>
          <div className={styles.stepNum}>3</div>
          <div>
            <div className={styles.stepLabel}>Download your archive</div>
            <div className={styles.stepDesc}>
              Ready within 24 hours. Link expires after 7 days.
            </div>
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
}: {
  checked: boolean[];
  toggleType: (i: number) => void;
  format: Format;
  setFormat: (f: Format) => void;
  onSubmit: () => void;
}) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        Request your <em>data archive</em>
      </h2>
      <p className={styles.cardSub}>
        Select the categories you want included. You can request a full export
        or only specific data types. The archive will be delivered as a
        compressed folder to your registered email address.
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
          Under <strong>GDPR Article 20</strong>, we are required to provide
          your data within <strong>30 days</strong> of a verified request. We
          typically deliver within 24 hours. The archive is encrypted in transit
          and the download link is single-use.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onSubmit}
        style={{ width: "100%", justifyContent: "center" }}
      >
        Request my data archive
      </Button>
    </div>
  );
}

export function DataExportConfirm({ onResend }: { onResend: () => void }) {
  return (
    <div
      className={`${styles.card} ${styles.confirmCard} ${styles.screenIn}`}
      key="confirm"
    >
      <div className={styles.confirmIcon}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--jade)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="3,12 8,18 21,6" />
        </svg>
      </div>
      <h2 className={styles.confirmTitle}>Verification email sent</h2>
      <p className={styles.confirmBody}>
        Check your inbox for a confirmation link. Once verified, your archive
        will be ready within 24 hours.
      </p>
      <p className={styles.confirmResend}>
        Didn't receive it?{" "}
        <button
          type="button"
          className={styles.confirmResendLink}
          onClick={onResend}
        >
          Resend
        </button>
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
