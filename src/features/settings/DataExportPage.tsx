import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { DATA_TYPES } from "./dataExport.data";
import {
  DataExportSteps,
  DataExportForm,
  DataExportConfirm,
  DataExportIncluded,
} from "./DataExportSections";
import styles from "./DataExportPage.module.css";

type Format = "JSON" | "CSV" | "Both";

export function DataExportPage() {
  const { showToast } = useToast();
  const [checked, setChecked] = useState<boolean[]>(
    DATA_TYPES.map((d) => d.defaultChecked),
  );
  const [format, setFormat] = useState<Format>("JSON");
  const [submitted, setSubmitted] = useState(false);
  const [openAcc, setOpenAcc] = useState<number | null>(null);

  function toggleType(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function handleSubmit() {
    if (!checked.some(Boolean)) {
      showToast("Select at least one data type.", "error");
      return;
    }
    setSubmitted(true);
  }

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Your data · GDPR Art. 20</div>
          <h1 className={styles.heading}>
            Your data.
            <br />
            <em>Yours to take.</em>
          </h1>
          <p className={styles.sub}>
            Under GDPR, you have the right to receive a copy of all personal
            data we hold about you, in a machine-readable format. This page is
            how you request it. No forms. No waiting rooms. Just your data.
          </p>
        </div>
      </header>

      <main className={styles.body}>
        <div className="wrap">
          <DataExportSteps submitted={submitted} />

          {!submitted ? (
            <DataExportForm
              checked={checked}
              toggleType={toggleType}
              format={format}
              setFormat={setFormat}
              onSubmit={handleSubmit}
            />
          ) : (
            <DataExportConfirm
              onResend={() => showToast("Verification email resent", "info")}
            />
          )}

          <DataExportIncluded openAcc={openAcc} setOpenAcc={setOpenAcc} />
        </div>
      </main>

      <Outro
        title={
          <>
            Questions about
            <br />
            <em>your data?</em>
          </>
        }
        sub="Write to our data team. We respond to all requests within 5 working days."
      >
        <Button variant="primary" size="lg" to={routes.contact}>
          Contact us
        </Button>
      </Outro>
    </PageShell>
  );
}
