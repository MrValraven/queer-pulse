import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SkinRefinedField.module.css";

/**
 * The chapter fields' input surface, for a control that renders its own
 * input outside `SkinRefinedField`'s render prop. `refinedSurfaceClassName`
 * composes `input` or `textarea` with the modifiers.
 *
 * - `input`: a single-line `<input>` (48px tall).
 * - `textarea`: a `<textarea>`, including a one-row wrapping field.
 * - `narrow`: sized to a short value, `min(14rem, 100%)`, tabular figures.
 * - `empty`: recessed cream while unfocused; add it only when the slot
 *   reports the field empty.
 */
const refinedSurfaceClassNames = {
  input: `${styles.surface} ${styles.input}`,
  textarea: `${styles.surface} ${styles.textarea}`,
  narrow: styles.narrow,
  empty: styles.empty,
} as const;

export interface RefinedSurfaceOptions {
  /** A `<textarea>` in place of an `<input>`. */
  isMultiline?: boolean;
  /** Sized to a short value (`control.size === "narrow"`). */
  isNarrow?: boolean;
}

/** The surface classes for an input, with the empty styling only when
 *  `isEmpty` is true. */
export function refinedSurfaceClassName({
  isMultiline = false,
  isNarrow = false,
  isEmpty = false,
}: RefinedSurfaceOptions & { isEmpty?: boolean }): string {
  return [
    isMultiline
      ? refinedSurfaceClassNames.textarea
      : refinedSurfaceClassNames.input,
    isNarrow ? refinedSurfaceClassNames.narrow : null,
    isEmpty ? refinedSurfaceClassNames.empty : null,
  ]
    .filter(Boolean)
    .join(" ");
}

/** An example placeholder prefixed "e.g. " so an empty field never reads as
 *  a saved value. Takes the caller's `t` for an example built in a loop. */
export function refinedExample(translate: TFunction, exampleText: string) {
  return translate("subprofiles:skinControl.refined.example", {
    example: exampleText,
  });
}

/** `refinedExample` for one placeholder key; `undefined` without a key. */
export function useRefinedPlaceholder(
  placeholderKey: string | undefined,
): string | undefined {
  const { t } = useTranslation();
  return placeholderKey ? refinedExample(t, t(placeholderKey)) : undefined;
}
