import { useId, type ReactNode } from "react";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import styles from "./SkinScalarControls.module.css";

/** Props shared by the euro and count inputs. The trailing `aria-*` trio is
 *  what FormField injects once a control opts in via `formFieldControl`. */
interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

const NON_DIGITS = /\D/g;
const NON_AMOUNT_CHARACTERS = /[^\d.,]/g;
/** Digits with at most one decimal separator (, or .) and two decimals. */
const AMOUNT_PATTERN = /^\d*(?:[.,]\d{0,2})?$/;
/** A label that already names the currency ("Standard fee (euros)"). */
const NAMES_CURRENCY = /euro|€/i;

/** Only whole digits: "12 places" becomes "12". */
function toWholeDigits(typed: string): string {
  return typed.replace(NON_DIGITS, "");
}

/** Strip a legacy stored amount to its number for display: "65€" reads
 *  "65", "60.00" stays "60.00". Nothing is written back until an edit. */
function toDisplayAmount(stored: string): string {
  return stored.replace(NON_AMOUNT_CHARACTERS, "");
}

/** The next amount after an edit, or null to refuse it. Stray characters
 *  ("65€") are dropped; a second separator or a third decimal is refused
 *  whole, so digits on either side of a separator never merge. A deletion
 *  is always accepted, so a legacy value that breaks the pattern can still
 *  be cleared. */
function nextAmount(typed: string, previous: string): string | null {
  const cleaned = typed.replace(NON_AMOUNT_CHARACTERS, "");
  if (AMOUNT_PATTERN.test(cleaned)) return cleaned;
  return cleaned.length < previous.length ? cleaned : null;
}

/** The shared input: a compact 48px box with an optional suffix drawn
 *  inside its right edge. `toValue` turns what was typed into the value to
 *  store, or null to keep the current one. */
function AmountInput({
  value,
  onChange,
  className,
  shellClassName,
  suffix,
  inputMode,
  toValue,
  children,
  ...inputProps
}: NumberInputProps & {
  shellClassName?: string;
  suffix?: string;
  inputMode: "numeric" | "decimal";
  toValue: (typed: string, previous: string) => string | null;
  children?: ReactNode;
}) {
  return (
    <div
      className={[styles.numberShell, shellClassName, className]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        {...inputProps}
        className={styles.numberInput}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        value={value}
        onChange={(event) => {
          const next = toValue(event.target.value, value);
          if (next !== null) onChange(next);
        }}
      />
      {suffix && (
        <span className={styles.suffix} aria-hidden>
          {suffix}
        </span>
      )}
      {children}
    </div>
  );
}

/**
 * A euro amount ("65", "32,50") with a € suffix and a decimal keypad. The
 * suffix is decorative, so the currency reaches screen readers another way:
 * appended to an explicit `aria-label`, or else as a hidden description
 * beside the visible label.
 */
export function MoneyInput({
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
  value,
  ...props
}: NumberInputProps) {
  const { t } = useTranslation();
  const currencyId = useId();
  const hasOwnName = Boolean(ariaLabel);
  const accessibleName =
    ariaLabel && !NAMES_CURRENCY.test(ariaLabel)
      ? t("subprofiles:skinControl.money.ariaLabel", { label: ariaLabel })
      : ariaLabel;
  const description = hasOwnName
    ? describedBy
    : [describedBy, currencyId].filter(Boolean).join(" ");

  return (
    <AmountInput
      {...props}
      value={toDisplayAmount(value)}
      shellClassName={styles.moneyShell}
      suffix="€"
      inputMode="decimal"
      toValue={nextAmount}
      aria-label={accessibleName}
      aria-describedby={description}
    >
      {!hasOwnName && (
        <span id={currencyId} hidden>
          {t("subprofiles:skinControl.money.currency")}
        </span>
      )}
    </AmountInput>
  );
}
MoneyInput.formFieldControl = true;

/** A whole number (places, people waiting) in a compact box. */
export function CountInput(props: NumberInputProps) {
  return (
    <AmountInput
      {...props}
      shellClassName={styles.countShell}
      inputMode="numeric"
      toValue={toWholeDigits}
    />
  );
}
CountInput.formFieldControl = true;

interface SkinScalarControlProps {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}

/** The stored string at a control's path ("" while empty). A number from
 *  older data is read as its decimal text. */
function readStored(editor: SubprofileSkinBlocksEditor, path: string): string {
  const stored = editor.getValue(path);
  if (typeof stored === "string") return stored;
  if (typeof stored === "number" && Number.isFinite(stored)) {
    return String(stored);
  }
  return "";
}

/** FormField wrapper shared by the money and count controls. With the label
 *  hidden (the group heading already says it), the input carries it as its
 *  accessible name. */
function SkinDigitsControl({
  control,
  editor,
  isLabelHidden = false,
  Input,
}: SkinScalarControlProps & { Input: typeof MoneyInput }) {
  const { t } = useTranslation();
  const label = t(control.labelKey);

  return (
    <FormField
      label={isLabelHidden ? undefined : label}
      helper={control.helperKey ? t(control.helperKey) : undefined}
    >
      <Input
        value={readStored(editor, control.path)}
        onChange={(next) => editor.setValue(control.path, next)}
        placeholder={
          control.placeholderKey ? t(control.placeholderKey) : undefined
        }
        aria-label={isLabelHidden ? label : undefined}
      />
    </FormField>
  );
}

/** A `money` control: a euro amount stored as a digit string with at most
 *  one decimal separator. */
export function SkinMoneyControl(props: SkinScalarControlProps) {
  return <SkinDigitsControl {...props} Input={MoneyInput} />;
}

/** A `count` control: a whole number stored as a digit string. */
export function SkinCountControl(props: SkinScalarControlProps) {
  return <SkinDigitsControl {...props} Input={CountInput} />;
}
