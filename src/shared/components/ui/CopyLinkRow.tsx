import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { useToast } from "../feedback/useToast";
import styles from "./CopyLinkRow.module.css";

export interface CopyLinkRowProps {
  /** The exact text written to the clipboard — the full, absolute URL. */
  value: string;
  /** What the read-only field shows; defaults to `value` (e.g. a short form). */
  display?: string;
  /** `plum` for dark success panels, `paper` for light cards over cream. */
  tone?: "plum" | "paper";
  /** Idle button label, e.g. t("auth:common.copy"). */
  copyLabel: string;
  /** Post-copy button label, e.g. t("auth:common.copied"). */
  copiedLabel: string;
  /** Success toast copy. */
  copiedToast: string;
  /** Toast shown when the clipboard API refuses (permissions, insecure origin). */
  errorToast: string;
  /**
   * Accessible name for the read-only URL field (there's no visible `<label>`).
   * Defaults to `copyLabel` so the field is never nameless; pass a more precise
   * label (e.g. "Invite link") when the caller has one.
   */
  fieldLabel?: string;
  className?: string;
}

/**
 * The one copy-a-link control in the app: a read-only field plus a copy button
 * that flips to a jade "copied" state for two seconds. Extracted from
 * InviteReadyPanel so the mod queue's approved-applicant invite link reuses the
 * exact same behaviour (and the exact same clipboard error handling) instead of
 * growing a second implementation. Labels are passed in so each caller keeps its
 * own catalog namespace.
 */
export function CopyLinkRow({
  value,
  display,
  tone = "plum",
  copyLabel,
  copiedLabel,
  copiedToast,
  errorToast,
  fieldLabel,
  className,
}: CopyLinkRowProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast(copiedToast, "success");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(errorToast, "error");
    }
  }

  return (
    <div className={`${styles.row} ${styles[tone]} ${className ?? ""}`.trim()}>
      <input
        className={styles.field}
        type="text"
        readOnly
        aria-label={fieldLabel ?? copyLabel}
        value={display ?? value}
      />
      <button
        type="button"
        className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`}
        onClick={() => void copy()}
        aria-label={copied ? copiedToast : copyLabel}
      >
        {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
