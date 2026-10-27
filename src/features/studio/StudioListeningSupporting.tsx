import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSupportingView } from "./api/studioListening.adapters";
import { useStudioListeningSupporting } from "./api/useStudioListening";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import { StudioListeningSupportingRow } from "./StudioListeningSupportingRow";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioLine } from "./StudioSkeletons";
import styles from "./StudioListeningLists.module.css";

const SKELETON_ROW_COUNT = 2;
const EMPTY_ROWS: StudioSupportingView[] = [];

function StudioListeningSupportingSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <StudioLine width={48} height={48} />
          <div className={styles.skeletonText}>
            <StudioLine width="40%" height={14} />
            <StudioLine width="60%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface RemovedRow {
  artistId: string;
  index: number;
}

/** After Stop supporting, the pressed button leaves with its row. Focus
 *  moves to the link of the row that took its place (the new last row when
 *  it was the last), or to the heading once no row remains. The list may
 *  refresh before or after the removal reports back, so both paths check. */
function useFocusAfterRemoval(rows: StudioSupportingView[]) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const latestRowsRef = useRef(rows);
  const removedRef = useRef<RemovedRow | null>(null);
  const focusIfGone = useCallback((currentRows: StudioSupportingView[]) => {
    const removed = removedRef.current;
    if (!removed) return;
    if (currentRows.some((row) => row.artist.id === removed.artistId)) return;
    removedRef.current = null;
    const nextRow =
      currentRows[Math.min(Math.max(removed.index, 0), currentRows.length - 1)];
    const rowElements = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[data-supporting-id]") ??
        [],
    );
    const nextLink = rowElements
      .find((element) => element.dataset.supportingId === nextRow?.artist.id)
      ?.querySelector<HTMLElement>("[data-supporting-link]");
    (nextLink ?? headingRef.current)?.focus();
  }, []);
  useEffect(() => {
    latestRowsRef.current = rows;
    focusIfGone(rows);
  }, [rows, focusIfGone]);
  const [announcement, setAnnouncement] = useState("");
  const { t } = useTranslation();
  const onRemoved = useCallback(
    (artistId: string, index: number, artistName: string) => {
      removedRef.current = { artistId, index };
      setAnnouncement(t("studio:supporter.removed", { persona: artistName }));
      focusIfGone(latestRowsRef.current);
    },
    [focusIfGone, t],
  );
  return { headingRef, listRef, onRemoved, announcement };
}

/** "Artists you support": every artist the listener chose to show
 *  themselves to, newest first, with how that artist sees them. */
export function StudioListeningSupporting() {
  const { t } = useTranslation();
  const { items, loadState } = useStudioListeningSupporting();
  const headingId = useId();
  const rows = items ?? EMPTY_ROWS;
  const { headingRef, listRef, onRemoved, announcement } =
    useFocusAfterRemoval(rows);
  const { isOn, isAwaitingRow } = useStudioListeningHistorySwitch();
  const hasItems = rows.length > 0;
  const isEmpty =
    items !== null && !hasItems && !loadState.isLoading && !loadState.isError;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2
        ref={headingRef}
        id={headingId}
        className={styles.heading}
        tabIndex={-1}
      >
        {t("studio:listening.supporting.heading")}
      </h2>
      <p className={styles.dek}>{t("studio:listening.supporting.dek")}</p>
      <Collapse isOpen={!isOn && !isAwaitingRow}>
        <p className={styles.dek}>
          {t("studio:listening.supporting.pausedNote")}
        </p>
      </Collapse>
      <p role="status" className="visuallyHidden">
        {announcement}
      </p>
      <Collapse isOpen={loadState.isLoading}>
        <StudioListeningSupportingSkeleton />
      </Collapse>
      <Collapse isOpen={!hasItems && loadState.isError}>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.supporting"
        />
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <p className={styles.empty}>{t("studio:listening.supporting.empty")}</p>
      </Collapse>
      <Collapse isOpen={hasItems}>
        <ul
          ref={listRef}
          className={styles.list}
          aria-label={t("studio:listening.supporting.heading")}
        >
          <AnimatePresence>
            {rows.map((supporting, index) => (
              <StudioListeningSupportingRow
                key={supporting.artist.id}
                supporting={supporting}
                index={index}
                onRemoved={onRemoved}
              />
            ))}
          </AnimatePresence>
        </ul>
      </Collapse>
    </section>
  );
}
