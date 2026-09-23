import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StickerPackResponse } from "../../../shared/contracts/contracts";
import { DEMO_STICKER_PACKS } from "../demoStickerPacks.data";
import { getStickerPacks } from "./stickers.api";

/** The catalogue changes only when an admin publishes, and the picker reads
 *  it on every composer open, so it is cached hard. */
const STICKER_CATALOGUE_STALE_MS = 60 * 60 * 1000;

/** The published sticker catalogue for the composer's picker. Demo mode
 *  returns {@link DEMO_STICKER_PACKS} and never touches the network. */
export function useStickerPacks() {
  const { demoMode } = useDemoMode();
  return useQuery<StickerPackResponse[]>({
    queryKey: ["sticker-packs", demoMode],
    queryFn: demoMode
      ? () => Promise.resolve(DEMO_STICKER_PACKS)
      : getStickerPacks,
    staleTime: STICKER_CATALOGUE_STALE_MS,
    gcTime: STICKER_CATALOGUE_STALE_MS,
  });
}
