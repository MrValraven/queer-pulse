import { useEffect, useId, useRef, useState } from "react";
import { FiImage, FiPlus } from "react-icons/fi";
import { Button, SkeletonLine } from "../../../shared/components/ui";
import { AdminChip, type AdminTone } from "../ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import type { PackStatus } from "./stickerBuilder.types";
import { NewStickerPackDialog } from "./NewStickerPackDialog";
import styles from "./StickerPackRail.module.css";

const STATUS_TONE: Record<PackStatus, AdminTone> = {
  draft: "plum",
  published: "jade",
  archived: "ghost",
};

const SKELETON_ROW_KEYS = [0, 1, 2];

/** The sticker that stands for a pack in the rail: its cover when the cover
 *  still resolves, else its first sticker. */
function packThumbnailSticker(
  pack: AdminStickerPackResponse,
): AdminStickerResponse | null {
  const coverSticker = pack.coverStickerId
    ? pack.stickers.find((sticker) => sticker.id === pack.coverStickerId)
    : undefined;
  return coverSticker ?? pack.stickers[0] ?? null;
}

function PackRow({
  pack,
  isSelected,
  onSelect,
}: {
  pack: AdminStickerPackResponse;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const thumbnailSticker = packThumbnailSticker(pack);
  return (
    <button
      type="button"
      className={[styles.row, isSelected && styles.rowSelected]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={isSelected}
      onClick={onSelect}
    >
      <span className={styles.thumbnail}>
        {thumbnailSticker ? (
          <img
            className={styles.thumbnailImage}
            src={thumbnailSticker.url}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <FiImage aria-hidden className={styles.thumbnailIcon} />
        )}
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowName} title={pack.name}>
          {pack.name}
        </span>
        <span className={styles.rowMeta}>
          <span className={styles.rowCount}>
            {t("admin:stickerPacks.rail.stickerCount", {
              count: pack.stickers.length,
            })}
          </span>
          <AdminChip tone={STATUS_TONE[pack.status]}>
            {t(`admin:stickerPacks.status.${pack.status}`)}
          </AdminChip>
        </span>
      </span>
    </button>
  );
}

function RailSkeleton() {
  return (
    <div className={styles.skeletonList} aria-hidden>
      {SKELETON_ROW_KEYS.map((skeletonKey) => (
        <div key={skeletonKey} className={styles.skeletonRow}>
          <SkeletonLine width={40} height={40} />
          <div className={styles.skeletonText}>
            <SkeletonLine width="70%" height={14} />
            <SkeletonLine width="45%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** When the list is a horizontal strip (the stacked layout), bring the
 *  selected chip into view. Only the strip itself scrolls, so a selection
 *  change never jumps the page. A vertical list is left alone. Smoothness
 *  comes from the list's CSS `scroll-behavior`, which honours reduced motion. */
function scrollSelectedChipIntoView(list: HTMLUListElement) {
  if (list.scrollWidth <= list.clientWidth) return;
  const selectedRow = list.querySelector('[aria-pressed="true"]');
  if (!selectedRow) return;
  const listRect = list.getBoundingClientRect();
  const rowRect = selectedRow.getBoundingClientRect();
  if (rowRect.left < listRect.left) {
    list.scrollBy({ left: rowRect.left - listRect.left });
  } else if (rowRect.right > listRect.right) {
    list.scrollBy({ left: rowRect.right - listRect.right });
  }
}

/**
 * Every sticker pack regardless of status, one pressable row each, with the
 * action that opens the New pack dialog. Selecting a row does not navigate
 * anywhere, so the row is a plain `<button>` carrying `aria-pressed`, the
 * same pattern `AdminMediaCard` uses for its card-open action.
 *
 * Beside the workspace the rail is a vertical list; when the page stacks it
 * full width, a container query on the rail turns the list into a horizontal,
 * scrollable strip of pack chips. On a load error, a forbidden response or in
 * demo mode the rail shows only its heading: the workspace states the reason
 * once. With no packs yet the rail keeps one quiet line and the workspace owns
 * the single New pack call to action. `isForbidden` stays in the props for the
 * page's shared contract; the workspace is the one that words the reason.
 */
export function StickerPackRail({
  packs,
  isLoading,
  isError,
  isDemo,
  selectedPackId,
  onSelectPack,
  onCreatePack,
  isCreatingPack,
}: {
  packs: AdminStickerPackResponse[];
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  isDemo: boolean;
  selectedPackId: string | null;
  onSelectPack: (packId: string) => void;
  onCreatePack: (body: { slug: string; name: string }) => Promise<boolean>;
  isCreatingPack: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const isUnavailable = isDemo || (isError && packs.length === 0);
  const hasSettled = !isUnavailable && !isLoading;
  const isShowingList = hasSettled && packs.length > 0;
  const isEmpty = hasSettled && packs.length === 0;
  const canCreatePack = hasSettled;

  useEffect(() => {
    if (listRef.current) scrollSelectedChipIntoView(listRef.current);
  }, [selectedPackId, packs.length]);

  return (
    <section
      className={styles.rail}
      aria-labelledby={headingId}
      aria-busy={isLoading || undefined}
    >
      <div className={styles.head}>
        <h2 id={headingId} className={styles.heading}>
          {t("admin:stickerPacks.rail.heading")}
          {isShowingList && (
            <span className={styles.headingCount}>{packs.length}</span>
          )}
        </h2>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.newButton}
            onClick={() => setIsDialogOpen(true)}
            disabled={!canCreatePack}
          >
            <FiPlus aria-hidden />
            {t("admin:stickerPacks.rail.newCta")}
          </Button>
        )}
      </div>

      {isLoading && !isUnavailable && <RailSkeleton />}

      {isEmpty && (
        <p className={styles.emptyLine}>
          {t("admin:stickerPacks.rail.emptyDescription")}
        </p>
      )}

      {isShowingList && (
        <ul ref={listRef} className={styles.list}>
          {packs.map((pack) => (
            <li key={pack.id} className={styles.item}>
              <PackRow
                pack={pack}
                isSelected={pack.id === selectedPackId}
                onSelect={() => onSelectPack(pack.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {isDialogOpen && (
        <NewStickerPackDialog
          packs={packs}
          isCreatingPack={isCreatingPack}
          onCreatePack={onCreatePack}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </section>
  );
}
