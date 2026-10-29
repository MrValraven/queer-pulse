import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  ConfirmDialog,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAdminStudioLanding } from "./api/useStudioAdminLanding";
import {
  useRemoveFoundingArtist,
  useReorderFoundingArtists,
} from "./api/useStudioAdminLandingMutations";
import type { AdminStudioFoundingArtistDTO } from "./api/studioLandingAdmin.api";
import { StudioAdminFoundingAddDialog } from "./StudioAdminFoundingAddDialog";
import { StudioAdminFoundingRow } from "./StudioAdminFoundingRow";
import { StudioAdminFoundingShelf } from "./StudioAdminFoundingShelf";
import { StudioAdminLoadPanel } from "./StudioAdminWaitingRow";
import { movedIds, studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import { studioLoadStateOf } from "../studio/api/studioLoadState";
import css from "./StudioAdminFounding.module.css";

/** The Founding artists tab: the launch shelf switch, the founding list in
 *  order (drag handle, Move up, Move down, Remove founding artist) and the
 *  persona search that adds one. */
export function StudioAdminFounding() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const query = useAdminStudioLanding();
  const reorder = useReorderFoundingArtists();
  const remove = useRemoveFoundingArtist();
  const [isAdding, setIsAdding] = useState(false);
  const [removeTarget, setRemoveTarget] =
    useState<AdminStudioFoundingArtistDTO | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const landing = query.data;
  const loadState = studioLoadStateOf(query, landing !== undefined);
  const artists = landing?.foundingArtists ?? [];
  const isShelfVisible = landing?.settings.isFoundingShelfVisible ?? false;
  const isBusy = reorder.isPending || remove.isPending;

  const toastError = (cause: unknown) =>
    showToast(t(studioAdminSaveErrorKeyOf(cause)), "error");

  function move(listed: AdminStudioFoundingArtistDTO, targetIndex: number) {
    const foundingArtistIds = movedIds(
      artists.map((candidate) => candidate.id),
      listed.id,
      targetIndex,
    );
    if (!foundingArtistIds || isBusy) return;
    reorder.mutate(
      { foundingArtistIds },
      {
        onSuccess: () =>
          setStatusMessage(
            t("admin:studioAdmin.moved", {
              name: listed.artist.name,
              position: targetIndex + 1,
            }),
          ),
        onError: toastError,
      },
    );
  }

  function confirmRemove(listed: AdminStudioFoundingArtistDTO) {
    const removedIndex = artists.indexOf(listed);
    remove.mutate(
      { foundingArtistId: listed.id },
      {
        onSuccess: () => {
          setRemoveTarget(null);
          showToast(
            t("admin:studioAdmin.founding.removed", {
              name: listed.artist.name,
            }),
            "success",
          );
          focusNeighbourControl({
            list: listRef.current,
            index: removedIndex,
            findControl: (row) =>
              row.querySelector<HTMLElement>("[data-founding-remove]"),
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
      <div className={css.head}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={css.heading}
        >
          {t("admin:studioAdmin.founding.heading")}
        </h2>
        <p className={css.sub}>{t("admin:studioAdmin.founding.sub")}</p>
      </div>
      <Collapse isOpen={loadState.isLoading}>
        <SkeletonLine height={160} style={{ borderRadius: 14 }} />
      </Collapse>
      <Collapse isOpen={loadState.isError}>
        <StudioAdminLoadPanel
          loadState={loadState}
          error={query.error}
          title={t("admin:studioAdmin.founding.loadError")}
        />
      </Collapse>
      <Collapse isOpen={landing !== undefined}>
        <div className={css.section}>
          <StudioAdminFoundingShelf
            isVisible={isShelfVisible}
            onAnnounce={setStatusMessage}
          />
          <div className={css.toolbar}>
            <Button variant="primary" onClick={() => setIsAdding(true)}>
              {t("admin:studioAdmin.founding.addCta")}
            </Button>
          </div>
          <Collapse isOpen={artists.length === 0}>
            <p className={css.empty}>{t("admin:studioAdmin.founding.empty")}</p>
          </Collapse>
          <Collapse isOpen={artists.length > 0}>
            <ol ref={listRef} className={css.list} aria-labelledby={headingId}>
              <AnimatePresence initial={false}>
                {artists.map((listed, index) => (
                  <StudioAdminFoundingRow
                    key={listed.id}
                    listed={listed}
                    index={index}
                    count={artists.length}
                    isBusy={isBusy}
                    onMove={(targetIndex) => move(listed, targetIndex)}
                    onDropAt={(draggedId) => {
                      const dragged = artists.find(
                        (candidate) => candidate.id === draggedId,
                      );
                      if (dragged) move(dragged, index);
                    }}
                    onRemove={() => setRemoveTarget(listed)}
                  />
                ))}
              </AnimatePresence>
            </ol>
          </Collapse>
        </div>
      </Collapse>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <AnimatePresence>
        {isAdding && (
          <StudioAdminFoundingAddDialog onClose={() => setIsAdding(false)} />
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) confirmRemove(removeTarget);
        }}
        tone="destructive"
        loading={remove.isPending}
        title={t("admin:studioAdmin.founding.removeConfirm.title", {
          name: removeTarget?.artist.name ?? "",
        })}
        description={t("admin:studioAdmin.founding.removeConfirm.body")}
        confirmLabel={t("admin:studioAdmin.founding.removeCta")}
      />
    </section>
  );
}
