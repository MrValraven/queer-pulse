import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence } from "motion/react";
import { FiMenu } from "react-icons/fi";
import { Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseType } from "./api/studio.types";
import {
  StudioUploadRowActions,
  type RegisterControl,
} from "./StudioUploadRowActions";
import { StudioUploadRowProgress } from "./StudioUploadRowProgress";
import { StudioUploadTrackDetails } from "./StudioUploadTrackDetails";
import type { UploadRow } from "./useStudioTrackUploads";
import tracksStyles from "./StudioUploadTracks.module.css";

export type { UploadRowControl } from "./StudioUploadRowActions";

const STAGE_KEY: Record<UploadRow["stage"], string> = {
  queued: "studio:uploadFlow.files.stage.queued",
  converting: "studio:uploadFlow.files.stage.converting",
  creating: "studio:uploadFlow.files.stage.creating",
  uploading: "studio:uploadFlow.files.stage.uploading",
  confirming: "studio:uploadFlow.files.stage.confirming",
  ready: "studio:uploadFlow.files.stage.ready",
  failed: "studio:uploadFlow.files.stage.failed",
  noAudio: "studio:uploadFlow.files.stage.noAudio",
};

/** The details panel's open state. Closing it with unsaved edits (Cancel,
 *  or Edit details pressed again) asks first, so long manual work never
 *  vanishes on a press that looks harmless. */
function useDetailsPanel() {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);
  const isDirtyRef = useRef(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const onDirtyChange = useCallback((isDirty: boolean) => {
    isDirtyRef.current = isDirty;
  }, []);
  const close = () => {
    isDirtyRef.current = false;
    setIsConfirmingDiscard(false);
    setIsEditing(false);
    editButtonRef.current?.focus();
  };
  const requestClose = () => {
    if (isDirtyRef.current) setIsConfirmingDiscard(true);
    else close();
  };
  return {
    isEditing,
    isConfirmingDiscard,
    editButtonRef,
    onDirtyChange,
    close,
    requestClose,
    keepEditing: () => setIsConfirmingDiscard(false),
    toggle: () => {
      if (isEditing) requestClose();
      else setIsEditing(true);
    },
  };
}

/** The stage line: what the row is doing, its length once ready, and the
 *  measuring note while its loudness is read. */
function StageLine({
  row,
  isMeasuring,
}: {
  row: UploadRow;
  isMeasuring: boolean;
}) {
  const { t } = useTranslation();
  return (
    <span className={tracksStyles.stage} data-stage={row.stage}>
      {t(STAGE_KEY[row.stage])}
      {row.durationLabel && row.stage === "ready"
        ? ` · ${row.durationLabel}`
        : ""}
      <span
        className={tracksStyles.measuring}
        data-visible={isMeasuring || undefined}
        aria-hidden={!isMeasuring || undefined}
      >
        {` · ${t("studio:upload.loudness.measuring")}`}
      </span>
    </span>
  );
}

export interface UploadTrackRowProps {
  row: UploadRow;
  index: number;
  rowCount: number;
  releaseId: string;
  canReorder: boolean;
  registerControl: RegisterControl;
  onMove: (offset: -1 | 1) => void;
  onRetry: () => void;
  onCancel: () => void;
  onAttachAudio: (file: File) => void;
  onRemove: () => void;
  onRename: (title: string) => void;
  /** Audio files dropped on a row join the list. */
  onDropFiles?: (files: File[]) => void;
  /** The row's file is being measured (spec 8.1). */
  isMeasuring: boolean;
  releaseType: StudioReleaseType;
  /** The file picked for this row this session, for the timing tap-along. */
  localFile: File | null;
  /** The grip's pointer handlers (mouse, touch and pen drag to reorder). */
  gripHandlers?: { onPointerDown: (event: ReactPointerEvent) => void };
  /** This row is the one being dragged: it lifts and shows where it lands. */
  isDragging?: boolean;
}

export function StudioUploadTrackRow({
  row,
  index,
  rowCount,
  releaseId,
  canReorder,
  registerControl,
  onMove,
  onRetry,
  onCancel,
  onAttachAudio,
  onRemove,
  onRename,
  onDropFiles,
  isMeasuring,
  releaseType,
  localFile,
  gripHandlers,
  isDragging = false,
}: UploadTrackRowProps) {
  const { t } = useTranslation();
  const panel = useDetailsPanel();
  const label = { title: row.title, position: index + 1 };

  return (
    <li
      className={tracksStyles.row}
      data-dragging={isDragging || undefined}
      onDragOver={(event) => {
        if (onDropFiles && event.dataTransfer.types.includes("Files"))
          event.preventDefault();
      }}
      onDrop={(event) => {
        if (!onDropFiles || event.dataTransfer.files.length === 0) return;
        event.preventDefault();
        onDropFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <span
        className={tracksStyles.handle}
        data-active={canReorder || undefined}
        aria-hidden
        {...(canReorder ? gripHandlers : {})}
      >
        {canReorder && <FiMenu />}
      </span>
      <span className={tracksStyles.position}>{index + 1}</span>
      <div className={tracksStyles.main}>
        <span className={tracksStyles.title}>{row.title}</span>
        <StageLine row={row} isMeasuring={isMeasuring} />
        <StudioUploadRowProgress row={row} label={label} />
        <Collapse isOpen={row.errorKey !== null}>
          <p className={tracksStyles.error} role="alert">
            {row.errorKey ? t(row.errorKey, row.errorValues ?? undefined) : ""}
          </p>
        </Collapse>
      </div>
      <StudioUploadRowActions
        row={row}
        label={label}
        isFirst={index === 0}
        isLast={index === rowCount - 1}
        canReorder={canReorder}
        isEditing={panel.isEditing}
        editButtonRef={panel.editButtonRef}
        registerControl={registerControl}
        onMove={onMove}
        onCancel={onCancel}
        onRetry={onRetry}
        onAttachAudio={onAttachAudio}
        onRemove={onRemove}
        onToggleEditing={panel.toggle}
      />
      {/* The panel turns inert as it folds away, so Save and Cancel hand
          focus back to Edit details. */}
      <Collapse
        isOpen={panel.isEditing && Boolean(row.trackId)}
        className={tracksStyles.detailsSlot}
      >
        {row.trackId && (
          <StudioUploadTrackDetails
            trackId={row.trackId}
            releaseId={releaseId}
            releaseType={releaseType}
            localFile={localFile}
            onDirtyChange={panel.onDirtyChange}
            onDone={(savedTitle) => {
              if (savedTitle === undefined) {
                panel.requestClose();
                return;
              }
              onRename(savedTitle);
              panel.close();
            }}
          />
        )}
      </Collapse>
      <AnimatePresence>
        {panel.isConfirmingDiscard && (
          <ConfirmDialog
            open
            onClose={panel.keepEditing}
            onConfirm={panel.close}
            tone="destructive"
            title={t("studio:uploadFlow.files.discardTitle", {
              title: row.title,
            })}
            description={t("studio:uploadFlow.files.discardBody")}
            confirmLabel={t("studio:uploadFlow.files.discardConfirm")}
            cancelLabel={t("studio:uploadFlow.files.discardKeep")}
          />
        )}
      </AnimatePresence>
    </li>
  );
}
