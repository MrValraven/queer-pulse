import { useId, useState, type Ref } from "react";
import type { VjRenderMode } from "../../../../../shared/contracts/vj";
import { Collapse } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import styles from "./VjScreensSheet.module.css";

const PENDING_KEY = {
  simple: "vj:screensSheet.renderMode.pendingSimple",
  effects: "vj:screensSheet.renderMode.pendingEffects",
} as const satisfies Record<VjRenderMode, string>;

export interface VjRenderModeSwitchProps {
  isOn: boolean;
  isPending: boolean;
  pendingMode: VjRenderMode | null;
  isHeld: boolean;
  /** The line that says why the switch is held (no screen open). */
  heldReasonId?: string;
  onToggle: () => void;
  /** The switch button; the sheet moves focus here when a row's warning sends simple. */
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Simple renderer on every screen: one switch for the whole show, with a
 * line under it saying which way every screen is moving while the screens
 * catch up. Held (no screen connected, the remote blocked) or pending, it
 * stays focusable and a tap sends nothing; held dims the whole switch,
 * pending dims its track only.
 */
export function VjRenderModeSwitch({
  isOn,
  isPending,
  pendingMode,
  isHeld,
  heldReasonId,
  onToggle,
  ref,
}: VjRenderModeSwitchProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  // The status line keeps its last words while it folds away.
  const [shownPendingMode, setShownPendingMode] = useState(pendingMode);
  if (pendingMode !== null && pendingMode !== shownPendingMode) {
    setShownPendingMode(pendingMode);
  }
  const isTapHeld = isHeld || isPending;
  // Pending reads apart from held: only the track dims, so the label and
  // hint stay at full strength while the screens catch up.
  const isPendingShown = isPending && !isHeld;
  return (
    <div className={styles.renderMode}>
      <button
        ref={ref}
        type="button"
        role="switch"
        className={styles.renderModeSwitch}
        aria-checked={isOn}
        aria-disabled={isTapHeld}
        data-pending={isPendingShown}
        aria-labelledby={labelId}
        aria-describedby={`${hintId} ${heldReasonId ?? ""}`.trim()}
        data-vj-render-mode-switch=""
        onClick={() => {
          if (!isTapHeld) onToggle();
        }}
      >
        <span className={styles.renderModeText}>
          <span id={labelId} className={styles.renderModeLabel}>
            {t("vj:screensSheet.renderMode.label")}
          </span>
          <span id={hintId} className={styles.renderModeHint}>
            {t("vj:screensSheet.renderMode.hint")}
          </span>
        </span>
        <span className={styles.renderModeTrack} aria-hidden>
          <span className={styles.renderModeKnob} />
        </span>
      </button>
      <div role="status" className={styles.renderModeStatusRegion}>
        <Collapse isOpen={isPending}>
          <p className={styles.renderModeStatus}>
            {shownPendingMode === null ? "" : t(PENDING_KEY[shownPendingMode])}
          </p>
        </Collapse>
      </div>
    </div>
  );
}
