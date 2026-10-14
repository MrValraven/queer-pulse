import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useAdminStudioScenes,
  useReorderAdminStudioScenes,
  useSetAdminStudioSceneArchived,
} from "./api/StudioAdminSceneHooks";
import type { AdminStudioSceneDTO } from "./api/studioDiscoveryAdmin.api";
import { StudioAdminSceneDialog } from "./StudioAdminSceneDialog";
import { StudioAdminSceneRow } from "./StudioAdminSceneRow";
import { StudioAdminSceneSheet } from "./StudioAdminSceneSheet";
import {
  isStudioAdminForbidden,
  movedIds,
  sortedAdminScenes,
  studioAdminSaveErrorKeyOf,
} from "./studioAdmin.model";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import css from "./StudioAdminScenes.module.css";

/** The Scenes tab: active scenes in home-row order, archived ones after, a
 *  form to create and edit, and a sheet for a scene's events and releases. */
export function StudioAdminScenes() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const activeHeadingId = useId();
  const archivedHeadingId = useId();
  const activeHeadingRef = useRef<HTMLHeadingElement>(null);
  const archivedHeadingRef = useRef<HTMLHeadingElement>(null);
  const activeListRef = useRef<HTMLOListElement>(null);
  const archivedListRef = useRef<HTMLUListElement>(null);
  const { data, isLoading, isError, error, refetch } = useAdminStudioScenes();
  const reorder = useReorderAdminStudioScenes();
  const setArchived = useSetAdminStudioSceneArchived();
  const [formTarget, setFormTarget] = useState<
    AdminStudioSceneDTO | "new" | null
  >(null);
  const [sheetScene, setSheetScene] = useState<AdminStudioSceneDTO | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const scenes = sortedAdminScenes(data ?? []);
  const active = scenes.filter((scene) => scene.status === "active");
  const archived = scenes.filter((scene) => scene.status === "archived");
  const isBusy = reorder.isPending || setArchived.isPending;

  const toastError = (cause: unknown) =>
    showToast(t(studioAdminSaveErrorKeyOf(cause)), "error");

  function move(scene: AdminStudioSceneDTO, targetIndex: number) {
    const sceneIds = movedIds(
      active.map((candidate) => candidate.id),
      scene.id,
      targetIndex,
    );
    if (!sceneIds || isBusy) return;
    reorder.mutate(
      { sceneIds },
      {
        onSuccess: () =>
          setStatusMessage(
            t("admin:studioAdmin.moved", {
              name: scene.name,
              position: targetIndex + 1,
            }),
          ),
        onError: toastError,
      },
    );
  }

  function changeArchived(scene: AdminStudioSceneDTO, isArchived: boolean) {
    if (isBusy) return;
    const sourceIndex = (isArchived ? active : archived).indexOf(scene);
    setArchived.mutate(
      { scene, isArchived },
      {
        onSuccess: () => {
          showToast(
            t(
              isArchived
                ? "admin:studioAdmin.toast.sceneArchived"
                : "admin:studioAdmin.toast.sceneRestored",
              { name: scene.name },
            ),
            "success",
          );
          // The row leaves its group: focus the same control on a
          // neighbour there, else the heading of the group it joined.
          focusNeighbourControl({
            list: (isArchived ? activeListRef : archivedListRef).current,
            index: sourceIndex,
            findControl: (row) =>
              row.querySelector<HTMLElement>("[data-scene-archive]"),
            fallback: (isArchived ? archivedHeadingRef : activeHeadingRef)
              .current,
          });
        },
        onError: toastError,
      },
    );
  }

  if (isLoading)
    return <SkeletonLine height={160} style={{ borderRadius: 14 }} />;
  if (isError && data === undefined) {
    const isForbidden = isStudioAdminForbidden(error);
    return (
      <div className={css.notice}>
        <p className={css.noticeText}>
          {isForbidden
            ? t("admin:studioAdmin.forbidden")
            : t("admin:studioAdmin.loadError")}
        </p>
        {!isForbidden && (
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>
            {t("admin:studioAdmin.retryCta")}
          </Button>
        )}
      </div>
    );
  }

  const rowsOf = (group: AdminStudioSceneDTO[]) =>
    group.map((scene, index) => (
      <StudioAdminSceneRow
        key={scene.id}
        scene={scene}
        index={index}
        count={group.length}
        isBusy={isBusy}
        onMove={(targetIndex) => move(scene, targetIndex)}
        onDropAt={(draggedId) => {
          const dragged = active.find(
            (candidate) => candidate.id === draggedId,
          );
          if (dragged) move(dragged, index);
        }}
        onEdit={() => setFormTarget(scene)}
        onManage={() => setSheetScene(scene)}
        onSetArchived={(isArchived) => changeArchived(scene, isArchived)}
      />
    ));

  return (
    <div className={css.scenes}>
      <div className={css.toolbar}>
        <Button variant="primary" onClick={() => setFormTarget("new")}>
          {t("admin:studioAdmin.scenes.newCta")}
        </Button>
      </div>
      <Collapse isOpen={scenes.length === 0}>
        <p className={css.hint}>{t("admin:studioAdmin.scenes.empty")}</p>
      </Collapse>
      <Collapse isOpen={active.length > 0}>
        <section aria-labelledby={activeHeadingId}>
          <h2
            id={activeHeadingId}
            ref={activeHeadingRef}
            tabIndex={-1}
            className={css.groupTitle}
          >
            {t("admin:studioAdmin.scenes.activeHeading")}
          </h2>
          <ol ref={activeListRef} className={css.sceneList}>
            <AnimatePresence initial={false}>{rowsOf(active)}</AnimatePresence>
          </ol>
        </section>
      </Collapse>
      <Collapse isOpen={archived.length > 0}>
        <section aria-labelledby={archivedHeadingId}>
          <h2
            id={archivedHeadingId}
            ref={archivedHeadingRef}
            tabIndex={-1}
            className={css.groupTitle}
          >
            {t("admin:studioAdmin.scenes.archivedHeading")}
          </h2>
          <ul ref={archivedListRef} className={css.sceneList}>
            <AnimatePresence initial={false}>
              {rowsOf(archived)}
            </AnimatePresence>
          </ul>
        </section>
      </Collapse>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <AnimatePresence>
        {formTarget && (
          <StudioAdminSceneDialog
            scene={formTarget === "new" ? null : formTarget}
            onClose={() => setFormTarget(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sheetScene && (
          <StudioAdminSceneSheet
            scene={sheetScene}
            onClose={() => setSheetScene(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
