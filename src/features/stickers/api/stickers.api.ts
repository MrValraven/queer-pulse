import { apiGet } from "../../../shared/api/client";
import type { StickerPackResponse } from "../../../shared/contracts/contracts";

/** GET /sticker-packs: every published pack with its stickers, read by the
 *  composer's sticker picker. Authenticated like the rest of the app; not
 *  a public route. */
export const getStickerPacks = () =>
  apiGet<StickerPackResponse[]>("/sticker-packs");
