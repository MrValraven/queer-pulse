import {
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { UnoReverseParams } from "../../stickers/templates/unoReverse.params";
import { StickerFlagTile } from "./StickerFlagTile";
import { BUILDER_FLAG_IDS, sortFlagIds } from "./stickerFlags";
import type {
  FlagPackState,
  FlagRunState,
  PublishMode,
} from "./stickerBuilder.types";
import styles from "./StickerFlagGrid.module.css";

/** How many tracks the grid lays out right now. The columns come from
 *  `auto-fill`, so they change with the panel width; reading the resolved
 *  track list at key time keeps Up/Down one visual row away. */
function measureColumnCount(grid: HTMLElement | null): number {
  if (!grid) return 1;
  const tracks = getComputedStyle(grid)
    .gridTemplateColumns.split(" ")
    .filter((track) => track !== "" && track !== "none");
  return Math.max(tracks.length, 1);
}

/** The tile index an arrow, Home or End key moves to, or null when the key
 *  is not a move. Left/Right step one tile and wrap between the ends; Up and
 *  Down step a whole row and stop at the edges, landing on the last flag
 *  when the row below is short. */
function nextTileIndex(
  key: string,
  index: number,
  tileCount: number,
  columnCount: number,
): number | null {
  const lastIndex = tileCount - 1;
  if (key === "ArrowRight") return index === lastIndex ? 0 : index + 1;
  if (key === "ArrowLeft") return index === 0 ? lastIndex : index - 1;
  if (key === "Home") return 0;
  if (key === "End") return lastIndex;
  if (key === "ArrowUp") {
    return index - columnCount >= 0 ? index - columnCount : index;
  }
  if (key === "ArrowDown") {
    const isOnLastRow =
      Math.floor(index / columnCount) === Math.floor(lastIndex / columnCount);
    return isOnLastRow ? index : Math.min(index + columnCount, lastIndex);
  }
  return null;
}

/**
 * The grid's roving tab stop: one tile holds `tabIndex` 0, so Tab enters and
 * leaves the whole grid in one press. While focus is outside the grid, the
 * stop follows the previewed flag; while a tile holds focus, only the keys
 * and clicks inside the grid move it. Enter previews the focused flag, Space
 * toggles it.
 */
function useFlagGridKeys({
  focusedFlagId,
  onPreview,
  onToggle,
}: {
  focusedFlagId: string | null;
  onPreview: (flagId: string) => void;
  onToggle: (flagId: string) => void;
}) {
  const gridRef = useRef<HTMLUListElement>(null);
  const tileRefs = useRef(new Map<string, HTMLLIElement>());
  const [roving, setRoving] = useState<{
    flagId: string | null;
    followedFlagId: string | null;
  }>({ flagId: focusedFlagId, followedFlagId: focusedFlagId });
  const [isFocusInGrid, setIsFocusInGrid] = useState(false);
  // A preview chosen elsewhere (the hero, the contents tab) moves the stop
  // with it. The preview is derived: with no explicit pick it is the first
  // ticked flag, so a Space press can move it. While a tile holds focus the
  // change is only acknowledged, and the stop stays on the focused tile.
  // Adjusting state during render avoids an extra paint.
  if (roving.followedFlagId !== focusedFlagId) {
    setRoving({
      flagId: isFocusInGrid ? roving.flagId : (focusedFlagId ?? roving.flagId),
      followedFlagId: focusedFlagId,
    });
  }
  // With nothing previewed yet, the first flag holds the stop.
  const rovingFlagId =
    roving.flagId !== null && BUILDER_FLAG_IDS.includes(roving.flagId)
      ? roving.flagId
      : (BUILDER_FLAG_IDS[0] ?? null);

  function claimTile(flagId: string) {
    setRoving((current) =>
      current.flagId === flagId ? current : { ...current, flagId },
    );
  }

  function handleTileKeyDown(
    event: KeyboardEvent<HTMLLIElement>,
    flagId: string,
  ) {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (event.key === " ") onToggle(flagId);
      else onPreview(flagId);
      return;
    }
    const index = BUILDER_FLAG_IDS.indexOf(flagId);
    if (index === -1) return;
    const targetIndex = nextTileIndex(
      event.key,
      index,
      BUILDER_FLAG_IDS.length,
      measureColumnCount(gridRef.current),
    );
    if (targetIndex === null) return;
    event.preventDefault();
    const targetFlagId = BUILDER_FLAG_IDS[targetIndex];
    if (targetFlagId === undefined) return;
    claimTile(targetFlagId);
    tileRefs.current.get(targetFlagId)?.focus();
  }

  function registerTile(flagId: string) {
    return (element: HTMLLIElement | null) => {
      if (element) tileRefs.current.set(flagId, element);
      else tileRefs.current.delete(flagId);
    };
  }

  // Focus events bubble in React, so the listbox hears every tile's.
  const gridFocusProps = {
    onFocus: () => setIsFocusInGrid(true),
    onBlur: (event: FocusEvent<HTMLUListElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setIsFocusInGrid(false);
      }
    },
  };

  return {
    gridRef,
    gridFocusProps,
    rovingFlagId,
    claimTile,
    handleTileKeyDown,
    registerTile,
  };
}

/**
 * Every flag the template can paint as a selectable tile. The toolbar
 * carries the count and the bulk selections; "Select missing only" appears
 * once the open pack holds any of these flags, and picks exactly the ones
 * it lacks.
 *
 * Selection always leaves here in canonical order, whatever order the admin
 * ticked the tiles in, so the run and its progress read top to bottom.
 *
 * The tiles form one multi-select listbox with a single roving tab stop,
 * so a keyboard admin crosses the grid in one Tab press.
 */
export function StickerFlagGrid({
  params,
  selectedFlagIds,
  onSelectedFlagIdsChange,
  focusedFlagId,
  onFocusFlag,
  packStates,
  mode,
  runStateByFlag,
}: {
  params: UnoReverseParams;
  selectedFlagIds: string[];
  onSelectedFlagIdsChange: (flagIds: string[]) => void;
  focusedFlagId: string | null;
  onFocusFlag: (flagId: string) => void;
  packStates: Record<string, FlagPackState> | null;
  mode: PublishMode;
  runStateByFlag: Record<string, FlagRunState> | null;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const keyboardHintId = useId();
  const selectedFlagSet = new Set(selectedFlagIds);
  const totalCount = BUILDER_FLAG_IDS.length;
  const selectedCount = BUILDER_FLAG_IDS.filter((flagId) =>
    selectedFlagSet.has(flagId),
  ).length;

  const missingFlagIds =
    packStates === null
      ? []
      : BUILDER_FLAG_IDS.filter((flagId) => packStates[flagId] === "new");
  const hasFlagsInPack =
    packStates !== null &&
    BUILDER_FLAG_IDS.some((flagId) => packStates[flagId] === "in-pack");
  const isMissingSelectionCurrent =
    selectedCount === missingFlagIds.length &&
    missingFlagIds.every((flagId) => selectedFlagSet.has(flagId));

  function handleToggle(flagId: string) {
    const nextFlagIds = selectedFlagSet.has(flagId)
      ? selectedFlagIds.filter((selectedFlagId) => selectedFlagId !== flagId)
      : [...selectedFlagIds, flagId];
    onSelectedFlagIdsChange(sortFlagIds(nextFlagIds));
  }

  const {
    gridRef,
    gridFocusProps,
    rovingFlagId,
    claimTile,
    handleTileKeyDown,
    registerTile,
  } = useFlagGridKeys({
    focusedFlagId,
    onPreview: onFocusFlag,
    onToggle: handleToggle,
  });

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.toolbar}>
        <div className={styles.titleBlock}>
          <h3 id={headingId} className={styles.heading}>
            {t("admin:stickerPacks.flags.heading")}
          </h3>
          <p className={styles.count}>
            {t("admin:stickerPacks.flags.selectedCount", {
              count: selectedCount,
              total: totalCount,
            })}
          </p>
        </div>
        <div className={styles.actions}>
          {hasFlagsInPack && (
            <Button
              variant="ghost"
              size="sm"
              disabled={
                missingFlagIds.length === 0 || isMissingSelectionCurrent
              }
              onClick={() =>
                onSelectedFlagIdsChange(sortFlagIds(missingFlagIds))
              }
            >
              {t("admin:stickerPacks.flags.selectMissing")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedCount === totalCount}
            onClick={() => onSelectedFlagIdsChange([...BUILDER_FLAG_IDS])}
          >
            {t("admin:stickerPacks.controls.selectAll")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedCount === 0}
            onClick={() => onSelectedFlagIdsChange([])}
          >
            {t("admin:stickerPacks.controls.clear")}
          </Button>
        </div>
      </div>
      <p className={styles.hint}>{t("admin:stickerPacks.flags.hint")}</p>
      <p id={keyboardHintId} className={styles.srOnly}>
        {t("admin:stickerPacks.flags.keyboardHint")}
      </p>
      <ul
        ref={gridRef}
        {...gridFocusProps}
        role="listbox"
        aria-multiselectable
        aria-labelledby={headingId}
        aria-describedby={keyboardHintId}
        className={styles.grid}
      >
        {BUILDER_FLAG_IDS.map((flagId) => (
          <StickerFlagTile
            key={flagId}
            flagId={flagId}
            flagName={t(`cards:flag.${flagId}`)}
            params={params}
            isSelected={selectedFlagSet.has(flagId)}
            isFocused={focusedFlagId === flagId}
            packState={packStates?.[flagId] ?? null}
            mode={mode}
            runState={runStateByFlag?.[flagId] ?? null}
            onToggle={handleToggle}
            onFocus={onFocusFlag}
            tabIndex={flagId === rovingFlagId ? 0 : -1}
            tileRef={registerTile(flagId)}
            onTileKeyDown={handleTileKeyDown}
            onTileFocus={claimTile}
          />
        ))}
      </ul>
    </section>
  );
}
