import { AnimatePresence } from "motion/react";
import { MeasuredHeightFrame } from "../../../shared/components/layout/MeasuredHeightFrame";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import { useMusicEventList } from "./api/useMusicEvents";
import type { MusicEventBucket } from "./api/musicEvents.types";
import { AdminMusicEventsListView } from "./AdminMusicEventsListView";
import { musicEventListViewName } from "./musicEventListView";
import styles from "./AdminMusicEvents.module.css";

/**
 * One bucket of house music events. The list is a single view per bucket and
 * state (loading, a failed first page, empty, rows): a change of either fades
 * the old view out and the new one in while the panel eases once from the
 * old height to the new, so a tab switch reads as one motion. A failed later
 * page keeps the loaded rows and turns the footer into a retry. The list
 * pages only on a press of Show more events; those rows fade in and the
 * panel eases to the longer list.
 */
export function AdminMusicEventsList({ bucket }: { bucket: MusicEventBucket }) {
  const list = useMusicEventList(bucket);
  const viewName = musicEventListViewName(list);

  return (
    <MeasuredHeightFrame>
      <div className={styles.viewStage}>
        <AnimatePresence mode="popLayout" initial={false}>
          <ViewFade key={`${bucket}:${viewName}`}>
            <AdminMusicEventsListView
              viewName={viewName}
              bucket={bucket}
              list={list}
            />
          </ViewFade>
        </AnimatePresence>
      </div>
    </MeasuredHeightFrame>
  );
}
