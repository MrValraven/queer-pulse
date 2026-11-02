import { useEffect, useId, useRef, useState, type Dispatch } from "react";
import { FiImage, FiX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CoverUpload } from "../fields/CoverUpload";
import type { AddMonthAction, AddMonthRow } from "./addMonthState";
import styles from "./AddMonthRows.module.css";

/** The thumbnail the folded summary shows: the shared cover, or the
 *  "Photo added" tile for a photo restored from a draft with no preview. */
function RowPhotoThumbnail({
  row,
  sharedCoverUrl,
}: {
  row: AddMonthRow;
  sharedCoverUrl: string | null;
}) {
  const { t } = useTranslation();
  if (row.photo !== null) {
    return (
      <span className={styles.thumbnailTile}>
        <FiImage aria-hidden />
        {t("gatherings:addMonth.row.photo.added")}
      </span>
    );
  }
  return (
    <figure className={styles.sharedFigure}>
      {sharedCoverUrl ? (
        <img className={styles.thumbnail} src={sharedCoverUrl} alt="" />
      ) : (
        <span className={styles.thumbnailTile} aria-hidden>
          <FiImage />
        </span>
      )}
      <figcaption className={styles.photoCaption}>
        {t("gatherings:addMonth.row.photo.shared")}
      </figcaption>
    </figure>
  );
}

/**
 * The photo of one date. It starts on the shared cover; "Use a different
 * photo" folds open the cover upload for this date only. Closing the picker
 * without a pick leaves the row on the shared cover.
 *
 * Once a photo is picked the upload stays mounted and shows it: the field
 * owns the `blob:` preview and revokes it when it unmounts, and in demo that
 * blob is the key itself. "Use the shared cover" folds the upload away.
 *
 * Only a photo picked while this card is mounted counts as live. A photo
 * restored from a draft, or brought back with its date, keeps a key whose
 * preview this field never made (a dead `blob:` or a library address), and a
 * storage key is never an image address, so it shows the "Photo added" tile
 * and the upload opens empty.
 */
export function AddMonthRowPhoto({
  row,
  sharedCoverUrl,
  dispatch,
  labelledBy,
}: {
  row: AddMonthRow;
  sharedCoverUrl: string | null;
  dispatch: Dispatch<AddMonthAction>;
  /** The id of the visible heading that names this date's upload. */
  labelledBy: string;
}) {
  const { t } = useTranslation();
  const pickerId = useId();
  const [isPicking, setIsPicking] = useState(false);
  const hasOwnPhoto = row.photo !== null;
  // The key of the photo picked in this mount with a preview to paint.
  const [livePickKey, setLivePickKey] = useState<string | null>(null);
  const hasLivePreview =
    row.photo?.previewUrl != null && row.photo.key === livePickKey;
  const isUploadShown = isPicking || hasLivePreview;
  const uploadValue = hasLivePreview && row.photo ? row.photo.key : "";
  // The upload field reports the key and then its preview in the same tick,
  // before `row` re-renders, so the key the preview belongs to is held here.
  const latestKeyRef = useRef(row.photo?.key ?? "");
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasUploadShownRef = useRef(isUploadShown);

  useEffect(() => {
    latestKeyRef.current = row.photo?.key ?? "";
  }, [row.photo?.key]);

  useEffect(() => {
    if (wasUploadShownRef.current === isUploadShown) return;
    wasUploadShownRef.current = isUploadShown;
    // The button that was pressed folds away, so focus moves to the control
    // that took its place.
    (isUploadShown ? closeButtonRef : openButtonRef).current?.focus();
  }, [isUploadShown]);

  function handleKeyChange(key: string) {
    latestKeyRef.current = key;
    dispatch({ type: "setRowPhotoKey", date: row.date, key });
  }

  function handlePreviewChange(previewUrl: string) {
    const key = latestKeyRef.current;
    if (key === "") {
      setLivePickKey(null);
      return;
    }
    setLivePickKey(previewUrl === "" ? null : key);
    dispatch({
      type: "setRowPhotoPreview",
      date: row.date,
      key,
      previewUrl: previewUrl === "" ? null : previewUrl,
    });
  }

  function returnToSharedCover() {
    latestKeyRef.current = "";
    setLivePickKey(null);
    dispatch({ type: "setRowPhotoKey", date: row.date, key: "" });
    setIsPicking(false);
  }

  const sharedCoverButton = (
    <Collapse isOpen={hasOwnPhoto}>
      <Button variant="quiet" size="sm" onClick={returnToSharedCover}>
        {t("gatherings:addMonth.row.photo.useShared")}
      </Button>
    </Collapse>
  );

  return (
    <div className={styles.photo}>
      <Collapse isOpen={!isUploadShown}>
        <div className={styles.photoSummary}>
          <div className={styles.thumbnailFrame}>
            <RowPhotoThumbnail row={row} sharedCoverUrl={sharedCoverUrl} />
          </div>
          <div className={styles.photoActions}>
            <Button
              ref={openButtonRef}
              variant="quiet"
              size="sm"
              aria-expanded={false}
              aria-controls={pickerId}
              onClick={() => setIsPicking(true)}
            >
              {hasOwnPhoto
                ? t("gatherings:addMonth.row.photo.change")
                : t("gatherings:addMonth.row.photo.useDifferent")}
            </Button>
            {sharedCoverButton}
          </div>
        </div>
      </Collapse>
      <div id={pickerId}>
        <Collapse isOpen={isUploadShown}>
          <div className={styles.picker}>
            <CoverUpload
              value={uploadValue}
              onChange={handleKeyChange}
              onPreviewChange={handlePreviewChange}
              labelledBy={labelledBy}
            />
            <div className={styles.photoActions}>
              <Collapse isOpen={!hasLivePreview}>
                <Button
                  ref={closeButtonRef}
                  variant="quiet"
                  size="sm"
                  aria-expanded
                  aria-controls={pickerId}
                  onClick={() => setIsPicking(false)}
                >
                  <FiX aria-hidden />{" "}
                  {t("gatherings:addMonth.row.photo.closePicker")}
                </Button>
              </Collapse>
              {sharedCoverButton}
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  );
}
