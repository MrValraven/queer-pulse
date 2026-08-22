import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./adminInlineMarkers.module.css";

/**
 * The "A goes to B" arrow between two pieces of text on one line (invite rows,
 * commission rows, a slip's from/to pair, a trust path).
 *
 * Decorative on purpose: the copy around it already reads as a sentence
 * ("From Ana", "sent to ana@example.com"), so the arrow is `aria-hidden` and a
 * screen reader never announces "rightwards arrow". It replaces the literal
 * U+2192 character these rows used to inline, which renders inconsistently
 * across fonts and weights (FE-ADM-23).
 */
export function AdminArrowSeparator() {
  return (
    <span className={styles.arrow} aria-hidden>
      <FiArrowRight />
    </span>
  );
}

/**
 * The "this field has no value yet" marker, in muted ink.
 *
 * Prints real words instead of the bare em dash these surfaces used to render,
 * which carried no meaning for a screen reader and is banned from product copy
 * anyway (FE-ADM-23).
 */
export function AdminNotSet() {
  const { t } = useTranslation();
  return <span className={styles.notSet}>{t("admin:common.notSet")}</span>;
}
