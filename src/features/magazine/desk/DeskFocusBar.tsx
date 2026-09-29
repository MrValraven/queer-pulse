import { useState } from "react";
import {
  countForFocus,
  DESK_FOCUS_DEFINITIONS,
  type DeskFocusId,
} from "./deskFocus";
import { DeskFocusChip, type DeskFocusChipState } from "./DeskFocusChip";
import { useFocusRecoveryInGroup } from "./useFocusRecoveryInGroup";
import { cx } from "../../../shared/lib/cx";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./DeskFocusBar.module.css";

export interface DeskFocusBarProps {
  /** The active scope's pieces, before focus filtering: each chip always
   *  counts against this same list, so toggling one chip leaves every other
   *  chip's count exactly where it was. */
  pieces: Piece[];
  me: string;
  activeFocusIds: DeskFocusId[];
  onToggleFocus: (id: DeskFocusId) => void;
  onClearFocus: () => void;
  pitchCount: number;
  onOpenPitches: () => void;
  /** The issue scope's close day (ISO), so the At risk chip counts against
   *  the same date its filter reads. Unset or null outside the issue scope,
   *  where At risk counts nothing. */
  closesOn?: string | null;
}

/** At most this many focus chips show before the rest collapse behind "+N". */
const MAX_VISIBLE_FOCUS_CHIPS = 5;

/** Below 768px every chip renders in one scrolling row, so the cap never
 *  applies: `--messages` (768px) is that page's own name for this cutoff,
 *  so this is its own literal rather than borrowing that token. */
const MOBILE_QUERY = mediaMax(767);

/**
 * One row of toggle chips, each `label + count`, read straight from
 * `DESK_FOCUS_DEFINITIONS` so a chip's label, tone and count can never
 * disagree with what clicking it filters to. Replaces NeedsStrip, DeskStats
 * and SavedViews: every number here is the same "click it, see exactly what
 * it counted" contract those three used to split across three widgets.
 *
 * A chip only occupies one of the 5 visible slots when it has a match or is
 * active; a zero-count chip that is not active never competes for a slot,
 * even when fewer than 5 chips would otherwise show (toggling a second
 * filter can legitimately zero out a first one's match, which is why an
 * active chip stays visible at a zero count). Within that eligible set,
 * order is the registry's own order. Everything left out, including every
 * remaining zero-count chip, collapses behind "+N", which expands the row in
 * place to show the full registry (muted zeros included) rather than opening
 * a popover. "+N" stays mounted once pressed, turning into "Show fewer" with
 * `aria-expanded` set, so the button a keyboard or screen reader user just
 * activated is still there to press back rather than vanishing under them.
 * An all-zero scope renders no toggle chips at all: just "+N" and the
 * Pitches chip. On a phone the cap is dropped entirely and the whole row
 * scrolls instead, so "+N" never renders there.
 *
 * A toggled chip or Clear can also remove the very button someone just
 * pressed: a zero-count chip drops out of the eligible set the moment it is
 * switched off, and Clear empties the whole active set (removing itself with
 * it). Either one hands a stranded focus to the first button still standing
 * in the group, so it never falls back to the page.
 *
 * The row scrolls sideways whenever its chips are wider than the bar (a
 * tablet, a narrow window), with a fade on the edge that hides chips. The
 * frame around it is the size container the CSS reads for that switch.
 */
export function DeskFocusBar({
  pieces,
  me,
  activeFocusIds,
  onToggleFocus,
  onClearFocus,
  pitchCount,
  onOpenPitches,
  closesOn = null,
}: DeskFocusBarProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [isOverflowExpanded, setIsOverflowExpanded] = useState(false);
  const { groupRef, keepFocusInGroup } =
    useFocusRecoveryInGroup<HTMLDivElement>();

  const chips: DeskFocusChipState[] = DESK_FOCUS_DEFINITIONS.map(
    (definition) => ({
      id: definition.id,
      labelKey: definition.labelKey,
      tone: definition.tone,
      // "Now" as the instant, like the filter in `useDeskState`, so a chip's
      // count and what clicking it shows share one clock.
      count: countForFocus(pieces, me, definition.id, undefined, closesOn),
      isActive: activeFocusIds.includes(definition.id),
    }),
  );
  const eligibleChips = chips.filter((chip) => chip.count > 0 || chip.isActive);
  const collapsedChips = eligibleChips.filter(
    (chip, index) => index < MAX_VISIBLE_FOCUS_CHIPS || chip.isActive,
  );
  const isCapLifted = isMobile || isOverflowExpanded;
  const visibleChips = isCapLifted ? chips : collapsedChips;
  // How many chips "+N" would reveal, computed from the collapsed set even
  // once expanded: once lifted there is nothing left to count, but the
  // button still needs this number to decide whether it exists at all.
  const collapsedOverflowCount = chips.length - collapsedChips.length;
  const canToggleOverflow = !isMobile && collapsedOverflowCount > 0;
  const hasActiveFocus = activeFocusIds.length > 0;

  return (
    <div className={styles.frame}>
      <div
        ref={groupRef}
        role="group"
        aria-label={t("magazine:desk.focus.aria")}
        tabIndex={-1}
        className={cx(styles.bar, isCapLifted && styles.wrapping)}
      >
        {visibleChips.map((chip) => (
          <DeskFocusChip
            key={chip.id}
            chip={chip}
            onToggle={keepFocusInGroup(() => onToggleFocus(chip.id))}
          />
        ))}
        {canToggleOverflow && (
          <button
            type="button"
            className={styles.more}
            aria-expanded={isOverflowExpanded}
            aria-label={
              isOverflowExpanded
                ? undefined
                : t("magazine:desk.focus.moreAria", {
                    count: collapsedOverflowCount,
                  })
            }
            onClick={() => setIsOverflowExpanded((expanded) => !expanded)}
          >
            {isOverflowExpanded
              ? t("magazine:desk.focus.fewer")
              : t("magazine:desk.focus.more", {
                  count: collapsedOverflowCount,
                })}
          </button>
        )}
        {hasActiveFocus && (
          <button
            type="button"
            className={styles.clear}
            onClick={keepFocusInGroup(onClearFocus)}
          >
            {t("magazine:desk.focus.clear")}
          </button>
        )}
        <span className={styles.divider} aria-hidden="true" />
        <button
          type="button"
          aria-haspopup="dialog"
          className={cx(styles.chip, pitchCount === 0 && styles.chipMuted)}
          onClick={onOpenPitches}
        >
          <span>{t("magazine:desk.focus.pitches")}</span>{" "}
          <span className={styles.count}>
            {pitchCount > 0 ? (
              <RollingNumber
                value={fmt.number(pitchCount)}
                numericValue={pitchCount}
              />
            ) : (
              t("magazine:desk.focus.none")
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
