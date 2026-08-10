import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import styles from "./NewSideModal.module.css";

/** Top-level start method: seed from a kind template, start blank, or copy one
 *  of the owner's existing personas. "Copy" is disabled when the owner has no
 *  personas yet (nothing to copy). */
export type StartMethod = "template" | "blank" | "copy";

const METHODS: StartMethod[] = ["template", "blank", "copy"];

/** The design's `.seg` segmented control: three plain toggle buttons in a
 *  pill track, `aria-pressed` marking the active one. A single-select toggle
 *  group of this size doesn't need full radiogroup semantics — the pressed
 *  state alone is enough for assistive tech to track which method is active. */
export function StartMethodPicker({
  method,
  onChange,
  copyDisabled,
  t,
}: {
  method: StartMethod;
  onChange: (method: StartMethod) => void;
  copyDisabled: boolean;
  t: TranslationApi["t"];
}) {
  const labelKeys: Record<StartMethod, string> = {
    template: "subprofiles:start.template",
    blank: "subprofiles:start.blank",
    copy: "subprofiles:start.copy",
  };

  return (
    <div>
      <span id="new-side-start-label" className={styles.stepLabel}>
        {t("subprofiles:start.label")}
      </span>
      <div
        className={styles.seg}
        role="group"
        aria-labelledby="new-side-start-label"
      >
        {METHODS.map((candidate) => {
          const disabled = candidate === "copy" && copyDisabled;
          return (
            <button
              key={candidate}
              type="button"
              className={styles.segBtn}
              aria-pressed={method === candidate}
              disabled={disabled}
              onClick={() => onChange(candidate)}
            >
              {t(labelKeys[candidate])}
            </button>
          );
        })}
      </div>
      <p className={styles.craftSummary}>
        {copyDisabled
          ? t("subprofiles:start.copyDisabledHelper")
          : t("subprofiles:start.helper")}
      </p>
    </div>
  );
}
