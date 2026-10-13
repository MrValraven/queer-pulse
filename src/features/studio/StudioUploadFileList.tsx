import { useLayoutEffect, useRef } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioUploadLoudnessNote } from "./StudioUploadLoudnessNote";
import {
  StudioUploadTrackRow,
  type UploadRowControl,
} from "./StudioUploadTrackRow";
import { FILE_REJECTION_KEY } from "./studioUploadValidation";
import type { StudioTrackUploads } from "./useStudioTrackUploads";
import { useStudioShowcase } from "./useStudioShowcase";
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
  releaseId,
  isStructureLocked,
}: {
  uploads: StudioTrackUploads;
  releaseId: string;
  isStructureLocked: boolean;
}) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const { rootRef, registerControl, requestFocus } = useRowFocus();
  const readyCount = uploads.rows.filter((row) => row.stage === "ready").length;

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
                {t(FILE_REJECTION_KEY[rejection.reason], {
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
              canReorder={uploads.canReorder && !isStructureLocked}
              isStructureLocked={isStructureLocked}
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
              onRemove={() => removeRow(index)}
              onRename={(title) => uploads.rename(row.localId, title)}
              onDropFiles={isStructureLocked ? undefined : uploads.addFiles}
            />
          ))}
        </ol>
      )}
      {uploads.orderErrorKey && (
        <p className={tracksStyles.error} role="alert">
          {t(uploads.orderErrorKey)}
        </p>
      )}
      {isShowcase && <StudioUploadLoudnessNote />}
    </div>
  );
}
