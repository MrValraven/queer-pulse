// src/features/messages/StickerSearchResults.tsx
import type { StickerResponse } from "../../shared/contracts/contracts";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StickerTile } from "./StickerTile";
import styles from "./StickerPicker.module.css";

interface StickerSearchResultsProps {
  query: string;
  results: StickerResponse[];
  onPick: (sticker: StickerResponse) => void;
  /** Empties the query and puts focus back in the search field. */
  onClearSearch: () => void;
}

/** A live search's one section: every matching sticker across packs in one
 *  grid, or a line saying nothing matched with a way back to browsing. It
 *  replaces the recents and the pack sections while the query holds text. */
export function StickerSearchResults({
  query,
  results,
  onPick,
  onClearSearch,
}: StickerSearchResultsProps) {
  const { t } = useTranslation();
  if (results.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          {t("messages:sticker.searchEmpty", { query: query.trim() })}
        </p>
        <Button variant="ghost" size="sm" onClick={onClearSearch}>
          {t("messages:sticker.clearSearch")}
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.section}>
      <p className={styles.sectionHeader}>
        {t("messages:sticker.searchResultsLabel")}
      </p>
      <div
        className={styles.grid}
        role="group"
        aria-label={t("messages:sticker.searchResultsLabel")}
      >
        {results.map((sticker) => (
          <StickerTile key={sticker.id} sticker={sticker} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}
