import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import type {
  StickerTemplateId,
  TemplateStyle,
} from "../../stickers/templates/templateDefinition";
import type { PreviewBackdrop, PublishMode } from "./stickerBuilder.types";
import {
  DEFAULT_TEMPLATE_ID,
  packTemplateId,
  packTemplateStyle,
  resolveTemplate,
  sortItemIds,
  templateItemIds,
} from "./stickerItems";

/** The workspace tabs: generate new stickers, or manage the ones in the pack. */
export type StickerBuilderTab = "add" | "contents";

/** What a template left behind when the admin switched away from it. */
interface TemplateMemoryEntry {
  style: TemplateStyle;
  selectedItemIds: string[];
  hasEditedStyle: boolean;
}

/** The shown pack's session memory, keyed by the template it belongs to. */
type TemplateMemory = Partial<Record<StickerTemplateId, TemplateMemoryEntry>>;

const EMPTY_TEMPLATE_MEMORY: TemplateMemory = {};

/** The selected pack rides the URL, so a refresh or a shared link keeps it. */
const PACK_PARAM = "pack";

const DEFAULT_MODE: PublishMode = "add-missing";

/**
 * Everything the builder page remembers between renders: the template and
 * its style, which items are ticked, which one the hero previews, the preview
 * backdrop, the publish mode and the active workspace tab.
 *
 * A pack holding a sticker from a known template is locked to that template
 * (`packTemplateId`); an empty pack uses the template the admin chose, which
 * `chooseTemplate` sets and which is ignored while the pack is locked.
 * When the shown pack loses its last sticker, its template becomes the chosen
 * one, so clearing a Blip pack leaves it on Blip until the admin picks
 * another. Only the same pack carries its template this way: switching to an
 * empty pack shows the admin's own choice, as before.
 * Whenever the shown template changes, the chosen focus is cleared and the
 * style and selection move to the incoming template, so no item id or style
 * from the previous template ever reaches the grid, the preview or the plan.
 * The session keeps a memory per template for the shown pack: leaving a
 * template saves its style, selection and edited flag, and returning to it
 * restores them, so Blip to Tea and back to Blip keeps Blip's tuning. A
 * template with no memory gets that pack's stored style for the template (or
 * the template's default), every item selected and an unedited style. A pack
 * switch empties the memory, so the next pack starts from its own stored
 * style.
 *
 * The selected pack is `?pack=<id>`. With no id, or one that no longer
 * matches a pack (deleted, or a stale link), the first pack stands in, so the
 * workspace is never blank while packs exist. Writes REPLACE the history
 * entry: flipping between packs is browsing, and one Back press should leave
 * the builder whatever number of packs was clicked. `ScrollManager`
 * leaves the scroll offset alone on a query-only change, so nothing jumps.
 *
 * Whenever the requested id is absent or stale, the pack standing in is
 * written back to `?pack=` (one replace, which settles on the next render).
 * Pinning it means a rename, or another admin's new pack, can reorder the
 * list without ever moving the workspace onto a different pack.
 *
 * Whenever the shown pack changes, for any reason, the publish mode resets to
 * "Add missing only": a Replace choice made for one pack must stay with it.
 * The style follows the pack too: its stored style (when it has one) loads
 * into `style`, so new stickers match the ones already in it. The one
 * exception is a style the admin changed since the previous pack switch,
 * which is kept, since carrying a tuned style over to another pack is a
 * deliberate move.
 * An admin's own switch also calls `onPackChange` with the next pack id (null
 * after a delete), which the page uses to dismiss a finished run.
 */
export function useStickerBuilderState({
  packs,
  onPackChange,
}: {
  packs: AdminStickerPackResponse[];
  onPackChange: (nextPackId: string | null) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPackId = searchParams.get(PACK_PARAM);
  const selectedPack =
    packs.find((pack) => pack.id === requestedPackId) ?? packs[0] ?? null;
  const selectedPackId = selectedPack?.id ?? null;

  // The template an empty pack uses; a locked pack ignores it.
  const [chosenTemplateId, setChosenTemplateId] =
    useState<StickerTemplateId>(DEFAULT_TEMPLATE_ID);
  const lockedTemplateId = packTemplateId(selectedPack);
  // The pack and lock seen on the previous render. When the same pack drops
  // from a lock to none (its last sticker deleted), the lost template is
  // carried into `chosenTemplateId`. This render already uses the carried
  // id, so the template never flickers to the old choice, and the next
  // render finds the pair settled, so the adjustment runs once.
  const [seenLock, setSeenLock] = useState<{
    packId: string | null;
    templateId: StickerTemplateId | null;
  }>({ packId: selectedPackId, templateId: lockedTemplateId });
  const carriedTemplateId =
    seenLock.packId === selectedPackId && lockedTemplateId === null
      ? seenLock.templateId
      : null;
  if (
    seenLock.packId !== selectedPackId ||
    seenLock.templateId !== lockedTemplateId
  ) {
    setSeenLock({ packId: selectedPackId, templateId: lockedTemplateId });
    if (carriedTemplateId !== null) setChosenTemplateId(carriedTemplateId);
  }
  const template = resolveTemplate(
    lockedTemplateId ?? carriedTemplateId ?? chosenTemplateId,
  );
  const isTemplateLocked = lockedTemplateId !== null;

  const [style, setStyleState] = useState<TemplateStyle>(
    () => template.defaultStyle,
  );
  // Set by any style change the admin makes, cleared on every pack switch.
  // A template change restores the incoming template's remembered flag, or
  // clears it when the template has no memory.
  const [hasEditedStyle, setHasEditedStyle] = useState(false);
  const [selectedItemIds, setSelectedItemIdsState] = useState<string[]>(() =>
    templateItemIds(template),
  );
  // Null until the admin picks a tile, so the hero follows the first ticked
  // item by default and stops following it once a choice was made.
  const [chosenFocusItemId, setChosenFocusItemId] = useState<string | null>(
    null,
  );
  const focusedItemId = chosenFocusItemId ?? selectedItemIds[0] ?? null;
  const [backdrop, setBackdrop] = useState<PreviewBackdrop>("light");
  const [mode, setMode] = useState<PublishMode>(DEFAULT_MODE);
  // The pack the current mode and style were set for, and the template the
  // current style, selection and focus belong to. Adjusted during render
  // (the React pattern for state derived from a changed value), so the grid,
  // the CTA and the preview never show one render with the old pack's mode
  // or the old template's style or items. Both start at null, so the first
  // pack to show loads its style too.
  const [shownPackId, setShownPackId] = useState<string | null>(null);
  const [shownTemplateId, setShownTemplateId] =
    useState<StickerTemplateId | null>(null);
  // Written only inside the adjustment below, together with the shown ids,
  // so it never starts another adjustment of its own.
  const [templateMemory, setTemplateMemory] = useState<TemplateMemory>(
    EMPTY_TEMPLATE_MEMORY,
  );
  const isPackSwitch = shownPackId !== selectedPackId;
  const isTemplateChange = shownTemplateId !== template.id;
  if (isPackSwitch || isTemplateChange) {
    if (isPackSwitch) {
      setShownPackId(selectedPackId);
      setMode(DEFAULT_MODE);
    }
    const storedStyle = packTemplateStyle(selectedPack, template);
    if (isTemplateChange) {
      // The outgoing template's state is saved for a return within the same
      // pack; a pack switch starts the memory over.
      const nextMemory: TemplateMemory =
        isPackSwitch || shownTemplateId === null
          ? EMPTY_TEMPLATE_MEMORY
          : {
              ...templateMemory,
              [shownTemplateId]: { style, selectedItemIds, hasEditedStyle },
            };
      const rememberedEntry = nextMemory[template.id];
      setTemplateMemory(nextMemory);
      setShownTemplateId(template.id);
      // A style tuned for another template means nothing to this one.
      setStyleState(
        rememberedEntry?.style ?? storedStyle ?? template.defaultStyle,
      );
      setSelectedItemIdsState(
        rememberedEntry?.selectedItemIds ?? templateItemIds(template),
      );
      setChosenFocusItemId(null);
      setHasEditedStyle(rememberedEntry?.hasEditedStyle ?? false);
    } else {
      if (storedStyle !== null && !hasEditedStyle) setStyleState(storedStyle);
      setHasEditedStyle(false);
      setTemplateMemory(EMPTY_TEMPLATE_MEMORY);
    }
  }
  const [activeTab, setActiveTab] = useState<StickerBuilderTab>("add");

  const writePackParam = useCallback(
    (packId: string | null) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (packId) next.set(PACK_PARAM, packId);
          else next.delete(PACK_PARAM);
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  // Pins the pack standing in for an absent or stale id. Once written, the
  // requested and shown ids match, so this runs once per fallback.
  useEffect(() => {
    if (selectedPackId === null || selectedPackId === requestedPackId) return;
    writePackParam(selectedPackId);
  }, [requestedPackId, selectedPackId, writePackParam]);

  const selectPack = useCallback(
    (packId: string) => {
      // Compared with the URL: with a stale id there, clicking the pack
      // standing in still writes its real id.
      if (packId === requestedPackId) return;
      writePackParam(packId);
      if (packId !== selectedPackId) onPackChange(packId);
    },
    [onPackChange, requestedPackId, selectedPackId, writePackParam],
  );

  /** Drops `?pack=` (after a delete), so the first remaining pack stands in
   *  and is pinned on the next render. */
  const clearPack = useCallback(() => {
    writePackParam(null);
    onPackChange(null);
  }, [onPackChange, writePackParam]);

  /** Picks the template for an empty pack. Does nothing while the pack is
   *  locked to the template of the stickers it already holds; the change
   *  itself (style, selection, focus) lands during the next render. */
  const chooseTemplate = useCallback(
    (templateId: StickerTemplateId) => {
      if (isTemplateLocked) return;
      setChosenTemplateId(templateId);
    },
    [isTemplateLocked],
  );

  /** Keeps the selection in the template's canonical order, dropping ids the
   *  template does not know. */
  const setSelectedItemIds = useCallback(
    (itemIds: string[]) => {
      setSelectedItemIdsState(sortItemIds(template, itemIds));
    },
    [template],
  );

  const setFocusedItemId = useCallback((itemId: string) => {
    setChosenFocusItemId(itemId);
  }, []);

  /** The admin's own style changes; the only writer that marks the style
   *  as edited, so a pack switch then leaves it alone. */
  const setStyle = useCallback((nextStyle: TemplateStyle) => {
    setStyleState(nextStyle);
    setHasEditedStyle(true);
  }, []);

  const packStyle = packTemplateStyle(selectedPack, template);
  const loadPackStyle = useCallback(() => {
    const storedStyle = packTemplateStyle(selectedPack, template);
    if (!storedStyle) return;
    setStyleState(storedStyle);
    // Back on the pack's own look, so nothing tuned is left to carry over.
    setHasEditedStyle(false);
  }, [selectedPack, template]);

  return {
    selectedPack,
    selectPack,
    clearPack,
    template,
    isTemplateLocked,
    chooseTemplate,
    style,
    setStyle,
    packStyle,
    loadPackStyle,
    selectedItemIds,
    setSelectedItemIds,
    focusedItemId,
    setFocusedItemId,
    backdrop,
    setBackdrop,
    mode,
    setMode,
    activeTab,
    setActiveTab,
  };
}

export type StickerBuilderState = ReturnType<typeof useStickerBuilderState>;
