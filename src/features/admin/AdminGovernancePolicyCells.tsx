import type { ReactNode } from "react";
import { FiLock } from "react-icons/fi";
import { Select, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AuthoredTextDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePolicy.module.css";

/**
 * The cells a Policy-tab row is built from.
 *
 * Every control here is named by an `aria-label` that says which ROW it belongs
 * to ("Figure for Active members"), never by the column head alone: six rows of
 * identical "Figure" boxes is exactly the failure the BUDGET=0 a11y gate
 * exists to catch. The small caption above a cell repeats the column head for
 * the narrow layout, where the head strip is gone, and is `aria-hidden` so it
 * never competes with that name.
 *
 * The one exception is {@link PolicyAuthoredCell}: its English and Portuguese
 * captions are visible at every width and ARE the controls' names, because
 * nothing else on screen can tell the two boxes apart.
 */

/** The column head, repeated inside the cell for the stacked narrow layout. */
function CellCaption({ children }: { children: ReactNode }) {
  return (
    <span className={styles.cellLabel} aria-hidden>
      {children}
    </span>
  );
}

export function PolicyTextCell({
  caption,
  ariaLabel,
  value,
  maxLength,
  placeholder,
  isNumeric = false,
  onChange,
}: {
  caption: string;
  ariaLabel: string;
  value: string;
  maxLength: number;
  placeholder?: string;
  isNumeric?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className={[styles.cell, isNumeric && styles.cellNumber]
        .filter(Boolean)
        .join(" ")}
    >
      <CellCaption>{caption}</CellCaption>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** A whole-number field, e.g. the count a trend sentence interpolates. */
export function PolicyNumberCell({
  caption,
  ariaLabel,
  value,
  onChange,
}: {
  caption: string;
  ariaLabel: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className={`${styles.cell} ${styles.cellNumber}`}>
      <CellCaption>{caption}</CellCaption>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value ?? ""}
        aria-label={ariaLabel}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? undefined : Number(event.target.value),
          )
        }
      />
    </div>
  );
}

export function PolicySelectCell({
  caption,
  ariaLabel,
  value,
  options,
  onChange,
  children,
}: {
  caption: string;
  ariaLabel: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  /** Drawn before the control, e.g. a colour swatch for a tint. */
  children?: ReactNode;
}) {
  return (
    <div className={styles.cell}>
      <CellCaption>{caption}</CellCaption>
      <div className={styles.selectRow}>
        {children}
        <Select
          size="sm"
          label={ariaLabel}
          value={value}
          options={options}
          onChange={(next) => onChange(next ?? value)}
        />
      </div>
    </div>
  );
}

/** A cell whose control does not apply to this row, e.g. the trend number on a
 *  trend line whose public sentence interpolates nothing. Says so rather than
 *  leaving a hole, and holds the column's width steady down the list. */
export function PolicyEmptyCell({
  caption,
  reason,
}: {
  caption: string;
  reason: string;
}) {
  return (
    <div className={styles.cell}>
      <CellCaption>{caption}</CellCaption>
      <span className={styles.rowNone}>{reason}</span>
    </div>
  );
}

/** A switch with the state it produces spelled out beside it, because "on" is
 *  not the same information as "the public page draws an arrow here". */
export function PolicyToggleCell({
  caption,
  ariaLabel,
  checked,
  onText,
  offText,
  onChange,
}: {
  caption: string;
  ariaLabel: string;
  checked: boolean;
  onText: string;
  offText: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={styles.cell}>
      <CellCaption>{caption}</CellCaption>
      <div className={styles.direction}>
        <Toggle checked={checked} onChange={onChange} label={ariaLabel} />
        <span className={styles.directionText}>
          {checked ? onText : offText}
        </span>
      </div>
    </div>
  );
}

/** A value the backend owns and recomputes: shown, dashed and locked. */
export function PolicyReadOnlyCell({
  caption,
  value,
  reason,
}: {
  caption: string;
  value: string;
  reason: string;
}) {
  return (
    <div className={styles.cell}>
      <CellCaption>{caption}</CellCaption>
      <span className={styles.readOnly} title={reason}>
        <FiLock aria-hidden />
        {value}
        <span className="visuallyHidden">{reason}</span>
      </span>
    </div>
  );
}

/** Text this row shows but nobody can edit here, because it lives in the
 *  translation bundle. */
export function PolicyStaticCell({
  caption,
  children,
  isSecondary = false,
}: {
  caption: string;
  children: ReactNode;
  isSecondary?: boolean;
}) {
  return (
    <div className={styles.cell}>
      <CellCaption>{caption}</CellCaption>
      <span className={isSecondary ? styles.rowText : styles.rowName}>
        {children}
      </span>
    </div>
  );
}

/**
 * The English and Portuguese of one piece of prose an editor is authoring.
 *
 * Both languages are asked for at once, stacked, because the backend requires
 * both and it requires both because nothing on this platform goes back and
 * translates a governance entry later: the moment it is written is the only
 * moment the Portuguese exists to be had. A single-language field would produce
 * a public accountability page half unreadable to the members it is for.
 */
export function PolicyAuthoredCell({
  idPrefix,
  caption,
  label,
  value,
  maxLength,
  isMultiline = false,
  onChange,
}: {
  /** Unique per row and per field, e.g. `decision-lead-2`. */
  idPrefix: string;
  caption: string;
  /** What this prose is, e.g. "Decision". Prefixes both language captions. */
  label: string;
  value: AuthoredTextDTO;
  maxLength: number;
  isMultiline?: boolean;
  onChange: (next: AuthoredTextDTO) => void;
}) {
  const { t } = useTranslation();
  const languages = [
    {
      code: "en" as const,
      caption: t("admin:governance.overview.edit.textEn", { label }),
    },
    {
      code: "pt" as const,
      caption: t("admin:governance.overview.edit.textPt", { label }),
    },
  ];

  return (
    <div className={styles.cell}>
      <CellCaption>{caption}</CellCaption>
      {languages.map((language) => {
        const fieldId = `${idPrefix}-${language.code}`;
        return (
          <div key={language.code} className={styles.langField}>
            <label className={styles.langLabel} htmlFor={fieldId}>
              {language.caption}
            </label>
            {isMultiline ? (
              <textarea
                id={fieldId}
                rows={2}
                maxLength={maxLength}
                value={value[language.code]}
                onChange={(event) =>
                  onChange({ ...value, [language.code]: event.target.value })
                }
              />
            ) : (
              <input
                id={fieldId}
                type="text"
                maxLength={maxLength}
                value={value[language.code]}
                onChange={(event) =>
                  onChange({ ...value, [language.code]: event.target.value })
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
