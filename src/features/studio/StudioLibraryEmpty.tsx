import { FiBookmark, FiSearch } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLoadState } from "./api/studioLoadState";
import type { StudioLibrarySort } from "./studioLibrarySort.data";
import { studioReasonCopyKey } from "./studioReason";
import css from "./StudioLibrary.module.css";

/** What every Library tab gets from the page: the filter and the sort. */
export interface StudioLibraryListProps {
  query: string;
  sort: StudioLibrarySort;
  onClearQuery: () => void;
}

export function LibraryEmpty({
  titleKey,
  bodyKey,
  onCreatePlaylist,
}: {
  titleKey: string;
  bodyKey: string;
  onCreatePlaylist?: () => void;
}) {
  const { t } = useTranslation();
  const browseAction = {
    label: t("studio:library.empty.browseCta"),
    to: routes.studio,
  };
  return (
    <EmptyState
      icon={<FiBookmark />}
      title={t(titleKey)}
      description={t(bodyKey)}
      headingLevel={2}
      action={
        onCreatePlaylist
          ? {
              label: t("studio:libraryLive.newPlaylistCta"),
              onClick: onCreatePlaylist,
            }
          : browseAction
      }
      secondaryAction={onCreatePlaylist ? browseAction : undefined}
    />
  );
}

/** Nothing in this tab matches the filter: say what was typed and offer to
 *  clear it. */
export function LibraryNoMatches({
  query,
  onClearQuery,
}: {
  query: string;
  onClearQuery: () => void;
}) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiSearch />}
      title={t("studio:libraryLive.noMatches.title", { query: query.trim() })}
      description={t("studio:libraryLive.noMatches.body")}
      headingLevel={2}
      action={{
        label: t("studio:libraryLive.clearFilterCta"),
        onClick: onClearQuery,
      }}
    />
  );
}

/** The first page of saves failed while the store still shows the newest
 *  ones: a quiet line under the cards with the reason and a Retry.
 *  `aria-disabled` keeps focus on Retry while it runs. */
export function LibrarySavesError({
  loadState,
}: {
  loadState: StudioLoadState;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.savesError} role="status">
      <p className={css.savesErrorText}>
        {t("studio:libraryLive.olderSavesError")}{" "}
        {t(studioReasonCopyKey(loadState.reason ?? "unknown", "load"))}
      </p>
      <Button
        type="button"
        variant="quiet"
        size="sm"
        aria-disabled={loadState.isRetrying || undefined}
        onClick={() => {
          if (!loadState.isRetrying) loadState.retry();
        }}
      >
        {loadState.isRetrying
          ? t("shared:loadError.retryingCta")
          : t("common:error.retry")}
      </Button>
    </div>
  );
}
