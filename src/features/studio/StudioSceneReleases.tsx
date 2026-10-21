import { useId, type ReactNode } from "react";
import { FiMusic } from "react-icons/fi";
import {
  Collapse,
  EmptyState,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleasesResult } from "./api/useStudioReleases";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** The scene's releases with their own skeleton, empty and Retry states; a
 *  failed Show more keeps the loaded cards. */
export function StudioSceneReleases({
  releasesResult,
  sceneName,
}: {
  releasesResult: StudioReleasesResult;
  sceneName: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const {
    releases,
    loadState,
    hasMore,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = releasesResult;
  let body: ReactNode;
  if (loadState.isError)
    body = (
      <StudioLoadError
        loadState={loadState}
        what="studio:errors.what.sceneReleases"
      />
    );
  else if (loadState.isLoading)
    body = <StudioCardGridSkeleton count={8} className={styles.rowGrid} />;
  else if (releases.length === 0)
    body = (
      <EmptyState
        icon={<FiMusic />}
        title={t("studio:scene.empty.title")}
        description={t("studio:scene.empty.body")}
        headingLevel={3}
      />
    );
  else
    body = (
      <div
        className={styles.rowGrid}
        role="group"
        aria-label={t("studio:scene.releases.gridLabel", { name: sceneName })}
      >
        {releases.map((release) => (
          <StudioReleaseCard key={release.id} release={release} />
        ))}
      </div>
    );
  return (
    <section className={styles.row} aria-labelledby={headingId}>
      <div className={styles.rowH}>
        <h2 id={headingId}>
          <Translation
            i18nKey="studio:scene.releases.title"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      {body}
      <Collapse isOpen={hasMore || isFetchNextPageError}>
        <div className={kit.moreFooter}>
          <LoadMoreFooter
            isFetchingNextPage={isFetchingNextPage}
            isFetchNextPageError={isFetchNextPageError}
            onLoadMore={fetchNextPage}
            label={t("studio:home.newReleases.showMore")}
            loadingLabel={t("studio:home.newReleases.loadingMore")}
            errorMessage={t("studio:home.newReleases.loadMoreError")}
          />
        </div>
      </Collapse>
    </section>
  );
}
