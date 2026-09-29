import { FiSearch, FiX } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminMediaCard } from "./AdminMediaCard";
import type {
  AdminMediaObject,
  AdminMediaUploader,
} from "./api/adminMedia.api";
import type { AdminMediaUsage } from "./adminMediaUsage";
import styles from "./AdminMediaPage.module.css";

/**
 * The console's main content region: demo/loading/error/scanning states, the
 * two different "nothing here" answers a usage filter can produce, and the
 * loaded object grid with its load-more control.
 */
export function AdminMediaGrid({
  isDemo,
  isLoading,
  isError,
  isScanningForMatches,
  isUsageScanIncomplete,
  objects,
  visibleObjects,
  usage,
  uploaderFilter,
  hasNextPage,
  isFetchingNextPage,
  onRefetch,
  onFetchNextPage,
  onOpen,
  onFilterByUploader,
}: {
  isDemo: boolean;
  isLoading: boolean;
  isError: boolean;
  isScanningForMatches: boolean;
  isUsageScanIncomplete: boolean;
  objects: AdminMediaObject[];
  visibleObjects: AdminMediaObject[];
  usage: AdminMediaUsage;
  uploaderFilter: AdminMediaUploader | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onRefetch: () => void;
  onFetchNextPage: () => void;
  onOpen: (object: AdminMediaObject) => void;
  onFilterByUploader: (uploader: AdminMediaUploader) => void;
}) {
  const { t } = useTranslation();

  if (isDemo) {
    return (
      <EmptyState
        icon={<FiSearch />}
        title={t("admin:media.demo.title")}
        description={t("admin:media.demo.body")}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={styles.grid} aria-busy="true">
        {Array.from({ length: 8 }).map((_, skeletonIndex) => (
          <SkeletonLine key={skeletonIndex} height={160} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<FiX />}
        title={t("common:error.title")}
        description={t("common:error.description")}
        action={{
          label: t("common:error.retry"),
          onClick: onRefetch,
        }}
      />
    );
  }

  if (isScanningForMatches) {
    return (
      <>
        <p className={styles.scanNote} role="status">
          {t("admin:media.usage.scanning", { count: objects.length })}
        </p>
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 4 }).map((_, skeletonIndex) => (
            <SkeletonLine key={skeletonIndex} height={160} />
          ))}
        </div>
      </>
    );
  }

  if (visibleObjects.length === 0) {
    // Three different "nothing here" answers, and only one of them is
    // final. With pages left unscanned the honest answer is "no match in
    // what's loaded", with the load-more button as the way to keep going
    // (and as the manual retry after a failed page fetch).
    return isUsageScanIncomplete ? (
      <EmptyState
        icon={<FiSearch />}
        title={t("admin:media.usage.noMatchYet")}
        description={t("admin:media.usage.scannedNote", {
          count: objects.length,
        })}
        action={{
          label: t("admin:media.loadMore"),
          onClick: onFetchNextPage,
        }}
      />
    ) : (
      <EmptyState
        icon={<FiSearch />}
        title={
          usage === "all"
            ? t("admin:media.empty.title")
            : t(`admin:media.usage.empty.${usage}.title`)
        }
        description={
          usage !== "all"
            ? t(`admin:media.usage.empty.${usage}.body`)
            : uploaderFilter
              ? t("admin:media.filterByUploader.emptyForUser", {
                  name: uploaderFilter.displayName,
                })
              : t("admin:media.empty.body")
        }
      />
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {visibleObjects.map((object) => (
          <AdminMediaCard
            key={object.key}
            object={object}
            onOpen={onOpen}
            onFilterByUploader={onFilterByUploader}
          />
        ))}
      </div>
      {hasNextPage && (
        <div className={styles.loadMore}>
          {usage !== "all" && (
            <p className={styles.scanNote}>
              {t("admin:media.usage.scannedNote", { count: objects.length })}
            </p>
          )}
          <Button
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={onFetchNextPage}
          >
            {isFetchingNextPage
              ? t("shared:loading.label")
              : t("admin:media.loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}
