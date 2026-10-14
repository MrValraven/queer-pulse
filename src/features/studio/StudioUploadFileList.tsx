import { AnimatePresence } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { Collapse, ConfirmDialog } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioFormat, StudioReleaseType } from "./api/studio.types";
import { StudioUploadLoudnessNote } from "./StudioUploadLoudnessNote";
import {
  StudioUploadTrackRow,
  type UploadRowControl,
} from "./StudioUploadTrackRow";
import { fileRejectionKeyOf } from "./studioUploadValidation";
import { loudnessNotesFor } from "./upload/studioLoudnessNotes";
import type { StudioUploadAnalysis } from "./upload/useStudioUploadAnalysis";
import type { StudioTrackUploads } from "./useStudioTrackUploads";
import s from "./creator.module.css";
import tracksStyles from "./StudioUploadTracks.module.css";

/** Where focus goes once the list re-renders after a move or a removal. */
type FocusRequest =
  { localId: string; control: UploadRowControl } | "chooseFiles";

/** The drop zone's "Choose audio files" button, its sibling on the page. */
const CHOOSE_FILES_SELECTOR = "[data-upload-choose]";

/** Keeps focus on the pressed button when React moves its row, and on a
 *  neighbouring row (or the drop zone) when the row is removed. */
function useRowFocus() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef(new Map<string, HTMLButtonElement>());
  const focusRequestRef = useRef<FocusRequest | null>(null);

  useLayoutEffect(() => {
    const request = focusRequestRef.current;
    if (!request) return;
    focusRequestRef.current = null;
    const target =
      request === "chooseFiles"
        ? rootRef.current?.parentElement?.querySelector<HTMLButtonElement>(
            CHOOSE_FILES_SELECTOR,
          )
        : controlsRef.current.get(`${request.localId}:${request.control}`);
    target?.focus();
  });

  return {
    rootRef,
    registerControl: (
      localId: string,
      control: UploadRowControl,
      element: HTMLButtonElement | null,
    ) => {
      const key = `${localId}:${control}`;
      if (element) controlsRef.current.set(key, element);
      else controlsRef.current.delete(key);
    },
    requestFocus: (request: FocusRequest) => {
      focusRequestRef.current = request;
    },
  };
}

export function FileList({
  uploads,
  analysis,
  storedLoudness,
  backfillCount,
  releaseId,
  releaseTitle,
  isPublished,
  releaseType,
  format,
}: {
  uploads: StudioTrackUploads;
  analysis: StudioUploadAnalysis;
  /** Saved measurements by track id (owner rows, contract F.3). */
  storedLoudness: ReadonlyMap<
    string,
    { loudnessLufs: number | null; peakDb: number | null }
  >;
  backfillCount: number;
  releaseId: string;
  releaseTitle: string;
  /** Removing a track from a live release asks first (Studio v3). */
  isPublished: boolean;
  releaseType: StudioReleaseType;
  /** Artist kinds: the release format, which picks the size cap line. */
  format: StudioFormat;
}) {
  const { t } = useTranslation();
  const loudnessNotes = loudnessNotesFor(
    uploads.rows.map(
      (row) =>
        analysis.analysisOf(row.localId) ??
        (row.trackId ? (storedLoudness.get(row.trackId) ?? null) : null),
    ),
  );
  const { rootRef, registerControl, requestFocus } = useRowFocus();
  const readyCount = uploads.rows.filter((row) => row.stage === "ready").length;
  const [pendingRemoval, setPendingRemoval] = useState<{
    localId: string;
    title: string;
  } | null>(null);

  function removeRow(index: number) {
    const row = uploads.rows[index];
    if (!row) return;
    const neighbour = uploads.rows[index + 1] ?? uploads.rows[index - 1];
    requestFocus(
      neighbour
        ? { localId: neighbour.localId, control: "remove" }
        : "chooseFiles",
    );
    uploads.remove(row.localId);
  }

  function requestRemoval(index: number) {
    const row = uploads.rows[index];
    if (!row) return;
    if (isPublished && row.trackId)
      setPendingRemoval({ localId: row.localId, title: row.title });
    else removeRow(index);
  }

  // The dialog lives in the list, outside the rows, so the row leaving after
  // a confirm never unmounts its own dialog mid-exit.
  function confirmRemoval() {
    if (!pendingRemoval) return;
    const index = uploads.rows.findIndex(
      (row) => row.localId === pendingRemoval.localId,
    );
    setPendingRemoval(null);
    if (index >= 0) removeRow(index);
  }

  return (
    <div ref={rootRef} className={s.uploaded}>
      <h4 aria-live="polite" aria-atomic="true">
        <Translation
          i18nKey="studio:upload.files.heading"
          components={{ em: <em /> }}
          values={{ readyCount, totalCount: uploads.rows.length }}
        />
      </h4>
      <div role="alert">
        {uploads.rejections.length > 0 && (
          <ul className={tracksStyles.rejections}>
            {uploads.rejections.map((rejection) => (
              <li key={`${rejection.fileName}-${rejection.reason}`}>
                {t(fileRejectionKeyOf(rejection.reason, format), {
                  fileName: rejection.fileName,
                })}
              </li>
            ))}
          </ul>
        )}
      </div>
      {uploads.rows.length === 0 ? (
        <p className={s.fileMeta}>{t("studio:uploadFlow.files.empty")}</p>
      ) : (
        <ol
          className={tracksStyles.list}
          aria-label={t("studio:uploadFlow.files.listLabel")}
        >
          {uploads.rows.map((row, index) => (
            <StudioUploadTrackRow
              key={row.localId}
              row={row}
              index={index}
              rowCount={uploads.rows.length}
              releaseId={releaseId}
              canReorder={uploads.canReorder}
              registerControl={(control, element) =>
                registerControl(row.localId, control, element)
              }
              onMove={(offset) => {
                requestFocus({
                  localId: row.localId,
                  control: offset === -1 ? "moveUp" : "moveDown",
                });
                uploads.move(row.localId, offset);
              }}
              onDropAt={(draggedLocalId) =>
                uploads.moveTo(draggedLocalId, index)
              }
              onRetry={() => uploads.retry(row.localId)}
              onRemove={() => requestRemoval(index)}
              onRename={(title) => uploads.rename(row.localId, title)}
              onDropFiles={uploads.addFiles}
              isMeasuring={analysis.statusOf(row.localId) === "measuring"}
              releaseType={releaseType}
              localFile={analysis.fileOf(row.localId)}
            />
          ))}
        </ol>
      )}
      {uploads.orderErrorKey && (
        <p className={tracksStyles.error} role="alert">
          {t(uploads.orderErrorKey)}
        </p>
      )}
      <div role="status" className={tracksStyles.backfill}>
        <Collapse isOpen={backfillCount > 0}>
          <p>
            {t("studio:upload.loudness.backfill", { count: backfillCount })}
          </p>
        </Collapse>
      </div>
      <StudioUploadLoudnessNote notes={loudnessNotes} />
      <AnimatePresence>
        {pendingRemoval && (
          <ConfirmDialog
            open
            onClose={() => setPendingRemoval(null)}
            onConfirm={confirmRemoval}
            tone="destructive"
            title={t("studio:uploadFlow.v3.removePublishedTitle", {
              title: pendingRemoval.title,
              release: releaseTitle,
            })}
            description={t("studio:uploadFlow.v3.removePublishedBody")}
            confirmLabel={t("studio:uploadFlow.v3.removePublishedConfirm")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
