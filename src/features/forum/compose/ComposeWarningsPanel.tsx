import { useId, useMemo } from "react";
import { ChipSelect } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CONTENT_WARNINGS } from "./composeWarnings.data";
import styles from "./ComposeWarningsPanel.module.css";

// ── Content warnings ────────────────────────────────────────────────────────
// Eight things a member can flag on the way in. Multi-select, because a post
// about being thrown out of home is often two of them at once.
//
// The chips go through the shared `ChipSelect` rather than a hand-rolled row:
// it already carries the `role="group"`, the `aria-pressed` per chip and the
// tick on a selected one, and every other multi-select chip row in the app is
// that primitive. What is added here is only the panel around it and the line
// that says what flagging actually does to the thread card.

export interface ComposeWarningsPanelProps {
  /**
   * `id` of this panel. The "Content warning" pill points `aria-controls` at
   * it, so the two must agree.
   */
  id: string;
  /** Ids from `CONTENT_WARNINGS` currently flagged on the draft. */
  selectedWarnings: readonly string[];
  /** Turns one warning on or off. */
  onToggleWarning: (warningId: string) => void;
}

export function ComposeWarningsPanel({
  id,
  selectedWarnings,
  onToggleWarning,
}: ComposeWarningsPanelProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const selected = useMemo(() => new Set(selectedWarnings), [selectedWarnings]);
  const options = useMemo(
    () =>
      CONTENT_WARNINGS.map((warning) => ({
        value: warning.id,
        label: t(warning.labelKey),
      })),
    [t],
  );

  return (
    <section id={id} className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h3 id={headingId} className={styles.title}>
          {t("forum:composePage.block.contentWarning")}
        </h3>
        <p className={styles.hint}>{t("forum:composePage.warning.hint")}</p>
      </div>
      <ChipSelect
        options={options}
        selected={selected}
        onToggle={onToggleWarning}
        labelledBy={headingId}
      />
    </section>
  );
}
