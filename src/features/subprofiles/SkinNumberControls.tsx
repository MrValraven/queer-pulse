import { useId, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import {
  nextAmount,
  readStored,
  toDisplayAmount,
  toWholeDigits,
} from "./skinDigits";
import { SkinRefinedField } from "./SkinRefinedField";
import { useRefinedPlaceholder } from "./refinedFieldSurface";
import styles from "./SkinScalarControls.module.css";
import refinedStyles from "./SkinRefinedScalar.module.css";

/** Props shared by the euro and count inputs. */
interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  "aria-label"?: string;
  /** On the shell that holds the input and the suffix. */
  className?: string;
  /** On the input: the field surface it draws on. */
  inputClassName?: string;
  "aria-describedby"?: string;
}

/** A label that already names the currency ("Standard fee (euros)"). */
const NAMES_CURRENCY = /euro|€/i;

/** The shared input: a fixed-width shell with an optional suffix drawn
 *  inside its right edge. `toValue` turns what was typed into the value to
 *  store, or null to keep the current one. */
function AmountInput({
  value,
  onChange,
  className,
  inputClassName,
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
        className={inputClassName}
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

interface SkinScalarControlProps {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}

/**
 * The frame shared by the money and count controls: the label and its hint
 * above, the digits on the field surface. The shell keeps its fixed width
 * and the € suffix, so a row of two ("40 € to 65 €") still sizes itself from
 * the boxes and lines their bottoms up. With the label hidden, the frame's
 * visually hidden label names the input, and the money input describes its
 * currency as it does beside a visible label.
 */
function SkinDigitsControl({
  control,
  editor,
  isLabelHidden = false,
  Input,
}: SkinScalarControlProps & { Input: typeof MoneyInput }) {
  const { t } = useTranslation();
  const placeholder = useRefinedPlaceholder(control.placeholderKey);
  const isMoney = control.kind === "money";

  return (
    <SkinRefinedField
      label={t(control.labelKey)}
      isLabelHidden={isLabelHidden}
      helper={control.helperKey ? t(control.helperKey) : undefined}
      helperTone={control.helperTone}
    >
      {(field) => (
        <Input
          id={field.controlId}
          aria-describedby={field.describedBy}
          value={readStored(editor, control.path)}
          onChange={(next) => editor.setValue(control.path, next)}
          placeholder={placeholder}
          className={refinedStyles.amountShell}
          inputClassName={[
            field.inputClassName,
            refinedStyles.amountInput,
            isMoney ? refinedStyles.moneyInput : null,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}
    </SkinRefinedField>
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
