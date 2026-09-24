import { useId, useState, type ReactNode } from "react";
import { FiCheck, FiLock } from "react-icons/fi";
import { useSkinFieldSlot } from "./skinFieldSlotContext";
import { refinedSurfaceClassName } from "./refinedFieldSurface";
import styles from "./SkinRefinedField.module.css";

/**
 * The chapter editor's field frame: sentence-case label, the hint under it
 * and above the control, a jade check when the field fills during this
 * visit.
 *
 * API
 * - `label`: the field's name. `isLabelHidden` keeps it for assistive tech
 *   only (the card heading already says it), and drops the fill check.
 * - `labelMode`: "label" (default) renders `<label htmlFor={controlId}>`;
 *   "span" renders a `<span id={labelId}>` for a group or custom widget that
 *   names itself with `aria-labelledby={labelId}`.
 * - `helper`: phrasing content under the label. `helperTone: "private"`
 *   leads it with a lock.
 * - `labelAside`: right end of the label row (a length guide, a count).
 * - `footer`: under the control (a warning, a length guide). Not described
 *   by default; add `footerId` to `aria-describedby` when it should be.
 * - `isNarrow`: the surface is sized to a short value.
 * - `id` / `className`: on the wrapper (`id` is the jump-to-field anchor).
 * - `children(field)`: renders the control. `field` carries `controlId`,
 *   `labelId`, `helperId` and `footerId` (each `undefined` when absent),
 *   `describedBy` (the helper id, or `undefined`), and `inputClassName` /
 *   `textareaClassName`: the surface for this slot, with the empty styling
 *   already applied when the chapter slot reports no value.
 *
 * The fill state comes from `useSkinFieldSlot()`: the check follows
 * `isFilled` (a value the page will show), the surface follows `hasValue`.
 * Outside a slot the fill is unknown: no check, no empty styling.
 */
export interface SkinRefinedFieldRenderProps {
  controlId: string;
  labelId: string;
  helperId: string | undefined;
  footerId: string | undefined;
  describedBy: string | undefined;
  inputClassName: string;
  textareaClassName: string;
}

export interface SkinRefinedFieldProps {
  label: ReactNode;
  isLabelHidden?: boolean;
  labelMode?: "label" | "span";
  helper?: ReactNode;
  helperTone?: "private";
  labelAside?: ReactNode;
  footer?: ReactNode;
  isNarrow?: boolean;
  id?: string;
  className?: string;
  children: (field: SkinRefinedFieldRenderProps) => ReactNode;
}

/**
 * The check beside a filled field's label, for the moment a field fills in
 * front of the owner. It fades in when the field turns filled after mount
 * and stays for the rest of the visit; emptied and refilled, it arrives
 * again. A field that loads filled shows none, since the card count already
 * says so. The previous fill is tracked in state and adjusted during render
 * (the React "derived state" idiom), so no effect runs.
 */
function FillCheck({ isFilled }: { isFilled: boolean }) {
  const [previousIsFilled, setPreviousIsFilled] = useState(isFilled);
  const [isArriving, setIsArriving] = useState(false);
  if (previousIsFilled !== isFilled) {
    setPreviousIsFilled(isFilled);
    setIsArriving(isFilled);
  }
  if (!isFilled || !isArriving) return null;
  return <FiCheck aria-hidden focusable="false" className={styles.fillCheck} />;
}

export function SkinRefinedField({
  label,
  isLabelHidden = false,
  labelMode = "label",
  helper,
  helperTone,
  labelAside,
  footer,
  isNarrow = false,
  id,
  className,
  children,
}: SkinRefinedFieldProps) {
  const baseId = useId();
  const slot = useSkinFieldSlot();
  const controlId = `${baseId}-control`;
  const labelId = `${baseId}-label`;
  const hasHelper = helper !== undefined && helper !== null && helper !== "";
  const hasFooter = footer !== undefined && footer !== null && footer !== "";
  const helperId = hasHelper ? `${baseId}-helper` : undefined;
  const footerId = hasFooter ? `${baseId}-footer` : undefined;
  const isEmpty = slot ? !slot.hasValue : false;
  const isPrivate = helperTone === "private";

  const labelClassName = isLabelHidden ? "visuallyHidden" : styles.label;
  const labelNode =
    labelMode === "label" ? (
      <label id={labelId} htmlFor={controlId} className={labelClassName}>
        {label}
      </label>
    ) : (
      <span id={labelId} className={labelClassName}>
        {label}
      </span>
    );
  const hasLabelRow = !isLabelHidden || Boolean(labelAside);

  return (
    <div
      id={id}
      className={[styles.frame, className].filter(Boolean).join(" ")}
    >
      {hasLabelRow ? (
        <div className={styles.labelRow}>
          <span className={styles.labelLead}>
            {labelNode}
            {!isLabelHidden && slot && <FillCheck isFilled={slot.isFilled} />}
          </span>
          {labelAside && (
            <span className={styles.labelAside}>{labelAside}</span>
          )}
        </div>
      ) : (
        labelNode
      )}
      {hasHelper && (
        <p
          id={helperId}
          className={[
            styles.helper,
            isPrivate ? styles.helperPrivate : null,
            hasLabelRow ? null : styles.flush,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isPrivate && (
            <FiLock
              aria-hidden
              focusable="false"
              className={styles.helperIcon}
            />
          )}
          {isPrivate ? <span>{helper}</span> : helper}
        </p>
      )}
      <div
        className={[
          styles.control,
          hasLabelRow || hasHelper ? null : styles.flush,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children({
          controlId,
          labelId,
          helperId,
          footerId,
          describedBy: helperId,
          inputClassName: refinedSurfaceClassName({ isNarrow, isEmpty }),
          textareaClassName: refinedSurfaceClassName({
            isMultiline: true,
            isNarrow,
            isEmpty,
          }),
        })}
      </div>
      {hasFooter && (
        <div id={footerId} className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
}
