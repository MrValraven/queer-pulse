// src/features/messages/StickerTile.tsx
import type { StickerResponse } from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { stickerLabelIn } from "../stickers/stickerLocale";
import styles from "./StickerPicker.module.css";

interface StickerTileProps {
  sticker: StickerResponse;
  onPick: (sticker: StickerResponse) => void;
}

/** One grid cell: a real button whose accessible name is the sticker's own
 *  name in the reader's language, wrapping a decorative `<img>` (the button
 *  already carries the name, so the image itself needs none). Explicit
 *  `width`/`height` come straight from the catalogue entry, matching the
 *  image's own intrinsic size so the tile never shifts layout while it
 *  loads; the CSS module scales the box visually regardless of that
 *  intrinsic size. */
export function StickerTile({ sticker, onPick }: StickerTileProps) {
  const { language } = useTranslation();
  return (
    <button
      type="button"
      className={styles.stickerBtn}
      aria-label={stickerLabelIn(sticker, language)}
      onClick={() => onPick(sticker)}
    >
      <img
        src={sticker.url}
        alt=""
        width={sticker.width}
        height={sticker.height}
      />
    </button>
  );
}
