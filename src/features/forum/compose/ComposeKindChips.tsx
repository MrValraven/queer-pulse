import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COMPOSE_KINDS,
  COMPOSE_KIND_FALLBACK,
  composeKindById,
} from "./composeKinds.data";
import type { PostKind } from "./composeThread.types";
import styles from "./ComposeKindChips.module.css";

// ── "What kind of post is this?" ────────────────────────────────────────────
// The first thing the page asks, because the answer changes the title
// placeholder, the body placeholder, the outline pill and (for two of the
// four) the category. Pressing the chip that is already on clears the kind
// again: a member who picked Guide by mistake should be able to take it back
// without guessing which other chip is the "none" one.

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
  const chosen = composeKindById(kind);
  const tipKey = chosen?.tipKey ?? COMPOSE_KIND_FALLBACK.tipKey;

  return (
    <div
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
            type="button"
            aria-pressed={isOn}
            className={[styles.kind, isOn && styles.kindOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onKindChange(isOn ? null : option.id)}
          >
            <Icon className={styles.kindIcon} aria-hidden />
            {t(option.nameKey)}
          </button>
        );
      })}
      {/* The tip is a live readout: it changes under the chips as the choice
          changes, so it is announced rather than silently swapped. */}
      <p className={styles.kindTip} aria-live="polite">
        {t(tipKey)}
      </p>
    </div>
  );
}
