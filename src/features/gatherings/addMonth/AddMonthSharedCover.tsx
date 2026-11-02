import { useEffect, useId, useRef, useState } from "react";
import { FiImage } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CoverUpload } from "../fields/CoverUpload";
import type { AddMonthPhoto } from "./addMonthState";
import styles from "./AddMonthCalendar.module.css";

export interface AddMonthSharedCoverProps {
  /** The starting event's cover, which the server copies when no shared
   *  cover is picked. */
  templateCoverUrl: string | null;
  templateTitle: string;
  /** Null keeps the starting event's cover. */
  cover: AddMonthPhoto | null;
  /** An empty key goes back to the starting event's cover. */
  onKeyChange: (key: string) => void;
  /** A preview for the upload `key` it belongs to, so the page drops a late
   *  preview for a photo the host has already replaced. */
  onPreviewChange: (key: string, previewUrl: string | null) => void;
}

/** What the slot shows while the upload is folded away: the "Photo added"
 *  tile for a photo known only by its key (a restored draft), the starting
 *  event's cover, or a line saying there is none. A photo picked on this page
 *  shows inside the upload itself. */
function SharedCoverPreview({
  templateCoverUrl,
  templateTitle,
  cover,
}: Pick<
  AddMonthSharedCoverProps,
  "templateCoverUrl" | "templateTitle" | "cover"
>) {
  const { t } = useTranslation();
  if (cover !== null) {
    return (
      <div className={styles.coverFrame}>
        <span className={styles.coverAdded}>
          <FiImage aria-hidden />
          {t("gatherings:addMonth.cover.added")}
        </span>
      </div>
    );
  }
  if (templateCoverUrl) {
    return (
      <div className={styles.coverFrame}>
        <img
          className={styles.coverImage}
          src={templateCoverUrl}
          alt={t("gatherings:addMonth.cover.fromTemplate", {
            title: templateTitle,
          })}
        />
      </div>
    );
  }
  return (
    <p className={styles.note}>
      {t("gatherings:addMonth.cover.none", { title: templateTitle })}
    </p>
  );
}

/**
 * The cover every date publishes with unless its own card picks a photo.
 *
 * The upload stays mounted for as long as the photo it picked is the shared
 * cover. Unmounting it would revoke the `blob:` preview the rows still paint,
 * and its unmount clean-up could take back the upload the host just chose.
 */
export function AddMonthSharedCover({
  templateCoverUrl,
  templateTitle,
  cover,
  onKeyChange,
  onPreviewChange,
}: AddMonthSharedCoverProps) {
  const { t } = useTranslation();
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const pickerId = `${baseId}-picker`;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // The key this mount of the upload last painted a preview for. A preview
  // URL from an earlier page (a restored draft) has no pick behind it here,
  // so the upload would paint the raw storage key as its image.
  const [livePickKey, setLivePickKey] = useState<string | null>(null);
  // The upload field reports the key and then its preview in the same tick,
  // before `cover` re-renders, so the key the preview belongs to is held here.
  const latestKeyRef = useRef(cover?.key ?? "");
  const hasLivePick =
    cover !== null && cover.previewUrl !== null && cover.key === livePickKey;
  const isUploadShown = isPickerOpen || hasLivePick;

  useEffect(() => {
    latestKeyRef.current = cover?.key ?? "";
  }, [cover?.key]);

  function handleKeyChange(key: string) {
    latestKeyRef.current = key;
    onKeyChange(key);
  }

  function handlePreviewChange(previewUrl: string) {
    const key = latestKeyRef.current;
    const hasPreview = key !== "" && previewUrl !== "";
    setLivePickKey(hasPreview ? key : null);
    onPreviewChange(key, previewUrl === "" ? null : previewUrl);
  }

  function restoreTemplateCover() {
    latestKeyRef.current = "";
    setLivePickKey(null);
    onKeyChange("");
    setIsPickerOpen(false);
  }

  return (
    <div className={styles.block} role="group" aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.subheading}>
        {t("gatherings:addMonth.cover.heading")}
      </h3>
      <Collapse isOpen={!isUploadShown}>
        <SharedCoverPreview
          templateCoverUrl={templateCoverUrl}
          templateTitle={templateTitle}
          cover={cover}
        />
      </Collapse>
      <div id={pickerId}>
        <Collapse isOpen={isUploadShown}>
          <CoverUpload
            value={hasLivePick ? (cover?.key ?? "") : ""}
            onChange={handleKeyChange}
            onPreviewChange={handlePreviewChange}
            labelledBy={headingId}
          />
        </Collapse>
      </div>
      <div className={styles.coverActions}>
        <Collapse isOpen={!hasLivePick}>
          <Button
            variant="quiet"
            size="sm"
            aria-expanded={isPickerOpen}
            aria-controls={pickerId}
            onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
          >
            {t("gatherings:addMonth.cover.replace")}
          </Button>
        </Collapse>
        <Collapse isOpen={cover !== null}>
          <Button variant="quiet" size="sm" onClick={restoreTemplateCover}>
            {t("gatherings:addMonth.cover.useTemplate")}
          </Button>
        </Collapse>
      </div>
    </div>
  );
}
