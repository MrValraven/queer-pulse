import { useState, type DragEvent } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiMenu,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioUploadTrackDetails } from "./StudioUploadTrackDetails";
import type { UploadRow } from "./useStudioTrackUploads";
import tracksStyles from "./StudioUploadTracks.module.css";

const STAGE_KEY: Record<UploadRow["stage"], string> = {
  queued: "studio:uploadFlow.files.stage.queued",
  creating: "studio:uploadFlow.files.stage.creating",
  uploading: "studio:uploadFlow.files.stage.uploading",
  confirming: "studio:uploadFlow.files.stage.confirming",
  ready: "studio:uploadFlow.files.stage.ready",
  failed: "studio:uploadFlow.files.stage.failed",
  noAudio: "studio:uploadFlow.files.stage.noAudio",
};

/** The id a dragged row carries, kept apart from files dropped from the desktop. */
const ROW_DRAG_TYPE = "application/x-studio-upload-row";

/** The row buttons the list refocuses after a move or a removal. */
export type UploadRowControl = "moveUp" | "moveDown" | "remove";

/** Records (or, with null, forgets) one of this row's buttons. */
type RegisterControl = (
  control: UploadRowControl,
  element: HTMLButtonElement | null,
) => void;

function startRowDrag(event: DragEvent<HTMLSpanElement>, localId: string) {
  event.dataTransfer.setData(ROW_DRAG_TYPE, localId);
  event.dataTransfer.effectAllowed = "move";
  const rowElement = event.currentTarget.closest("li");
  if (rowElement) event.dataTransfer.setDragImage(rowElement, 16, 16);
}

/** Move up, Move down, Retry, Edit details and Remove. A blocked move stays
 *  focusable (aria-disabled) so focus never drops off the list. */
function RowActions({
  row,
  label,
  isFirst,
  isLast,
  canReorder,
  isStructureLocked,
  isEditing,
  registerControl,
  onMove,
  onRetry,
  onRemove,
  onToggleEditing,
}: {
  row: UploadRow;
  label: { title: string; position: number };
  isFirst: boolean;
  isLast: boolean;
  canReorder: boolean;
  isStructureLocked: boolean;
  isEditing: boolean;
  registerControl: RegisterControl;
  onMove: (offset: -1 | 1) => void;
  onRetry: () => void;
  onRemove: () => void;
  onToggleEditing: () => void;
}) {
  const { t } = useTranslation();
  const isMoveUpBlocked = !canReorder || isFirst;
  const isMoveDownBlocked = !canReorder || isLast;
  return (
    <div className={tracksStyles.actions}>
      {!isStructureLocked && (
        <>
          <button
            ref={(element) => registerControl("moveUp", element)}
            type="button"
            aria-disabled={isMoveUpBlocked || undefined}
            onClick={() => {
              if (!isMoveUpBlocked) onMove(-1);
            }}
            aria-label={t("studio:uploadFlow.files.moveUp", label)}
          >
            <FiArrowUp aria-hidden />
          </button>
          <button
            ref={(element) => registerControl("moveDown", element)}
            type="button"
            aria-disabled={isMoveDownBlocked || undefined}
            onClick={() => {
              if (!isMoveDownBlocked) onMove(1);
            }}
            aria-label={t("studio:uploadFlow.files.moveDown", label)}
          >
            <FiArrowDown aria-hidden />
          </button>
          {row.stage === "failed" && row.isRetryable && (
            <button
              type="button"
              onClick={onRetry}
              aria-label={t("studio:uploadFlow.files.retry", label)}
            >
              <FiRefreshCw aria-hidden />
            </button>
          )}
        </>
      )}
      {row.trackId && (
        <button
          type="button"
          aria-expanded={isEditing}
          aria-label={t("studio:uploadFlow.files.editDetailsFor", label)}
          onClick={onToggleEditing}
        >
          {t("studio:uploadFlow.files.editDetails")}
        </button>
      )}
      {!isStructureLocked && (
        <button
          ref={(element) => registerControl("remove", element)}
          type="button"
          onClick={onRemove}
          aria-label={t("studio:uploadFlow.files.remove", label)}
        >
          <FiTrash2 aria-hidden />
        </button>
      )}
    </div>
  );
}

export function StudioUploadTrackRow({
  row,
  index,
  rowCount,
  releaseId,
  canReorder,
  isStructureLocked,
  registerControl,
  onMove,
  onDropAt,
  onRetry,
  onRemove,
  onRename,
  onDropFiles,
}: {
  row: UploadRow;
  index: number;
  rowCount: number;
  releaseId: string;
  canReorder: boolean;
  isStructureLocked: boolean;
  registerControl: RegisterControl;
  onMove: (offset: -1 | 1) => void;
  onDropAt: (draggedLocalId: string) => void;
  onRetry: () => void;
  onRemove: () => void;
  onRename: (title: string) => void;
  /** Audio files dropped on a row join the list; absent on a locked list,
   *  where a file drop is left to the browser. */
  onDropFiles?: (files: File[]) => void;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const label = { title: row.title, position: index + 1 };

  return (
    <li
      className={tracksStyles.row}
      onDragOver={(event) => {
        const types = event.dataTransfer.types;
        const isRowDrag = canReorder && types.includes(ROW_DRAG_TYPE);
        const isFileDrag = onDropFiles !== undefined && types.includes("Files");
        if (isRowDrag || isFileDrag) event.preventDefault();
      }}
      onDrop={(event) => {
        if (onDropFiles && event.dataTransfer.files.length > 0) {
          event.preventDefault();
          onDropFiles(Array.from(event.dataTransfer.files));
          return;
        }
        const draggedLocalId = event.dataTransfer.getData(ROW_DRAG_TYPE);
        if (!canReorder || !draggedLocalId) return;
        event.preventDefault();
        onDropAt(draggedLocalId);
      }}
    >
      <span
        className={tracksStyles.handle}
        aria-hidden
        draggable={canReorder}
        onDragStart={(event) => startRowDrag(event, row.localId)}
      >
        {canReorder && <FiMenu />}
      </span>
      <span className={tracksStyles.position}>{index + 1}</span>
      <div className={tracksStyles.main}>
        <span className={tracksStyles.title}>{row.title}</span>
        <span className={tracksStyles.stage} data-stage={row.stage}>
          {t(STAGE_KEY[row.stage])}
          {row.durationLabel && row.stage === "ready"
            ? ` · ${row.durationLabel}`
            : ""}
        </span>
        {(row.stage === "uploading" || row.stage === "confirming") && (
          <progress
            className={tracksStyles.progress}
            max={100}
            value={row.progress}
            aria-label={t("studio:uploadFlow.files.progressLabel", label)}
          />
        )}
        {row.errorKey && (
          <p className={tracksStyles.error} role="alert">
            {t(row.errorKey)}
          </p>
        )}
      </div>
      <RowActions
        row={row}
        label={label}
        isFirst={index === 0}
        isLast={index === rowCount - 1}
        canReorder={canReorder}
        isStructureLocked={isStructureLocked}
        isEditing={isEditing}
        registerControl={registerControl}
        onMove={onMove}
        onRetry={onRetry}
        onRemove={onRemove}
        onToggleEditing={() => setIsEditing((wasEditing) => !wasEditing)}
      />
      {isEditing && row.trackId && (
        <StudioUploadTrackDetails
          trackId={row.trackId}
          releaseId={releaseId}
          onDone={(savedTitle) => {
            if (savedTitle) onRename(savedTitle);
            setIsEditing(false);
          }}
        />
      )}
    </li>
  );
}
