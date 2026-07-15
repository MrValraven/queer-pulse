import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ComingSoon, Toggle } from "../../shared/components/ui";
import styles from "./SettingsPage.module.css";

export function Pane({
  title,
  sub,
  children,
}: {
  title: ReactNode;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h1 className={styles.paneTitle}>{title}</h1>
      <p className={styles.paneSub}>{sub}</p>
      {children}
    </div>
  );
}

export function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>{label}</div>
      {children}
    </div>
  );
}

export function ToggleList({ children }: { children: ReactNode }) {
  return <div className={styles.toggleList}>{children}</div>;
}

export function ToggleRow({
  title,
  desc,
  defaultChecked,
  comingSoon,
  onChange,
}: {
  title: string;
  desc?: string;
  defaultChecked?: boolean;
  /** Flags a control with no backend behind it yet: shows a badge, disables the toggle. */
  comingSoon?: boolean;
  onChange: () => void;
}) {
  // Lift the previously-uncontrolled checkbox to local state, seeded from the
  // existing default — same external behavior, controlled shared <Toggle>.
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>
          {title} {comingSoon && <ComingSoon />}
        </div>
        {desc && <div className={styles.toggleDesc}>{desc}</div>}
      </div>
      <div
        className={comingSoon ? styles.comingSoonControl : undefined}
        inert={comingSoon}
      >
        <Toggle
          tone="coral"
          checked={checked}
          onChange={(next) => {
            if (comingSoon) return;
            setChecked(next);
            onChange();
          }}
          label={title}
        />
      </div>
    </div>
  );
}

export function SelectRow({
  title,
  desc,
  options,
  defaultValue,
  comingSoon,
  onChange,
}: {
  title: string;
  desc: string;
  options: string[];
  defaultValue: string;
  /** Flags a control with no backend behind it yet: shows a badge, disables the select. */
  comingSoon?: boolean;
  onChange: () => void;
}) {
  return (
    <div className={styles.selectRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>
          {title} {comingSoon && <ComingSoon />}
        </div>
        <div className={styles.toggleDesc}>{desc}</div>
      </div>
      <select
        className={styles.select}
        defaultValue={defaultValue}
        disabled={comingSoon}
        onChange={comingSoon ? undefined : onChange}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function DataCard({
  title,
  desc,
  btn,
  onClick,
  to,
}: {
  title: string;
  desc: string;
  btn: string;
  onClick?: () => void;
  to?: string;
}) {
  return (
    <div className={styles.dataCard}>
      <div className={styles.dcText}>
        <div className={styles.dcTitle}>{title}</div>
        <div className={styles.dcDesc}>{desc}</div>
      </div>
      {to ? (
        <Link to={to} className={styles.dcBtn}>
          {btn}
        </Link>
      ) : (
        <button type="button" className={styles.dcBtn} onClick={onClick}>
          {btn}
        </button>
      )}
    </div>
  );
}

export function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="delete-account-modal-title">Delete your account?</h3>
        <p>
          Deleting permanently erases your profile, messages, community posts,
          and all associated data within 30 days. It cannot be undone. We
          recommend downloading your data first. Next, you'll confirm your
          password and we'll email you to finish the request.
        </p>
        <div className={styles.modalBtns}>
          <button type="button" className={styles.dcBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.dcBtn} ${styles.danger}`}
            onClick={onConfirm}
          >
            Continue to delete
          </button>
        </div>
      </div>
    </div>
  );
}
