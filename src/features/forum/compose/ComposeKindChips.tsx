import { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COMPOSE_KINDS,
  COMPOSE_KIND_FALLBACK,
  composeKindById,
} from "./composeKinds.data";
import type { PostKind } from "./composeThread.types";
import { ComposeKindPill } from "./ComposeKindPill";
import { ComposeSwapText } from "./ComposeSwapText";
import { useKindChipLayout } from "./useKindChipLayout";
import styles from "./ComposeKindChips.module.css";

// ── "What kind of post is this?" ────────────────────────────────────────────
// The first thing the page asks, because the answer changes the title
// placeholder, the body placeholder, the outline pill and (for two of the
// four) the category. Pressing the chip that is already on clears the kind
// again: a member who picked Guide by mistake should be able to take it back
// without guessing which other chip is the "none" one.
//
// The plum fill is one shared pill that glides from chip to chip, so a change
// of kind reads as the pill moving over. Once shown it stays mounted: clearing
// the kind fades it out where it stands, and the next pick slides it from
// there. The pill carries its own cream copy of the labels (ComposeKindPill),
// so the real labels stay dark and every label reads while it passes.

/** Where the pill waits, invisible, before any kind has been picked: the
 *  first chip, so the first pick slides it in from the start of the row. */
const PILL_RESTING_KIND: PostKind = "question";

export interface ComposeKindChipsProps {
  /** The chosen kind, or null before one is picked. */
  kind: PostKind | null;
  /** Called with the new kind, or with null when the active chip is pressed
   *  again. Wire straight to `setters.setKind`. */
  onKindChange: (kind: PostKind | null) => void;
}

export function ComposeKindChips({
  kind,
  onKindChange,
}: ComposeKindChipsProps) {
  const { t } = useTranslation();
  const { rowRef, registerChip, layout } = useKindChipLayout();
  // Which chip holds the pill. It follows the kind and stays put when the
  // kind is cleared, so the pill has somewhere to fade out and to slide from.
  const [indicatorKind, setIndicatorKind] = useState<PostKind>(
    kind ?? PILL_RESTING_KIND,
  );
  if (kind !== null && kind !== indicatorKind) setIndicatorKind(kind);
  const chosen = composeKindById(kind);
  const tipKey = chosen?.tipKey ?? COMPOSE_KIND_FALLBACK.tipKey;

  return (
    <div
      ref={rowRef}
      className={styles.kinds}
      role="group"
      aria-label={t("forum:composePage.kind.groupLabel")}
    >
      {COMPOSE_KINDS.map((option) => {
        const Icon = option.icon;
        const isOn = option.id === kind;
        return (
          <button
            key={option.id}
            ref={registerChip(option.id)}
            type="button"
            aria-pressed={isOn}
            className={[styles.kind, isOn && styles.kindOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onKindChange(isOn ? null : option.id)}
          >
            <span className={styles.kindFace}>
              <Icon className={styles.kindIcon} aria-hidden />
              {t(option.nameKey)}
            </span>
          </button>
        );
      })}
      {layout && (
        <ComposeKindPill
          indicatorKind={indicatorKind}
          isShown={kind !== null}
          layout={layout}
        />
      )}
      {/* The tip is a live readout: it changes under the chips as the choice
          changes, so it is announced rather than silently swapped. */}
      <p className={styles.kindTip} aria-live="polite">
        <ComposeSwapText swapKey={tipKey}>{t(tipKey)}</ComposeSwapText>
      </p>
    </div>
  );
}
