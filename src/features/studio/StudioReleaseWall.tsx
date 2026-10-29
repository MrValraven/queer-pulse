import { AnimatePresence } from "motion/react";
import { useId, useState } from "react";
import { Button, Collapse, CollapseListItem } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioWallEntryView } from "./api/studioPurchases.adapters";
import { useStudioReleaseWall } from "./api/useStudioPurchaseLists";
import { StudioSupporterIdentity } from "./StudioSupporterIdentity";
import { useStudioLoadAllPages } from "./useStudioLoadAllPages";
import { useStudioFocusFirstNewRow } from "./useStudioFocusFirstNewRow";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import styles from "./StudioReleaseWall.module.css";

const WALL_AVATAR_SIZE = 48;

/** One supporter as the identity they chose. A name with no link takes the
 *  focus itself, so Show all lands on the first new entry either way. */
function StudioReleaseWallEntry({ entry }: { entry: StudioWallEntryView }) {
  const isLinked = entry.identity.href !== null;
  return (
    <CollapseListItem>
      <div
        className={styles.entry}
        tabIndex={isLinked ? undefined : -1}
        data-wall-entry={isLinked ? undefined : ""}
      >
        <StudioSupporterIdentity
          identity={entry.identity}
          size={WALL_AVATAR_SIZE}
        />
      </div>
    </CollapseListItem>
  );
}

/** "Supported by": the members who bought this release or one of its tracks
 *  and chose to appear, newest first, 24 at first. Show all reads the rest
 *  and grows the grid in place. The section stays out of the page until the
 *  first page has entries, and a failed first page leaves it out too: the
 *  wall is secondary. No entry carries an amount. */
export function StudioReleaseWall({
  releaseId,
  releaseTitle,
}: {
  releaseId: string;
  releaseTitle: string;
}) {
  const { t } = useTranslation();
  const wall = useStudioReleaseWall(releaseId, true);
  const [isShowingAll, setIsShowingAll] = useState(false);
  useStudioLoadAllPages(wall, isShowingAll, wall.items.length);
  const { listRef, footerRef, markPageRequested } = useStudioFocusFirstNewRow({
    rowCount: wall.items.length,
    hasMore: wall.hasMore,
    isSettled: !wall.isFetchingNextPage && !wall.isFetchNextPageError,
    focusSelector: "a, [data-wall-entry]",
    shouldFocusEveryPage: true,
  });
  const headingId = useId();
  const listId = useId();
  const hasEntries = wall.items.length > 0;
  const nextPageReasonKey = studioReasonCopyKey(
    studioReasonOf(wall.fetchNextPageError),
    "load",
  );
  const showAll = () => {
    markPageRequested();
    setIsShowingAll(true);
    // A failed page pauses the run; pressing again asks for it directly.
    if (wall.isFetchNextPageError) wall.fetchNextPage();
  };
  return (
    <Collapse isOpen={hasEntries}>
      <section className={styles.wall} aria-labelledby={headingId}>
        <h2 id={headingId} className={styles.heading}>
          {t("studio:wall.heading")}
        </h2>
        <ul
          id={listId}
          ref={listRef}
          className={styles.grid}
          aria-label={t("studio:wall.listLabel", { title: releaseTitle })}
        >
          <AnimatePresence>
            {wall.items.map((entry) => (
              <StudioReleaseWallEntry key={entry.key} entry={entry} />
            ))}
          </AnimatePresence>
        </ul>
        <Collapse isOpen={wall.isFetchNextPageError}>
          <p className={styles.failure} role="alert">
            {`${t("studio:wall.loadMoreFailed")}. ${t(nextPageReasonKey)}`}
          </p>
        </Collapse>
        <Collapse isOpen={wall.hasMore || wall.isFetchNextPageError}>
          <div ref={footerRef} className={styles.footer}>
            <Button
              variant="quiet"
              aria-expanded={isShowingAll}
              aria-controls={listId}
              aria-busy={wall.isFetchingNextPage}
              disabled={wall.isFetchingNextPage}
              onClick={showAll}
            >
              {t("studio:wall.showAll")}
            </Button>
          </div>
        </Collapse>
      </section>
    </Collapse>
  );
}
