/**
 * Segmented spinbutton date input — the typeable half of the shared
 * DatePicker (`Calendar` is the browse half). Composes one `DateSegment` per
 * part (day/month/year and, for `datetime`/`time`, hour/minute[/meridiem]),
 * in locale-correct order, and reassembles them into the mode's ISO string.
 * See spec §6 for the a11y/keyboard contract this implements.
 */

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { DateSegment } from "./DateSegment";
import {
  buildSegmentOrder,
  isTwelveHourLocale,
  segmentLabel,
  SEGMENT_PLACEHOLDER,
  separatorAfter,
  type SegmentType,
} from "./dateSegments";
import {
  isoFromParts,
  isPartsUnavailable,
  parseFieldBounds,
  partsFromValue,
  type WorkingParts,
} from "./dateFieldParts";
import {
  clampPartsToRange,
  clearSegment,
  enterDigit,
  formatSegmentText,
  segmentRange,
  stepSegment,
} from "./dateFieldStepping";
import styles from "./DateField.module.css";

export type FieldMode = "date" | "datetime" | "time" | "month";

export interface DateFieldProps {
  mode: FieldMode;
  value: string | null;
  onChange: (value: string | null) => void;
  locale?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  size?: "md" | "sm";
  /** Marks the field invalid once its COMPLETE value matches this predicate.
   *  Does not block typing (matches React Aria's own scope). */
  isDateUnavailable?: (iso: string) => boolean;
}

/** Numeric value shown to `DateSegment`/exposed as `aria-valuenow`. */
function segmentValue(type: SegmentType, parts: WorkingParts): number | null {
  if (type === "meridiem")
    return parts.meridiem === null ? null : parts.meridiem === "PM" ? 1 : 0;
  return parts[type];
}

export function DateField({
  mode,
  value,
  onChange,
  locale,
  min,
  max,
  disabled = false,
  invalid = false,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  size = "md",
  isDateUnavailable,
}: DateFieldProps) {
  const { language } = useTranslation();
  const activeLocale = locale ?? language;
  const is12Hour = useMemo(
    () => isTwelveHourLocale(activeLocale),
    [activeLocale],
  );
  const segmentTypes = useMemo(
    () => buildSegmentOrder(mode, activeLocale, is12Hour),
    [mode, activeLocale, is12Hour],
  );

  const seedKey = `${mode}|${value ?? ""}|${is12Hour}`;
  const [lastSeedKey, setLastSeedKey] = useState(seedKey);
  const [parts, setParts] = useState<WorkingParts>(() =>
    partsFromValue(mode, value, is12Hour),
  );
  // Tags the digit buffer with the `seedKey` it was typed against, so a
  // reseed below reads a stale-tagged buffer as empty (not a ref write mid-render).
  const bufferRef = useRef<{
    seedKey: string;
    type: SegmentType | null;
    length: number;
  }>({
    seedKey,
    type: null,
    length: 0,
  });
  const elementsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  // Reflect an incoming value/mode/is12Hour change into parts during render.
  if (seedKey !== lastSeedKey) {
    setLastSeedKey(seedKey);
    setParts(partsFromValue(mode, value, is12Hour));
  }

  const bounds = useMemo(
    () => parseFieldBounds(mode, min, max),
    [mode, min, max],
  );
  // Unify the visual + ARIA invalid state (mirrors Select.tsx): `invalid`,
  // `aria-invalid`, or an `isDateUnavailable`-rejected value all land here.
  const unavailable = isPartsUnavailable(
    mode,
    parts,
    is12Hour,
    isDateUnavailable,
  );
  const showInvalid = invalid || ariaInvalid === true || unavailable;

  const commit = (nextParts: WorkingParts) => {
    setParts(nextParts);
    onChange(isoFromParts(mode, nextParts, is12Hour));
  };

  const focusSegment = (index: number) =>
    elementsRef.current.get(index)?.focus();

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    type: SegmentType,
    index: number,
  ) => {
    if (disabled) return;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      bufferRef.current = { seedKey, type: null, length: 0 };
      const stepped = stepSegment(
        type,
        parts,
        event.key === "ArrowUp" ? 1 : -1,
        is12Hour,
      );
      commit(clampPartsToRange(mode, stepped, bounds, is12Hour));
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = event.key === "ArrowLeft" ? index - 1 : index + 1;
      if (nextIndex >= 0 && nextIndex < segmentTypes.length)
        focusSegment(nextIndex);
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      bufferRef.current = { seedKey, type: null, length: 0 };
      commit(clearSegment(type, parts));
      return;
    }
    if (type === "meridiem" && /^[ap]$/i.test(event.key)) {
      event.preventDefault();
      commit({
        ...parts,
        meridiem: event.key.toLowerCase() === "a" ? "AM" : "PM",
      });
      return;
    }
    if (type !== "meridiem" && /^[0-9]$/.test(event.key)) {
      event.preventDefault();
      const bufferLength =
        bufferRef.current.seedKey === seedKey && bufferRef.current.type === type
          ? bufferRef.current.length
          : 0;
      const entry = enterDigit(
        type,
        parts,
        bufferLength,
        Number(event.key),
        is12Hour,
      );
      bufferRef.current = { seedKey, type, length: entry.bufferLength };
      commit(clampPartsToRange(mode, entry.parts, bounds, is12Hour));
      if (entry.advance && index < segmentTypes.length - 1)
        focusSegment(index + 1);
    }
  };

  return (
    <div
      id={id}
      className={[
        styles.field,
        size === "sm" && styles.sm,
        showInvalid && styles.invalid,
        disabled && styles.disabled,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {segmentTypes.map((type, index) => {
        const { min: segMin, max: segMax } = segmentRange(
          type,
          parts,
          is12Hour,
        );
        const separator = separatorAfter(type, segmentTypes[index + 1]);
        return (
          <span key={type} className={styles.segmentGroup}>
            <DateSegment
              ref={(element) => {
                if (element) elementsRef.current.set(index, element);
                else elementsRef.current.delete(index);
              }}
              label={segmentLabel(activeLocale, type)}
              text={formatSegmentText(type, parts)}
              value={segmentValue(type, parts)}
              min={segMin}
              max={segMax}
              placeholder={SEGMENT_PLACEHOLDER[type]}
              disabled={disabled}
              ariaDescribedBy={ariaDescribedBy}
              invalid={showInvalid}
              required={ariaRequired}
              onKeyDown={(event) => handleKeyDown(event, type, index)}
            />
            {separator && (
              <span className={styles.separator} aria-hidden>
                {separator}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
