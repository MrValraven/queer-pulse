import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { PageShell, BackToSettingsLink } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Step1, Step2, Step3, Step4, StepDone } from "./TwoFactorSetupSteps";
import styles from "./TwoFactorSetupPage.module.css";

type Method = "app" | "sms";
type Step = 1 | 2 | 3 | 4 | "done";

const BACKUP_CODES = [
  "4HF7-K2N9",
  "RTPM-X3WL",
  "9CBJ-V8QA",
  "ZNXD-K1HP",
  "L7YR-2FCM",
  "U6KW-9JBQ",
  "83XN-VTPC",
  "QM4L-RKW2",
  "FB2J-NXC7",
  "HRVT-8YLP",
];
const SECRET = "QPLS-K4N3-7AXM-9QRV-2WCT-XEP8";

const STEPS: { n: number; label: string }[] = [
  { n: 1, label: "Method" },
  { n: 2, label: "Scan" },
  { n: 3, label: "Verify" },
  { n: 4, label: "Backup" },
];

export function TwoFactorSetupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<Method>("app");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [codeError, setCodeError] = useState(false);
  const [codeMsg, setCodeMsg] = useState("Demo: any six digits work.");
  const [codeMsgOk, setCodeMsgOk] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");

  function next() {
    setStep(((step as number) + 1) as Step);
  }
  function prev() {
    setStep(((step as number) - 1) as Step);
  }

  function resetCodeHint() {
    setCodeError(false);
    setCodeMsg("Demo: any six digits work.");
    setCodeMsgOk(false);
  }

  function handleDigitInput(i: number, val: string) {
    const ch = val.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    resetCodeHint();
  }

  function handleDigitPaste(text: string) {
    const clean = text.replace(/\D/g, "").slice(0, 6);
    if (!clean) return;
    setDigits(Array.from({ length: 6 }, (_, i) => clean[i] ?? ""));
    resetCodeHint();
  }

  function verifyDigits(full: string) {
    if (full.length !== 6 || !/^\d{6}$/.test(full)) {
      setCodeError(true);
      setCodeMsg("Need all six digits.");
      setCodeMsgOk(false);
      return;
    }
    setCodeError(false);
    setCodeMsg("Verified.");
    setCodeMsgOk(true);
    setTimeout(() => setStep(4), 600);
  }
  function verify() {
    verifyDigits(digits.join(""));
  }

  // Auto-submit the moment all six boxes are filled — no need to reach for the button.
  useEffect(() => {
    if (step === 3 && digits.every((d) => d !== "") && !codeMsgOk) {
      verifyDigits(digits.join(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, step]);

  function copySecret() {
    navigator.clipboard?.writeText(SECRET);
    setCopyLabel("Copied");
    setTimeout(() => setCopyLabel("Copy"), 1400);
  }

  function copyCodes() {
    navigator.clipboard?.writeText(BACKUP_CODES.join("\n"));
    showToast("Codes copied to clipboard", "success");
  }

  function downloadCodes() {
    const blob = new Blob(
      [
        "QueerPulse 2FA backup codes — keep these safe.\n\n" +
          BACKUP_CODES.join("\n") +
          "\n",
      ],
      { type: "text/plain" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "queerpulse-backup-codes.txt";
    a.click();
  }

  function finish() {
    setStep("done");
    showToast("Two-factor auth enabled", "success");
  }

  return (
    <PageShell>
      <BackToSettingsLink />
      <div className={styles.pageWrap}>
        <Link to={routes.security} className={styles.back}>
          ← Security
        </Link>
        <div className={styles.eyebrow}>Account security</div>
        <h1 className={styles.h1}>
          Add a second <em>lock on the door.</em>
        </h1>
        <p className={styles.lead}>
          Two-factor auth means even if your password is stolen, your account
          isn't. Takes about a minute.
        </p>

        {step !== "done" && (
          <div className={styles.stepper}>
            {STEPS.map((s, idx) => (
              <div key={`step-wrap-${s.n}`} style={{ display: "contents" }}>
                <div
                  className={[
                    styles.step,
                    (step as number) === s.n ? styles.stepActive : "",
                    (step as number) > s.n ? styles.stepDone : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={styles.stepNum}>{s.n}</div>
                  <div className={styles.stepLabel}>{s.label}</div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={[
                      styles.stepBar,
                      (step as number) > s.n ? styles.stepBarActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.screenIn} key={step}>
          {step === 1 && (
            <Step1 method={method} setMethod={setMethod} onNext={next} />
          )}
          {step === 2 && (
            <Step2
              onNext={next}
              onPrev={prev}
              copyLabel={copyLabel}
              onCopy={copySecret}
            />
          )}
          {step === 3 && (
            <Step3
              digits={digits}
              codeError={codeError}
              codeMsg={codeMsg}
              codeMsgOk={codeMsgOk}
              onInput={handleDigitInput}
              onPaste={handleDigitPaste}
              onVerify={verify}
              onPrev={prev}
            />
          )}
          {step === 4 && (
            <Step4
              onCopyCodes={copyCodes}
              onDownload={downloadCodes}
              onFinish={finish}
            />
          )}
          {step === "done" && (
            <StepDone
              onSecurity={() => navigate(routes.security)}
              onSettings={() => navigate(routes.settings)}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
