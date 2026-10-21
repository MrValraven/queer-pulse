import { useId, useRef, type ReactNode, type RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  FiArrowDown,
  FiArrowUp,
  FiPaperclip,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, IconButton } from "../../shared/components/ui";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isCancellableStage, type UploadRow } from "./useStudioTrackUploads";
import tracksStyles from "./StudioUploadTracks.module.css";

/** The row buttons the list refocuses after a move or a removal. */
export type UploadRowControl = "moveUp" | "moveDown" | "remove";

/** Records (or, with null, forgets) one of this row's buttons. */
export type RegisterControl = (
  control: UploadRowControl,
  element: HTMLButtonElement | null,
) => void;

const ATTACH_ACCEPT =
  ".mp3,.m4a,audio/mpeg,audio/mp4,.wav,.wave,.aif,.aiff,.aifc,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff";

/** A stage-bound action (Cancel upload, Retry, Attach audio) fades in and
 *  out as the row's stage changes, so the row never snaps. */
function StageAction({
  isShown,
  children,
}: {
  isShown: boolean;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          className={tracksStyles.stageAction}
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1, transition: STUDIO_FADE }}
          exit={{ opacity: 0, transition: STUDIO_EXIT }}
        >
          {children}
        </m.span>
      )}
    </AnimatePresence>
  );
}

/** Why a move is closed, or null when it is open. */
function moveBlockedKeyOf(canReorder: boolean, isAtEnd: boolean) {
  if (!canReorder) return "studio:uploadFlow.files.reorderWaits";
  return isAtEnd ? "studio:uploadFlow.files.moveAtEnd" : null;
}

/** Move up or down. A blocked move stays focusable (aria-disabled) so focus
 *  never drops off the list, and its reason is its tooltip and description. */
function MoveButton({
  direction,
  label,
  blockedKey,
  registerControl,
  onMove,
}: {
  direction: -1 | 1;
  label: { title: string; position: number };
  blockedKey: string | null;
  registerControl: RegisterControl;
  onMove: (offset: -1 | 1) => void;
}) {
  const { t } = useTranslation();
  const reasonId = useId();
  const reason = blockedKey ? t(blockedKey) : null;
  return (
    <>
      <IconButton
        ref={(element) =>
          registerControl(direction === -1 ? "moveUp" : "moveDown", element)
        }
        size="sm"
        aria-disabled={reason ? true : undefined}
        aria-describedby={reason ? reasonId : undefined}
        tooltip={reason ?? true}
        onClick={() => {
          if (!reason) onMove(direction);
        }}
        aria-label={t(
          direction === -1
            ? "studio:uploadFlow.files.moveUp"
            : "studio:uploadFlow.files.moveDown",
          label,
        )}
      >
        {direction === -1 ? (
          <FiArrowUp aria-hidden />
        ) : (
          <FiArrowDown aria-hidden />
        )}
      </IconButton>
      <span id={reasonId} className="visuallyHidden">
        {reason ?? ""}
      </span>
    </>
  );
}

/** Attach audio on a track that has none yet: a real file input behind a
 *  visible button, so the credits, lyrics and place in the list stay. */
function AttachAudioButton({
  label,
  onAttach,
}: {
  label: { title: string; position: number };
  onAttach: (file: File) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        className={tracksStyles.fileInput}
        type="file"
        accept={ATTACH_ACCEPT}
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const [file] = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (file) onAttach(file);
        }}
      />
      <Button
        variant="quiet"
        size="sm"
        aria-label={t("studio:uploadFlow.files.attachAudioFor", label)}
        onClick={() => inputRef.current?.click()}
      >
        <FiPaperclip aria-hidden /> {t("studio:uploadFlow.files.attachAudio")}
      </Button>
    </>
  );
}

/** Move up, Move down, Cancel upload, Retry, Attach audio, Edit details and
 *  Remove: every one a 44px target from the shared kit. */
export function StudioUploadRowActions({
  row,
  label,
  isFirst,
  isLast,
  canReorder,
  isEditing,
  editButtonRef,
  registerControl,
  onMove,
  onCancel,
  onRetry,
  onAttachAudio,
  onRemove,
  onToggleEditing,
}: {
  row: UploadRow;
  label: { title: string; position: number };
  isFirst: boolean;
  isLast: boolean;
  canReorder: boolean;
  isEditing: boolean;
  /** Edit details takes focus back when the details panel closes. */
  editButtonRef: RefObject<HTMLButtonElement | null>;
  registerControl: RegisterControl;
  onMove: (offset: -1 | 1) => void;
  onCancel: () => void;
  onRetry: () => void;
  onAttachAudio: (file: File) => void;
  onRemove: () => void;
  onToggleEditing: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={tracksStyles.actions}>
      <MoveButton
        direction={-1}
        label={label}
        blockedKey={moveBlockedKeyOf(canReorder, isFirst)}
        registerControl={registerControl}
        onMove={onMove}
      />
      <MoveButton
        direction={1}
        label={label}
        blockedKey={moveBlockedKeyOf(canReorder, isLast)}
        registerControl={registerControl}
        onMove={onMove}
      />
      <StageAction isShown={isCancellableStage(row.stage)}>
        <IconButton
          size="sm"
          tooltip
          onClick={onCancel}
          aria-label={t("studio:uploadFlow.files.cancelUpload", label)}
        >
          <FiX aria-hidden />
        </IconButton>
      </StageAction>
      <StageAction isShown={row.stage === "failed" && row.isRetryable}>
        <IconButton
          size="sm"
          tooltip
          onClick={onRetry}
          aria-label={t("studio:uploadFlow.files.retry", label)}
        >
          <FiRefreshCw aria-hidden />
        </IconButton>
      </StageAction>
      <StageAction isShown={row.stage === "noAudio" && row.trackId !== null}>
        <AttachAudioButton label={label} onAttach={onAttachAudio} />
      </StageAction>
      {row.trackId && (
        <Button
          ref={editButtonRef}
          variant="quiet"
          size="sm"
          aria-expanded={isEditing}
          aria-label={t("studio:uploadFlow.files.editDetailsFor", label)}
          onClick={onToggleEditing}
        >
          {t("studio:uploadFlow.files.editDetails")}
        </Button>
      )}
      <IconButton
        ref={(element) => registerControl("remove", element)}
        size="sm"
        tooltip
        onClick={onRemove}
        aria-label={t("studio:uploadFlow.files.remove", label)}
      >
        <FiTrash2 aria-hidden />
      </IconButton>
    </div>
  );
}
