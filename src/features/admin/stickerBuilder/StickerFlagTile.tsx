import { useId, type KeyboardEvent } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiMinusCircle,
} from "react-icons/fi";
import { Spinner } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { UnoReverseParams } from "../../stickers/templates/unoReverse.params";
import { StickerCanvas } from "./StickerCanvas";
import type {
  FlagPackState,
  FlagRunState,
  FlagRunStatus,
  PublishMode,
} from "./stickerBuilder.types";
import styles from "./StickerFlagTile.module.css";

type TileBadge = "new" | "in-pack" | "will-replace";

/** What the badge under the tile's name says about the flag and the open pack. A
 *  flag the pack holds reads "Will replace" only when a replace run would
 *  actually redraw it; a new flag earns "New" once it is selected. */
function tileBadgeFor(
  packState: FlagPackState | null,
  isSelected: boolean,
  mode: PublishMode,
): TileBadge | null {
  if (packState === "in-pack") {
    return isSelected && mode === "replace" ? "will-replace" : "in-pack";
  }
  if (packState === "new" && isSelected) return "new";
  return null;
}

const BADGE_CLASS: Record<TileBadge, string | undefined> = {
  new: styles.badgeNew,
  "in-pack": styles.badgeInPack,
  "will-replace": styles.badgeWillReplace,
};

const BADGE_KEY: Record<TileBadge, string> = {
  new: "admin:stickerPacks.flags.badge.new",
  "in-pack": "admin:stickerPacks.flags.badge.inPack",
  "will-replace": "admin:stickerPacks.flags.badge.willReplace",
};

function RunStatusIcon({ status }: { status: FlagRunStatus }) {
  if (status === "running") return <Spinner />;
  if (status === "done") return <FiCheckCircle aria-hidden />;
  if (status === "failed") return <FiAlertCircle aria-hidden />;
  if (status === "queued") return <FiClock aria-hidden />;
  return <FiMinusCircle aria-hidden />;
}

const RUN_MARK_CLASS: Record<FlagRunStatus, string | undefined> = {
  queued: styles.runMarkSubtle,
  running: styles.runMarkRunning,
  done: styles.runMarkDone,
  failed: styles.runMarkFailed,
  cancelled: styles.runMarkSubtle,
};

/**
 * One flag in the builder's grid, drawn as an option of the grid's
 * multi-select listbox: `aria-selected` says whether the next run includes
 * it, and `aria-current` marks the flag in the hero preview. The tile itself
 * is the only focusable part, and the grid moves a single roving tab stop
 * between tiles with the arrow keys.
 *
 * A click or tap anywhere on the tile flips the flag in or out of the next
 * run and puts it in the hero preview, the way a photo picker works. The
 * corner tick only shows the selection. On the keyboard the grid keeps the
 * two apart: Space flips the selection, and Enter previews the flag while
 * leaving the selection as it is.
 */
export function StickerFlagTile({
  flagId,
  flagName,
  params,
  isSelected,
  isFocused,
  packState,
  mode,
  runState,
  onToggle,
  onFocus,
  tabIndex,
  tileRef,
  onTileKeyDown,
  onTileFocus,
}: {
  flagId: string;
  flagName: string;
  params: UnoReverseParams;
  isSelected: boolean;
  isFocused: boolean;
  packState: FlagPackState | null;
  mode: PublishMode;
  runState: FlagRunState | null;
  onToggle: (flagId: string) => void;
  onFocus: (flagId: string) => void;
  /** 0 on the grid's roving tile, -1 everywhere else. */
  tabIndex: 0 | -1;
  tileRef: (element: HTMLLIElement | null) => void;
  onTileKeyDown: (event: KeyboardEvent<HTMLLIElement>, flagId: string) => void;
  /** Lets a tile claim the roving tab stop when a click or Tab lands on it. */
  onTileFocus: (flagId: string) => void;
}) {
  const { t } = useTranslation();
  const badgeId = useId();
  const runMarkId = useId();
  const badge = tileBadgeFor(packState, isSelected, mode);
  const runStatus = runState?.status ?? null;
  const describedByIds = [
    badge !== null && badgeId,
    runStatus !== null && runMarkId,
  ]
    .filter(Boolean)
    .join(" ");

  // One click handler for the whole option: wherever the pointer lands, the
  // flag flips in or out of the run and moves into the hero preview.
  function handleClick() {
    onToggle(flagId);
    onFocus(flagId);
  }

  return (
    <li
      ref={tileRef}
      role="option"
      aria-selected={isSelected}
      aria-current={isFocused ? "true" : undefined}
      aria-label={flagName}
      aria-describedby={describedByIds || undefined}
      tabIndex={tabIndex}
      className={[
        styles.tile,
        styles.tileSelectable,
        isSelected ? styles.tileSelected : styles.tileUnselected,
        isFocused && styles.tileFocused,
        runStatus === "failed" && styles.tileFailed,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      onKeyDown={(event) => onTileKeyDown(event, flagId)}
      onFocus={() => onTileFocus(flagId)}
    >
      <div className={styles.stage}>
        <div className={styles.art}>
          <StickerCanvas
            className={styles.canvas}
            flagId={flagId}
            params={params}
            label={flagName}
          />
        </div>
        <span className={styles.check} aria-hidden>
          {isSelected && <FiCheck />}
        </span>
        {runStatus !== null && (
          <span
            id={runMarkId}
            role="img"
            aria-label={t(`admin:stickerPacks.flags.run.${runStatus}`, {
              flag: flagName,
            })}
            className={[styles.runMark, RUN_MARK_CLASS[runStatus]].join(" ")}
          >
            <RunStatusIcon status={runStatus} />
          </span>
        )}
      </div>
      <div className={styles.caption}>
        <span className={styles.name}>{flagName}</span>
        {/* With a pack open, every tile keeps a badge line, so ticking a new
            flag (which earns "New") never changes the tile's height. */}
        {packState !== null && (
          <span className={styles.badgeSlot}>
            {badge !== null && (
              <span
                id={badgeId}
                className={[styles.badge, BADGE_CLASS[badge]].join(" ")}
              >
                {t(BADGE_KEY[badge])}
              </span>
            )}
          </span>
        )}
      </div>
    </li>
  );
}
