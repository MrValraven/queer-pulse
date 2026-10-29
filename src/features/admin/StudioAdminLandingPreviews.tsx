import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LANDING_LIMITS } from "../studio/api/studio.types";
import {
  useRemoveLandingPreview,
  useReorderLandingPreviews,
} from "./api/useStudioAdminLandingMutations";
import type {
  AdminStudioLandingDTO,
  AdminStudioLandingPreviewDTO,
} from "./api/studioLandingAdmin.api";
import { movedIds, studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { StudioAdminLandingOpenPreviewRow } from "./StudioAdminLandingOpenPreviewRow";
import { StudioAdminLandingPreviewHistory } from "./StudioAdminLandingPreviewHistory";
import { StudioAdminLandingPreviewRemoveDialog } from "./StudioAdminLandingPreviewRemoveDialog";
import { StudioAdminLandingTrackDialog } from "./StudioAdminLandingTrackDialog";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import css from "./StudioAdminLanding.module.css";

const isOpenPreview = (preview: AdminStudioLandingPreviewDTO) =>
  preview.status === "pending" || preview.status === "approved";

/** Hear it first: the tracks staff asked artists to play on the Studio page.
 *  Open requests reorder; answered ones sit behind a toggle. */
export function StudioAdminLandingPreviews({
  landing,
}: {
  landing: AdminStudioLandingDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const fullLineId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openListRef = useRef<HTMLOListElement>(null);
  const reorder = useReorderLandingPreviews();
  const remove = useRemoveLandingPreview();
  const [isAsking, setIsAsking] = useState(false);
  const [removeTarget, setRemoveTarget] =
    useState<AdminStudioLandingPreviewDTO | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const openPreviews = landing.previews.filter(isOpenPreview);
  const answeredPreviews = landing.previews.filter(
    (preview) => !isOpenPreview(preview),
  );
  const isFull = openPreviews.length >= STUDIO_LANDING_LIMITS.openPreviewsMax;
  const isBusy = reorder.isPending || remove.isPending;

  /** The action line paired with the reason the server gave. */
  const toastError = (cause: unknown) => {
    const reasonKey = studioAdminSaveErrorKeyOf(cause);
    const isGeneric = reasonKey === "admin:studioAdmin.saveError";
    showToast(
      isGeneric
        ? t(reasonKey)
        : `${t("admin:studioAdmin.landing.saveFailed")}: ${t(reasonKey)}`,
      "error",
    );
  };

  function move(preview: AdminStudioLandingPreviewDTO, targetIndex: number) {
    const previewIds = movedIds(
      openPreviews.map((candidate) => candidate.id),
      preview.id,
      targetIndex,
    );
    if (!previewIds || isBusy) return;
    reorder.mutate(
      { previewIds },
      {
        onSuccess: () =>
          setStatusMessage(
            t("admin:studioAdmin.moved", {
              name: preview.track.title,
              position: targetIndex + 1,
            }),
          ),
        onError: toastError,
      },
    );
  }

  function confirmRemove() {
    const target = removeTarget;
    if (!target || remove.isPending) return;
    const removedIndex = openPreviews.indexOf(target);
    remove.mutate(
      { previewId: target.id },
      {
        onSuccess: () => {
          setRemoveTarget(null);
          showToast(
            t("admin:studioAdmin.landing.previews.removed", {
              track: target.track.title,
            }),
            "success",
          );
          focusNeighbourControl({
            list: removedIndex >= 0 ? openListRef.current : null,
            index: removedIndex,
            findControl: (row) =>
              row.querySelector<HTMLElement>("[data-preview-remove]"),
            fallback: headingRef.current,
          });
        },
        onError: (cause) => {
          setRemoveTarget(null);
          toastError(cause);
        },
      },
    );
  }

  return (
    <section className={css.section} aria-labelledby={headingId}>
      <div className={css.sectionHead}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={css.sectionTitle}
        >
          {t("admin:studioAdmin.landing.previews.heading")}
        </h2>
        <Button
          variant="primary"
          size="sm"
          aria-disabled={isFull || undefined}
          aria-describedby={isFull ? fullLineId : undefined}
          onClick={() => {
            if (!isFull) setIsAsking(true);
          }}
        >
          {t("admin:studioAdmin.landing.previews.addCta")}
        </Button>
      </div>
      <p className={css.sectionSub}>
        {t("admin:studioAdmin.landing.previews.sub")}
      </p>
      <Collapse isOpen={isFull}>
        <p id={fullLineId} className={css.hint}>
          {t("admin:studioAdmin.landing.previews.full")}
        </p>
      </Collapse>
      <Collapse isOpen={openPreviews.length === 0}>
        <p className={css.hint}>
          {t("admin:studioAdmin.landing.previews.empty")}
        </p>
      </Collapse>
      <ol ref={openListRef} className={css.list}>
        <AnimatePresence initial={false}>
          {openPreviews.map((preview, index) => (
            <StudioAdminLandingOpenPreviewRow
              key={preview.id}
              preview={preview}
              index={index}
              count={openPreviews.length}
              isBusy={isBusy}
              onMove={(targetIndex) => move(preview, targetIndex)}
              onDropAt={(draggedId) => {
                const dragged = openPreviews.find(
                  (candidate) => candidate.id === draggedId,
                );
                if (dragged) move(dragged, index);
              }}
              onRemove={() => setRemoveTarget(preview)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <StudioAdminLandingPreviewHistory
        previews={answeredPreviews}
        isBusy={isBusy}
        onRemove={setRemoveTarget}
      />
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <StudioAdminLandingTrackDialog
        isOpen={isAsking}
        onClose={() => setIsAsking(false)}
      />
      <StudioAdminLandingPreviewRemoveDialog
        target={removeTarget}
        isPending={remove.isPending}
        onClose={() => setRemoveTarget(null)}
        onConfirm={confirmRemove}
      />
    </section>
  );
}
