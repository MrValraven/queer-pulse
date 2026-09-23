import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import {
  UNO_REVERSE_DEFAULTS,
  type UnoReverseParams,
} from "../../stickers/templates/unoReverse.params";
import type { PreviewBackdrop, PublishMode } from "./stickerBuilder.types";
import {
  BUILDER_FLAG_IDS,
  packTemplateStyle,
  sortFlagIds,
} from "./stickerFlags";

/** The workspace tabs: generate new stickers, or manage the ones in the pack. */
export type StickerBuilderTab = "add" | "contents";

/** The selected pack rides the URL, so a refresh or a shared link keeps it. */
const PACK_PARAM = "pack";

const DEFAULT_MODE: PublishMode = "add-missing";

type TemplateStyle = Omit<UnoReverseParams, "flagId">;

/** `params` wearing a pack's stored style; the previewed flag stays put. */
function withTemplateStyle(
  params: UnoReverseParams,
  templateStyle: TemplateStyle,
): UnoReverseParams {
  return { ...params, ...templateStyle, flagId: params.flagId };
}

/**
 * Everything the builder page remembers between renders: the template style,
 * which flags are ticked, which one the hero previews, the preview backdrop,
 * the publish mode and the active workspace tab.
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
 * into `params`, so new stickers match the ones already in it. The one
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

  const [params, setParamsState] =
    useState<UnoReverseParams>(UNO_REVERSE_DEFAULTS);
  // Set by any style change the admin makes, cleared on every pack switch.
  const [hasEditedStyle, setHasEditedStyle] = useState(false);
  const [selectedFlagIds, setSelectedFlagIdsState] = useState<string[]>(() =>
    sortFlagIds(BUILDER_FLAG_IDS),
  );
  // Null until the admin picks a tile, so the hero follows the first ticked
  // flag by default and stops following it once a choice was made.
  const [chosenFocusFlagId, setFocusedFlagId] = useState<string | null>(null);
  const focusedFlagId = chosenFocusFlagId ?? selectedFlagIds[0] ?? null;
  const [backdrop, setBackdrop] = useState<PreviewBackdrop>("light");
  const [mode, setMode] = useState<PublishMode>(DEFAULT_MODE);
  // The pack the current mode and style were set for. Adjusted during render
  // (the React pattern for state derived from a changed value), so the grid,
  // the CTA and the preview never show one render with the old pack's mode
  // or style. Starts at null, so the first pack to show loads its style too.
  const [shownPackId, setShownPackId] = useState<string | null>(null);
  if (shownPackId !== selectedPackId) {
    setShownPackId(selectedPackId);
    setMode(DEFAULT_MODE);
    setHasEditedStyle(false);
    const storedStyle = packTemplateStyle(selectedPack);
    if (storedStyle !== null && !hasEditedStyle) {
      setParamsState((previous) => withTemplateStyle(previous, storedStyle));
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

  const setSelectedFlagIds = useCallback((flagIds: string[]) => {
    setSelectedFlagIdsState(sortFlagIds(flagIds));
  }, []);

  /** The admin's own style changes; the only writer that marks the style
   *  as edited, so a pack switch then leaves it alone. */
  const setParams = useCallback((nextParams: UnoReverseParams) => {
    setParamsState(nextParams);
    setHasEditedStyle(true);
  }, []);

  const packStyle = packTemplateStyle(selectedPack);
  const loadPackStyle = useCallback(() => {
    const storedStyle = packTemplateStyle(selectedPack);
    if (!storedStyle) return;
    setParamsState((previous) => withTemplateStyle(previous, storedStyle));
    // Back on the pack's own look, so nothing tuned is left to carry over.
    setHasEditedStyle(false);
  }, [selectedPack]);

  return {
    selectedPack,
    selectPack,
    clearPack,
    params,
    setParams,
    packStyle,
    loadPackStyle,
    selectedFlagIds,
    setSelectedFlagIds,
    focusedFlagId,
    setFocusedFlagId,
    backdrop,
    setBackdrop,
    mode,
    setMode,
    activeTab,
    setActiveTab,
  };
}

export type StickerBuilderState = ReturnType<typeof useStickerBuilderState>;
