import { useId, type KeyboardEvent, type MouseEvent } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiMinusCircle,
} from "react-icons/fi";
import { Spinner } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  StickerTemplate,
  TemplateStyle,
} from "../../stickers/templates/templateDefinition";
import { StickerCanvas } from "./StickerCanvas";
import type {
  ItemPackState,
  ItemRunState,
  ItemRunStatus,
  PublishMode,
} from "./stickerBuilder.types";
import styles from "./StickerItemTile.module.css";

type TileBadge = "new" | "in-pack" | "will-replace";

/** What the badge under the tile's name says about the item and the open pack.
 *  An item the pack holds reads "Will replace" only when a replace run would
 *  actually redraw it; a new item earns "New" once it is selected. */
function tileBadgeFor(
  packState: ItemPackState | null,
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

function RunStatusIcon({ status }: { status: ItemRunStatus }) {
  if (status === "running") return <Spinner />;
  if (status === "done") return <FiCheckCircle aria-hidden />;
  if (status === "failed") return <FiAlertCircle aria-hidden />;
  if (status === "queued") return <FiClock aria-hidden />;
  return <FiMinusCircle aria-hidden />;
}

const RUN_MARK_CLASS: Record<ItemRunStatus, string | undefined> = {
  queued: styles.runMarkSubtle,
  running: styles.runMarkRunning,
  done: styles.runMarkDone,
  failed: styles.runMarkFailed,
  cancelled: styles.runMarkSubtle,
};

/**
 * One item in the builder's grid, drawn as an option of the grid's
 * multi-select listbox: `aria-selected` says whether the next run includes
 * it, and `aria-current` marks the item in the hero preview. The grid moves a
 * single roving tab stop between tiles with the arrow keys.
 *
 * A click or tap on the tile previews the item, and the round tick in its
 * corner flips it in or out of the next run. The keys split the same way:
 * Enter previews the item, Space flips the selection.
 */
export function StickerItemTile({
  template,
  style,
  itemId,
  itemName,
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
  template: StickerTemplate;
  style: TemplateStyle;
  itemId: string;
  itemName: string;
  isSelected: boolean;
  isFocused: boolean;
  packState: ItemPackState | null;
  mode: PublishMode;
  runState: ItemRunState | null;
  onToggle: (itemId: string) => void;
  onFocus: (itemId: string) => void;
  /** 0 on the grid's roving tile, -1 everywhere else. */
  tabIndex: 0 | -1;
  tileRef: (element: HTMLLIElement | null) => void;
  onTileKeyDown: (event: KeyboardEvent<HTMLLIElement>, itemId: string) => void;
  /** Claims the roving tab stop when a click or Tab lands on this tile. */
  onTileFocus: (itemId: string) => void;
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

  // One click handler for the whole option: the tick flips, the rest previews.
  function handleClick(event: MouseEvent<HTMLLIElement>) {
    const isOnTick = (event.target as Element).closest("[data-tick]") !== null;
    if (isOnTick) onToggle(itemId);
    else onFocus(itemId);
  }

  return (
    <li
      ref={tileRef}
      role="option"
      aria-selected={isSelected}
      aria-current={isFocused ? "true" : undefined}
      aria-label={itemName}
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
      onKeyDown={(event) => onTileKeyDown(event, itemId)}
      onFocus={() => onTileFocus(itemId)}
    >
      <div className={styles.stage}>
        <div className={styles.art}>
          <StickerCanvas
            className={styles.canvas}
            template={template}
            style={style}
            itemId={itemId}
            label={itemName}
          />
        </div>
        <span className={styles.check} aria-hidden data-tick>
          {isSelected && <FiCheck />}
        </span>
        {runStatus !== null && (
          <span
            id={runMarkId}
            role="img"
            aria-label={t(`admin:stickerPacks.flags.run.${runStatus}`, {
              flag: itemName,
            })}
            className={[styles.runMark, RUN_MARK_CLASS[runStatus]].join(" ")}
          >
            <RunStatusIcon status={runStatus} />
          </span>
        )}
      </div>
      <div className={styles.caption}>
        <span className={styles.name}>{itemName}</span>
        {/* With a pack open, every tile keeps a badge line, so ticking a new
            item (which earns "New") never changes the tile's height. */}
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
