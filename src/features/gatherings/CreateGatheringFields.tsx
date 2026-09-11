import {
  Children,
  useId,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiCheck, FiInfo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import styles from "./CreateGatheringFields.module.css";

/**
 * The field primitives every Create Gathering v2 chapter body builds with.
 *
 * One file so the five chapters read as one form: the same label row, the
 * same hint line, the same bordered switch rows and pill chips. Chapter bodies
 * own their own layout and any control beyond these primitives; the
 * repo components (DatePicker, Select, SegmentedControl, RadioCardGroup,
 * VenuePicker) stay the controls of record and go inside a `Field`.
 */

export interface FieldProps {
  /** The visible label text. */
  label: ReactNode;
  /**
   * The id of the ONE native control this label names. Renders a real
   * `<label htmlFor>`. Also names the hint and error lines: they get the ids
   * `${htmlFor}-hint` and `${htmlFor}-error`, which the control should list
   * in its own `aria-describedby`.
   */
  htmlFor?: string;
  /**
   * An id for the label element itself, for a field with no single native
   * control (a chip group, a radiogroup, a switch list): hand it to that
   * group's `aria-labelledby`. With no `htmlFor`, it also seeds the hint and
   * error ids (`${labelId}-hint`, `${labelId}-error`).
   */
  labelId?: string;
  /** Adds the muted "optional" word after the label. */
  isOptional?: boolean;
  /** A counter shown after the label, e.g. `"12/80"`. Visual only. A node
   *  lets a field tint its own counter (the description past its budget). */
  count?: ReactNode;
  /** The muted line under the control. */
  hint?: ReactNode;
  /** The coral line under the control, with an alert icon. */
  error?: ReactNode;
  /**
   * Put on the wrapper: a `GATE_ANCHOR` value, so a readiness row can scroll
   * to, focus and flash the whole field (label, control and hint together).
   */
  anchorId?: string;
  className?: string;
  children: ReactNode;
}

/** A labelled field: label row, the control, then hint and error lines. */
export function Field({
  label,
  htmlFor,
  labelId,
  isOptional = false,
  count,
  hint,
  error,
  anchorId,
  className,
  children,
}: FieldProps) {
  const { t } = useTranslation();
  const describedIdBase = htmlFor ?? labelId;
  const labelContent = (
    <>
      {label}
      {isOptional && (
        <span className={styles.optional}>
          {t("gatherings:create.v2.field.optional")}
        </span>
      )}
      {count && (
        <span className={styles.count} aria-hidden>
          {count}
        </span>
      )}
    </>
  );
  return (
    <div id={anchorId} className={cx(styles.field, className)}>
      {htmlFor ? (
        <label id={labelId} className={styles.label} htmlFor={htmlFor}>
          {labelContent}
        </label>
      ) : (
        <div id={labelId} className={styles.label}>
          {labelContent}
        </div>
      )}
      {children}
      {hint && (
        <p
          id={describedIdBase ? `${describedIdBase}-hint` : undefined}
          className={styles.hint}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={describedIdBase ? `${describedIdBase}-error` : undefined}
          className={cx(styles.hint, styles.error)}
        >
          <FiAlertCircle aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

/** Two or three fields side by side. Two columns fold to one at 560px;
 *  three fold to two at 900px and to one at 560px. */
export function FieldRow({
  columns = 2,
  children,
}: {
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className={columns === 3 ? styles.row3 : styles.row2}>{children}</div>
  );
}

/** The design's `.in` text input. Every native input prop passes through;
 *  `icon` draws a leading icon inside the field (a link, a search glass). */
export function TextInput({
  className,
  icon: Icon,
  ...inputProps
}: ComponentPropsWithRef<"input"> & { icon?: IconType }) {
  const input = (
    <input className={cx(styles.input, className)} {...inputProps} />
  );
  if (!Icon) return input;
  return (
    <div className={styles.inputWrap}>
      <Icon className={styles.inputIcon} aria-hidden />
      {input}
    </div>
  );
}

/** The design's `.in` textarea. Every native textarea prop passes through. */
export function TextArea({
  className,
  ...textareaProps
}: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea
      className={cx(styles.input, styles.textarea, className)}
      {...textareaProps}
    />
  );
}

export type SwitchRowVariant = "card" | "compact" | "listItem";

const SWITCH_ROW_VARIANT_CLASS: Record<SwitchRowVariant, string | undefined> = {
  card: undefined,
  compact: styles.switchRowCompact,
  listItem: styles.switchRowListItem,
};

const SWITCH_GROUP_VARIANT_CLASS: Record<SwitchRowVariant, string | undefined> =
  {
    card: styles.switchGroup,
    compact: styles.switchGroupCompact,
    listItem: styles.switchListItem,
  };

interface SwitchRowBaseProps {
  title: ReactNode;
  description?: ReactNode;
  /**
   * `card` (default): a standalone bordered row ("This gathering repeats").
   * `compact`: a smaller standalone row ("Waitlist when full").
   * `listItem`: a row inside a `SwitchRowList` ("Ask on RSVP").
   */
  variant?: SwitchRowVariant;
  /** Put on the switch button itself, so an anchor jump lands focus on it. */
  id?: string;
  /** Rendered in a bordered panel attached under the row while it is on
   *  (the repeat rule under "This gathering repeats"). */
  children?: ReactNode;
}

export type SwitchRowProps = SwitchRowBaseProps &
  (
    | {
        isLocked?: false;
        isChecked: boolean;
        onChange: (isChecked: boolean) => void;
      }
    | {
        /**
         * Always on and takes no press (ruling R8: every RSVP asks about
         * access needs). It reads as on (`aria-checked`) and unavailable
         * (`aria-disabled`), and stays focusable, so a keyboard or screen
         * reader user meets it in the list and hears why it is on.
         */
        isLocked: true;
        isChecked?: true;
        onChange?: undefined;
      }
  );

/** A whole row that is one `role="switch"` button: title, description and the
 *  jade track. Enter and Space toggle it, as on any button. */
export function SwitchRow(props: SwitchRowProps) {
  const { title, description, variant = "card", id, children } = props;
  const isLocked = props.isLocked === true;
  const isChecked = isLocked || props.isChecked === true;
  const textId = useId();
  // `Children.toArray` drops null, undefined and booleans, so a caller's
  // `{condition && <Fields />}` that evaluates to false draws no empty panel.
  const hasPanel = isChecked && Children.toArray(children).length > 0;
  return (
    <div className={SWITCH_GROUP_VARIANT_CLASS[variant]}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-disabled={isLocked || undefined}
        aria-labelledby={`${textId}-title`}
        aria-describedby={description ? `${textId}-description` : undefined}
        className={cx(
          styles.switchRow,
          SWITCH_ROW_VARIANT_CLASS[variant],
          hasPanel && styles.switchRowAttached,
          isLocked && styles.switchRowLocked,
        )}
        onClick={() => {
          if (props.isLocked !== true) props.onChange(!isChecked);
        }}
      >
        <span className={styles.switchText}>
          <span id={`${textId}-title`} className={styles.switchTitle}>
            {title}
          </span>
          {description && (
            <span
              id={`${textId}-description`}
              className={styles.switchDescription}
            >
              {description}
            </span>
          )}
        </span>
        <span className={styles.switchTrack} aria-hidden />
      </button>
      {hasPanel && <div className={styles.switchPanel}>{children}</div>}
    </div>
  );
}

/** The bordered list that `variant="listItem"` switch rows sit in. Name it
 *  with `labelledBy` (a `Field`'s `labelId`) or `ariaLabel`. */
export function SwitchRowList({
  labelledBy,
  ariaLabel,
  children,
}: {
  labelledBy?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      className={styles.switchList}
    >
      {children}
    </div>
  );
}

export interface ChipToggleOption<Key extends string> {
  key: Key;
  /** Already translated. */
  label: string;
  /** Drawn before the label. A pressed chip with no icon shows a check. */
  icon?: IconType;
}

export interface ChipToggleGroupProps<Key extends string> {
  options: readonly ChipToggleOption<Key>[];
  selectedKeys: readonly Key[];
  onToggle: (key: Key) => void;
  /** Once this many are pressed, the rest read as unavailable
   *  (`aria-disabled`) until one is released. */
  maxSelected?: number;
  /** Options left out entirely (ruling R6's `form.hiddenThemeKeys`). */
  hiddenKeys?: readonly Key[];
  labelledBy?: string;
  ariaLabel?: string;
  /** The id of a line that describes the group (a `Field` hint), so a limit
   *  such as "Pick up to three" is announced with it. */
  describedBy?: string;
}

/** Pill chips that each toggle on and off (`aria-pressed`), in a named group. */
export function ChipToggleGroup<Key extends string>({
  options,
  selectedKeys,
  onToggle,
  maxSelected,
  hiddenKeys = [],
  labelledBy,
  ariaLabel,
  describedBy,
}: ChipToggleGroupProps<Key>) {
  const isAtMax =
    maxSelected !== undefined && selectedKeys.length >= maxSelected;
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      className={styles.chips}
    >
      {options
        .filter((option) => !hiddenKeys.includes(option.key))
        .map((option) => {
          const isPressed = selectedKeys.includes(option.key);
          const isUnavailable = isAtMax && !isPressed;
          const OptionIcon = option.icon ?? (isPressed ? FiCheck : undefined);
          return (
            <button
              key={option.key}
              type="button"
              className={styles.chip}
              aria-pressed={isPressed}
              aria-disabled={isUnavailable || undefined}
              onClick={() => {
                if (!isUnavailable) onToggle(option.key);
              }}
            >
              {OptionIcon && <OptionIcon aria-hidden />}
              {option.label}
            </button>
          );
        })}
    </div>
  );
}

export type InlineNoteTone = "neutral" | "warning" | "festive";

const NOTE_TONE_CLASS: Record<InlineNoteTone, string | undefined> = {
  neutral: undefined,
  warning: styles.noteWarning,
  festive: styles.noteFestive,
};

/** A tinted one-line note under a field: neutral (grey wash), warning
 *  (coral wash) or festive (jade wash). */
export function InlineNote({
  tone = "neutral",
  icon: Icon = FiInfo,
  children,
}: {
  tone?: InlineNoteTone;
  icon?: IconType;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.note, NOTE_TONE_CLASS[tone])}>
      <Icon className={styles.noteIcon} aria-hidden />
      <span>{children}</span>
    </div>
  );
}

/** A stack of `InlineNote`s with the design's spacing. Renders nothing when
 *  it has no children. */
export function InlineNoteList({ children }: { children: ReactNode }) {
  return <div className={styles.notes}>{children}</div>;
}
