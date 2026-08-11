import { FiCheck } from "react-icons/fi";
import { ImageSlot, SkeletonLine, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyMedia } from "../settings/api/useMyMedia";
import {
  resolveMyMediaUrl,
  type MyMediaItem,
} from "../settings/api/myMedia.api";
import styles from "./AddGalleryPhotosModal.module.css";

const LOADING_SKELETON_CELLS = 6;

interface GalleryPastUploadsGridProps {
  /** Keys currently staged — drives the selected ring + check badge. */
  stagedKeys: Set<string>;
  /** False once the staged set has filled every remaining slot: staging a new
   *  item is blocked, but un-staging an already-selected one stays allowed. */
  canStageMore: boolean;
  onToggle: (item: MyMediaItem) => void;
}

/**
 * The member's own past uploads as a toggleable grid — mirrors PhotoPickerModal
 * but selects into a staged set instead of picking one and closing. Handles its
 * own loading (skeletons), error (retry), and empty states.
 */
export function GalleryPastUploadsGrid({
  stagedKeys,
  canStageMore,
  onToggle,
}: GalleryPastUploadsGridProps) {
  const { t } = useTranslation();
  const { items, isLoading, isError, refetch } = useMyMedia();

  if (isLoading) {
    return (
      <ul className={styles.grid} aria-busy="true">
        {Array.from({ length: LOADING_SKELETON_CELLS }, (_, index) => (
          <li key={index} className={styles.cell}>
            <SkeletonLine height="100%" style={{ borderRadius: 12 }} />
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className={styles.emptyState} role="alert">
        <p>{t("subprofiles:gallery.loadError")}</p>
        <Button variant="ghost" size="sm" onClick={() => void refetch()}>
          {t("subprofiles:gallery.retry")}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className={styles.emptyState}>{t("subprofiles:gallery.empty")}</p>;
  }

  return (
    <ul className={styles.grid}>
      {items.map((item) => {
        const isStaged = stagedKeys.has(item.key);
        return (
          <li key={item.key} className={styles.cell}>
            <button
              type="button"
              className={[styles.thumbBtn, isStaged && styles.thumbSelected]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isStaged}
              aria-label={t(
                isStaged
                  ? "subprofiles:gallery.deselectPhoto"
                  : "subprofiles:gallery.selectPhoto",
              )}
              onClick={() => onToggle(item)}
              disabled={!isStaged && !canStageMore}
            >
              <ImageSlot
                tint="coral"
                src={resolveMyMediaUrl(item.fileUrl)}
                initials=""
                width="100%"
                height="100%"
                radius={12}
                srcSize={220}
              />
              {isStaged && (
                <span className={styles.check} aria-hidden>
                  <FiCheck size={14} />
                </span>
              )}
            </button>
            {item.inUse && (
              <span className={styles.inUse}>
                {t("subprofiles:gallery.inUse")}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
