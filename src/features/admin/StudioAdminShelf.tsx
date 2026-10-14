import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioCurationShelf } from "../studio/api/studio.types";
import {
  useRemoveAdminStudioPick,
  useReorderAdminStudioPicks,
} from "./api/StudioAdminCurationHooks";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import { StudioAdminNoteDialog } from "./StudioAdminNoteDialog";
import { StudioAdminPickDialog } from "./StudioAdminPickDialog";
import { StudioAdminPickRow } from "./StudioAdminPickRow";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import {
  movedIds,
  shelfMaxOf,
  STUDIO_ADMIN_SHELF_ADD_KEY,
  STUDIO_ADMIN_SHELF_LABEL_KEY,
  studioAdminSaveErrorKeyOf,
} from "./studioAdmin.model";
import css from "./StudioAdminPage.module.css";

/** One shelf: its count and add button, its picks in order (drag handle,
 *  Move up, Move down, Edit note, Remove pick), and its two dialogs. */
export function StudioAdminShelf({
  shelf,
  picks,
}: {
  shelf: StudioCurationShelf;
  picks: AdminStudioPickDTO[];
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const reorder = useReorderAdminStudioPicks();
  const remove = useRemoveAdminStudioPick();
  const [isAdding, setIsAdding] = useState(false);
  const [noteTarget, setNoteTarget] = useState<AdminStudioPickDTO | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const max = shelfMaxOf(shelf);
  const isFull = shelf !== "featured" && picks.length >= max;
  const shelfLabel = t(STUDIO_ADMIN_SHELF_LABEL_KEY[shelf]);
  const isBusy = reorder.isPending || remove.isPending;

  const toastError = (cause: unknown) =>
    showToast(t(studioAdminSaveErrorKeyOf(cause)), "error");

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

  function removePick(pick: AdminStudioPickDTO) {
    if (isBusy) return;
    const removedIndex = picks.indexOf(pick);
    remove.mutate(
      { pick },
      {
        onSuccess: () => {
          showToast(
            t("admin:studioAdmin.toast.pickRemoved", {
              title: pick.release.title,
              shelf: shelfLabel,
            }),
            "success",
          );
          focusNeighbourControl({
            list: listRef.current,
            index: removedIndex,
            findControl: (row) =>
              row.querySelector<HTMLElement>("[data-pick-remove]"),
            fallback: headingRef.current,
          });
        },
        onError: toastError,
      },
    );
  }

  return (
    <section className={css.shelf} aria-labelledby={headingId}>
      <div className={css.shelfHead}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={css.shelfTitle}
        >
          {shelfLabel}
        </h2>
        <span className={css.shelfCount}>
          {t("admin:studioAdmin.shelf.count", { count: picks.length, max })}
        </span>
        <Button
          variant="primary"
          size="sm"
          aria-disabled={isFull || undefined}
          onClick={() => {
            if (!isFull) setIsAdding(true);
          }}
        >
          {t(STUDIO_ADMIN_SHELF_ADD_KEY[shelf])}
        </Button>
      </div>
      <Collapse isOpen={isFull}>
        <p className={css.hint}>{t("admin:studioAdmin.shelf.full")}</p>
      </Collapse>
      <Collapse isOpen={picks.length === 0}>
        <p className={css.hint}>{t("admin:studioAdmin.shelf.empty")}</p>
      </Collapse>
      <ol ref={listRef} className={css.pickList}>
        <AnimatePresence initial={false}>
          {picks.map((pick, index) => (
            <StudioAdminPickRow
              key={pick.id}
              pick={pick}
              index={index}
              count={picks.length}
              isSingleSlot={max === 1}
              shelfLabel={shelfLabel}
              isBusy={isBusy}
              onMove={(targetIndex) => move(pick, targetIndex)}
              onDropAt={(draggedId) => {
                const dragged = picks.find(
                  (candidate) => candidate.id === draggedId,
                );
                if (dragged) move(dragged, index);
              }}
              onEditNote={() => setNoteTarget(pick)}
              onRemove={() => removePick(pick)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <AnimatePresence>
        {isAdding && (
          <StudioAdminPickDialog
            shelf={shelf}
            takenReleaseIds={picks.map((pick) => pick.release.id)}
            onClose={() => setIsAdding(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {noteTarget && (
          <StudioAdminNoteDialog
            pick={noteTarget}
            onClose={() => setNoteTarget(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
