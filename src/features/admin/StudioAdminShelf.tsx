import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioCurationShelf } from "../studio/api/studio.types";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import { StudioAdminNoteDialog } from "./StudioAdminNoteDialog";
import { StudioAdminPickDialog } from "./StudioAdminPickDialog";
import { StudioAdminPickTile } from "./StudioAdminPickTile";
import {
  StudioAdminAddTile,
  StudioAdminGhostSleeve,
  StudioAdminShelfMeter,
} from "./StudioAdminShelfParts";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import { useStudioAdminShelfActions } from "./useStudioAdminShelfActions";
import {
  movedIds,
  shelfMaxOf,
  STUDIO_ADMIN_SHELF_ADD_KEY,
} from "./studioAdmin.model";
import css from "./StudioAdminShelves.module.css";

/** The empty slots that stand in for picks on an empty shelf: enough to
 *  fill the widest row (six columns at the console's 1240px cap), and the
 *  grid clips whatever wraps past the first row. */
const GHOST_SLEEVE_IDS = [
  "ghost-1",
  "ghost-2",
  "ghost-3",
  "ghost-4",
  "ghost-5",
];

/** A list shelf (Staff picks, New this week): its title, count and slot
 *  meter, then one grid of record sleeves in order with the add tile last,
 *  and its two dialogs. The ordered list holds the picks alone; the add
 *  tile and the empty slots sit beside it in the same grid. The featured
 *  slot has its own card. */
export function StudioAdminShelf({
  shelf,
  picks,
}: {
  shelf: Exclude<StudioCurationShelf, "featured">;
  picks: AdminStudioPickDTO[];
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const {
    shelfLabel,
    isBusy,
    reorder,
    toastError,
    removePick,
    noteTarget,
    openNote,
    closeNote,
  } = useStudioAdminShelfActions(shelf);
  const [isAdding, setIsAdding] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const max = shelfMaxOf(shelf);
  const isFull = picks.length >= max;
  const isEmpty = picks.length === 0;
  // The grid keeps its one-row clip until the empty slots have faded out,
  // so the slots past the first row never show while the first pick lands.
  const [isGhostRowShown, setIsGhostRowShown] = useState(isEmpty);
  if (isEmpty && !isGhostRowShown) setIsGhostRowShown(true);
  const takenReleaseIds = useMemo(
    () => picks.map((pick) => pick.release.id),
    [picks],
  );

  function move(pick: AdminStudioPickDTO, targetIndex: number) {
    const pickIds = movedIds(
      picks.map((candidate) => candidate.id),
      pick.id,
      targetIndex,
    );
    if (!pickIds || isBusy) return;
    reorder.mutate(
      { shelf, pickIds },
      {
        onSuccess: () =>
          setStatusMessage(
            t("admin:studioAdmin.moved", {
              name: pick.release.title,
              position: targetIndex + 1,
            }),
          ),
        onError: toastError,
      },
    );
  }

  function remove(pick: AdminStudioPickDTO) {
    const removedIndex = picks.indexOf(pick);
    removePick(pick, () =>
      focusNeighbourControl({
        list: listRef.current,
        index: removedIndex,
        findControl: (row) =>
          row.querySelector<HTMLElement>("[data-pick-remove]"),
        fallback: headingRef.current,
      }),
    );
  }

  return (
    <section className={css.shelf} aria-labelledby={headingId}>
      <header className={css.shelfHead}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={css.shelfTitle}
        >
          {shelfLabel}
        </h2>
        <span className={css.shelfCapacity}>
          <span className={css.shelfCount}>
            {t("admin:studioAdmin.shelf.count", { count: picks.length, max })}
          </span>
          <StudioAdminShelfMeter count={picks.length} max={max} />
        </span>
      </header>
      <Collapse isOpen={isEmpty}>
        <p className={css.shelfHint}>
          <span className={css.shelfHintLead}>
            {t("admin:studioAdmin.shelf.empty")}
          </span>
          <span>{t("admin:studioAdmin.shelf.emptyBody")}</span>
        </p>
      </Collapse>
      <div className={css.grid} data-empty={isGhostRowShown || undefined}>
        <ol ref={listRef} className={css.gridList}>
          <AnimatePresence initial={false}>
            {picks.map((pick, index) => (
              <StudioAdminPickTile
                key={pick.id}
                pick={pick}
                shelf={shelf}
                index={index}
                count={picks.length}
                shelfLabel={shelfLabel}
                isBusy={isBusy}
                onMove={(targetIndex) => move(pick, targetIndex)}
                onDropAt={(draggedId) => {
                  const dragged = picks.find(
                    (candidate) => candidate.id === draggedId,
                  );
                  if (dragged) move(dragged, index);
                }}
                onEditNote={() => openNote(pick)}
                onRemove={() => remove(pick)}
              />
            ))}
          </AnimatePresence>
        </ol>
        <StudioAdminAddTile
          addLabel={t(STUDIO_ADMIN_SHELF_ADD_KEY[shelf])}
          fullLabel={t("admin:studioAdmin.shelf.full")}
          isFull={isFull}
          onAdd={() => setIsAdding(true)}
        />
        <AnimatePresence
          initial={false}
          onExitComplete={() => setIsGhostRowShown(false)}
        >
          {isEmpty &&
            GHOST_SLEEVE_IDS.map((ghostId, ghostIndex) => (
              <StudioAdminGhostSleeve key={ghostId} ghostIndex={ghostIndex} />
            ))}
        </AnimatePresence>
      </div>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <AnimatePresence>
        {isAdding && (
          <StudioAdminPickDialog
            shelf={shelf}
            takenReleaseIds={takenReleaseIds}
            onClose={() => setIsAdding(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {noteTarget && (
          <StudioAdminNoteDialog pick={noteTarget} onClose={closeNote} />
        )}
      </AnimatePresence>
    </section>
  );
}
