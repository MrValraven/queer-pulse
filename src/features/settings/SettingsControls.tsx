import { type ReactNode, useId, useState } from "react";
import { Link } from "react-router-dom";
import { ComingSoon, ConfirmDialog, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  description,
  defaultChecked,
  comingSoon,
  onChange,
}: {
  title: string;
  description?: string;
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
        {description && <div className={styles.toggleDesc}>{description}</div>}
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
  description,
  options,
  defaultValue,
  value,
  comingSoon,
  onChange,
}: {
  title: string;
  description: string;
  /** Plain strings when value === label, or `{ value, label }` when they differ. */
  options: (string | { value: string; label: string })[];
  defaultValue?: string;
  /** Pass to make the select controlled (its value tracks live state). */
  value?: string;
  /** Flags a control with no backend behind it yet: shows a badge, disables the select. */
  comingSoon?: boolean;
  /** Receives the selected option's value. */
  onChange: (value: string) => void;
}) {
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  const controlled = value !== undefined;
  const titleId = useId();
  return (
    <div className={styles.selectRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>
          <span id={titleId}>{title}</span> {comingSoon && <ComingSoon />}
        </div>
        <div className={styles.toggleDesc}>{description}</div>
      </div>
      <select
        className={styles.select}
        aria-labelledby={titleId}
        {...(controlled ? { value } : { defaultValue })}
        disabled={comingSoon}
        onChange={comingSoon ? undefined : (e) => onChange(e.target.value)}
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DataCard({
  title,
  description,
  button,
  onClick,
  to,
}: {
  title: string;
  description: string;
  button: string;
  onClick?: () => void;
  to?: string;
}) {
  return (
    <div className={styles.dataCard}>
      <div className={styles.dcText}>
        <div className={styles.dcTitle}>{title}</div>
        <div className={styles.dcDesc}>{description}</div>
      </div>
      {to ? (
        <Link to={to} className={styles.dcBtn}>
          {button}
        </Link>
      ) : (
        <button type="button" className={styles.dcBtn} onClick={onClick}>
          {button}
        </button>
      )}
    </div>
  );
}

/**
 * First-step "are you sure?" confirm before the re-auth-gated deletion flow.
 * Built on the shared `ConfirmDialog` (scroll-lock, Escape, click-out and
 * focus-trap come from the underlying `Modal`); only mounted while open, so it
 * passes `open` unconditionally. The heavier multi-step erasure UX stays in
 * `DestructiveActionFlow`.
 */
export function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={onConfirm}
      tone="destructive"
      title={t("settings:controls.deleteModal.title")}
      description={t("settings:controls.deleteModal.body")}
      cancelLabel={t("settings:controls.deleteModal.cancel")}
      confirmLabel={t("settings:controls.deleteModal.continue")}
    />
  );
}
