import { useId } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  StickerTemplate,
  TemplateStyle,
} from "../../stickers/templates/templateDefinition";
import { StickerItemTile } from "./StickerItemTile";
import { itemName, sortItemIds, templateItemIds } from "./stickerItems";
import type {
  ItemPackState,
  ItemRunState,
  PublishMode,
} from "./stickerBuilder.types";
import { useStickerItemGridKeys } from "./useStickerItemGridKeys";
import styles from "./StickerItemGrid.module.css";

/**
 * Every item the active template can paint as a selectable tile. The toolbar
 * carries the count and the bulk selections; "Select missing only" appears
 * once the open pack holds any of these items, and picks exactly the ones
 * it lacks.
 *
 * Selection always leaves here in canonical order, whatever order the admin
 * ticked the tiles in, so the run and its progress read top to bottom.
 *
 * The tiles form one multi-select listbox with a single roving tab stop,
 * so a keyboard admin crosses the grid in one Tab press.
 */
export function StickerItemGrid({
  template,
  style,
  selectedItemIds,
  onSelectedItemIdsChange,
  focusedItemId,
  onFocusItem,
  packStates,
  mode,
  runStateByItem,
}: {
  template: StickerTemplate;
  style: TemplateStyle;
  selectedItemIds: string[];
  onSelectedItemIdsChange: (itemIds: string[]) => void;
  focusedItemId: string | null;
  onFocusItem: (itemId: string) => void;
  packStates: Record<string, ItemPackState> | null;
  mode: PublishMode;
  runStateByItem: Record<string, ItemRunState> | null;
}) {
  const { t, language } = useTranslation();
  const headingId = useId();
  const keyboardHintId = useId();
  const itemIds = templateItemIds(template);
  const selectedItemSet = new Set(selectedItemIds);
  const totalCount = itemIds.length;
  const selectedCount = itemIds.filter((itemId) =>
    selectedItemSet.has(itemId),
  ).length;

  const missingItemIds =
    packStates === null
      ? []
      : itemIds.filter((itemId) => packStates[itemId] === "new");
  const hasItemsInPack =
    packStates !== null &&
    itemIds.some((itemId) => packStates[itemId] === "in-pack");
  const isMissingSelectionCurrent =
    selectedCount === missingItemIds.length &&
    missingItemIds.every((itemId) => selectedItemSet.has(itemId));

  function handleToggle(itemId: string) {
    const nextItemIds = selectedItemSet.has(itemId)
      ? selectedItemIds.filter((selectedItemId) => selectedItemId !== itemId)
      : [...selectedItemIds, itemId];
    onSelectedItemIdsChange(sortItemIds(template, nextItemIds));
  }

  const {
    gridRef,
    gridFocusProps,
    rovingItemId,
    claimTile,
    handleTileKeyDown,
    registerTile,
  } = useStickerItemGridKeys({
    itemIds,
    focusedItemId,
    onPreview: onFocusItem,
    onToggle: handleToggle,
  });

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.toolbar}>
        <div className={styles.titleBlock}>
          <h3 id={headingId} className={styles.heading}>
            {t("admin:stickerPacks.grid.itemsLegend")}
          </h3>
          <p className={styles.count}>
            {t("admin:stickerPacks.flags.selectedCount", {
              count: selectedCount,
              total: totalCount,
            })}
          </p>
        </div>
        <div className={styles.actions}>
          {hasItemsInPack && (
            <Button
              variant="ghost"
              size="sm"
              disabled={
                missingItemIds.length === 0 || isMissingSelectionCurrent
              }
              onClick={() =>
                onSelectedItemIdsChange(sortItemIds(template, missingItemIds))
              }
            >
              {t("admin:stickerPacks.flags.selectMissing")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedCount === totalCount}
            onClick={() => onSelectedItemIdsChange([...itemIds])}
          >
            {t("admin:stickerPacks.controls.selectAll")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedCount === 0}
            onClick={() => onSelectedItemIdsChange([])}
          >
            {t("admin:stickerPacks.controls.clear")}
          </Button>
        </div>
      </div>
      <p className={styles.hint}>{t("admin:stickerPacks.grid.hint")}</p>
      <p id={keyboardHintId} className={styles.srOnly}>
        {t("admin:stickerPacks.grid.keyboardHint")}
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
        {itemIds.map((itemId) => (
          <StickerItemTile
            key={itemId}
            template={template}
            style={style}
            itemId={itemId}
            itemName={itemName(template, itemId, language)}
            isSelected={selectedItemSet.has(itemId)}
            isFocused={focusedItemId === itemId}
            packState={packStates?.[itemId] ?? null}
            mode={mode}
            runState={runStateByItem?.[itemId] ?? null}
            onToggle={handleToggle}
            onFocus={onFocusItem}
            tabIndex={itemId === rovingItemId ? 0 : -1}
            tileRef={registerTile(itemId)}
            onTileKeyDown={handleTileKeyDown}
            onTileFocus={claimTile}
          />
        ))}
      </ul>
    </section>
  );
}
