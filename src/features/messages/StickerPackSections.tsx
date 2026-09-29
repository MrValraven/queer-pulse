// src/features/messages/StickerPackSections.tsx
import type {
  StickerPackResponse,
  StickerResponse,
} from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { stickerPackNameIn } from "../stickers/stickerLocale";
import { StickerTile } from "./StickerTile";
import styles from "./StickerPicker.module.css";

interface StickerPackSectionsProps {
  recentStickers: StickerResponse[];
  /** Only packs with at least one sticker (see `StickerPicker`). */
  packs: StickerPackResponse[];
  registerSection: (packId: string, node: HTMLDivElement | null) => void;
  onPick: (sticker: StickerResponse) => void;
}

/** The picker's browsing view: recently used stickers first, then one
 *  section per pack headed by its name in the reader's language. Each pack
 *  section registers with the scroll spy so the rail can jump to it. */
export function StickerPackSections({
  recentStickers,
  packs,
  registerSection,
  onPick,
}: StickerPackSectionsProps) {
  const { t, language } = useTranslation();
  return (
    <>
      {recentStickers.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionHeader}>
            {t("messages:sticker.recentsLabel")}
          </p>
          <div
            className={styles.grid}
            role="group"
            aria-label={t("messages:sticker.recentsLabel")}
          >
            {recentStickers.map((sticker) => (
              <StickerTile key={sticker.id} sticker={sticker} onPick={onPick} />
            ))}
          </div>
        </div>
      )}
      {packs.map((pack) => {
        const packName = stickerPackNameIn(pack, language);
        return (
          <div
            key={pack.id}
            className={styles.section}
            ref={(node) => registerSection(pack.id, node)}
          >
            <p className={styles.sectionHeader}>{packName}</p>
            <div className={styles.grid} role="group" aria-label={packName}>
              {pack.stickers.map((sticker) => (
                <StickerTile
                  key={sticker.id}
                  sticker={sticker}
                  onPick={onPick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
