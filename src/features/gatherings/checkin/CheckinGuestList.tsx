import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Button,
  LoadMoreButton,
  SkeletonAvatar,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AttendeeRow } from "../api/events.adapters";
import type { AttendeePagesResult } from "../api/useAttendeePages";
import { EASE, keepOnFrameLoop } from "./checkinMotion";
import { CheckinGuestRow } from "./CheckinGuestRow";
import styles from "./CheckinGuestList.module.css";

const REDUCED_FADE = { duration: 0.12 } as const;
const REDUCED_ROW_EXIT = { opacity: 0, transition: REDUCED_FADE } as const;
/**
 * A leaving row fades out where it stands, then its empty space closes, so
 * the rows below move up once and nothing of it shows over them. The clip
 * takes the root's zero duration, so it is on from the first frame.
 */
const ROW_EXIT = {
  opacity: 0,
  height: 0,
  overflow: "hidden",
  transition: {
    duration: 0,
    opacity: { duration: 0.12, ease: EASE },
    height: { delay: 0.1, duration: 0.22, ease: EASE },
  },
} as const;
/**
 * `ROW_EXIT` run backwards: an arriving row opens its space first, then fades
 * in, so the rows around it move down once in flow. The fold timing matches
 * the exit fold, so a row leaving one group and its twin arriving in the other
 * close and open in step. Overflow is clipped only while the row opens, so
 * focus rings and the hover wash show at rest.
 */
const ROW_ENTER = {
  initial: { opacity: 0, height: 0, overflow: "hidden" },
  animate: {
    opacity: 1,
    height: "auto",
    transitionEnd: { overflow: "visible" },
    transition: {
      height: { duration: 0.22, ease: EASE },
      opacity: { delay: 0.1, duration: 0.18, ease: EASE },
    },
  },
} as const;
const SKELETON_ROW_KEYS = ["first", "second", "third"] as const;

/** What every row in either group needs from the page. */
export interface CheckinRowContext {
  canCheckIn: boolean;
  pendingSlugs: ReadonlySet<string>;
  onCheckIn: (memberSlug: string) => void;
  onUndo: (memberSlug: string) => void;
  onShowDetails: (memberSlug: string) => void;
}

interface CheckinGuestListProps {
  /** The rows to show, already split for the linger. */
  rows: AttendeeRow[];
  /** The group's paged query, for its loading state and "Load more". */
  pages: AttendeePagesResult;
  rowContext: CheckinRowContext;
  /** Shown under the list when it has no rows and is not loading. */
  emptyMessage?: ReactNode;
}

function GuestListSkeleton() {
  return (
    <div aria-hidden>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={styles.skeletonRow}>
          <SkeletonAvatar size={38} />
          <div className={styles.skeletonLines}>
            <SkeletonLine width="45%" />
            <SkeletonLine width="25%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * One group's rows. A row leaving the group fades where it stands and then
 * folds shut; a row arriving folds open and then fades in. Heights change
 * continuously, so neighbours and the other group's heading move in normal
 * flow and nothing passes over another row.
 */
export function CheckinGuestList({
  rows,
  pages,
  rowContext,
  emptyMessage,
}: CheckinGuestListProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isFirstLoad = pages.isLoading && rows.length === 0;
  // A failed load only replaces an empty list: rows already shown stay.
  const isLoadFailed = pages.isLoadError && rows.length === 0;

  return (
    <>
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {rows.map((attendee) => (
            <m.li
              key={attendee.slug}
              className={styles.item}
              onUpdate={keepOnFrameLoop}
              initial={reducedMotion ? { opacity: 0 } : ROW_ENTER.initial}
              animate={
                reducedMotion
                  ? { opacity: 1, transition: REDUCED_FADE }
                  : ROW_ENTER.animate
              }
              exit={reducedMotion ? REDUCED_ROW_EXIT : ROW_EXIT}
            >
              <CheckinGuestRow
                attendee={attendee}
                isPending={rowContext.pendingSlugs.has(attendee.slug)}
                canCheckIn={rowContext.canCheckIn}
                onCheckIn={rowContext.onCheckIn}
                onUndo={rowContext.onUndo}
                onShowDetails={rowContext.onShowDetails}
              />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      {isFirstLoad && <GuestListSkeleton />}
      {isLoadFailed && (
        <div className={styles.loadError} role="alert">
          <p className={styles.loadErrorText}>
            {t("gatherings:door.failedToast")}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={pages.retry}>
            {t("common:error.retry")}
          </Button>
        </div>
      )}
      {!pages.isLoading && !isLoadFailed && rows.length === 0 && emptyMessage}
      {(pages.hasMore || pages.isLoadMoreError) && (
        <div className={styles.loadMoreRow} data-load-more>
          <LoadMoreButton
            isFetchingNextPage={pages.isFetchingMore}
            isFetchNextPageError={pages.isLoadMoreError}
            onLoadMore={pages.loadMore}
            label={t("gatherings:manage.attendees.loadMoreCta")}
            loadingLabel={t("gatherings:manage.attendees.loadingMore")}
          />
        </div>
      )}
    </>
  );
}
