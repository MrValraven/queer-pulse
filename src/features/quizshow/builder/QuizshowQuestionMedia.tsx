import { useEffect, useId, useRef, useState } from "react";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDiscardableUploads } from "../../members/api/useDiscardableUploads";
import { ImageUploadField } from "../../subprofiles/ImageUploadField";
import { copyPicturePreview } from "./quizshowPicturePreview";
import styles from "./QuizshowQuestionEditor.module.css";

/** Height of the picture slot in pixels. */
const MEDIA_SLOT_HEIGHT = 160;

interface QuizshowQuestionMediaProps {
  mediaRef: string | null;
  /** Preview of the saved or just picked image. */
  mediaUrl: string | null;
  /** The "needs a picture" line. */
  errorText?: string;
  /** Every picture key other questions of the draft or the saved quiz still use. */
  otherReferencedMediaRefs?: readonly string[];
  /** The draft's own preview of the picture picked for `mediaRef` in this edit. */
  pickedPreviewUrl?: string | null;
  /** Hands the draft a preview of a fresh pick that outlives this field. */
  onPickedPreview?: (mediaRef: string, previewUrl: string) => void;
  onChange: (mediaRef: string | null, mediaUrl?: string | null) => void;
}

/**
 * The question's picture, uploaded as an `event-cover`. A fresh upload the host
 * abandons is taken back when this field leaves the page, except the picture
 * the question holds at that moment.
 */
export function QuizshowQuestionMedia({
  mediaRef,
  mediaUrl,
  errorText,
  otherReferencedMediaRefs = [],
  pickedPreviewUrl = null,
  onPickedPreview,
  onChange,
}: QuizshowQuestionMediaProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const { track, discard } = useDiscardableUploads();
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const currentKeyRef = useRef(mediaRef);

  const otherKeysRef = useRef(otherReferencedMediaRefs);

  useEffect(() => {
    currentKeyRef.current = mediaRef;
    otherKeysRef.current = otherReferencedMediaRefs;
  }, [mediaRef, otherReferencedMediaRefs]);

  useEffect(() => {
    const currentKey = currentKeyRef;
    const otherKeys = otherKeysRef;
    return () => {
      // A key another question still uses is only dropped from this one.
      const keptKeys = [currentKey.current, ...otherKeys.current].filter(
        (key): key is string => Boolean(key),
      );
      void discard(keptKeys);
    };
  }, [discard]);

  // A picture picked in this mount previews through its key (the field shows
  // its own pick for it). Once the field has remounted, a picture picked
  // earlier in this edit previews through the draft's copy, and a saved one
  // through the url the server resolved for it.
  // A blob: url the field made dies when the field unmounts, so a draft url
  // that is one falls back to the key.
  const isPickedHere = mediaRef !== null && mediaRef === pickedKey;
  const isBlobUrl = mediaUrl?.startsWith("blob:") ?? false;
  const fallbackValue = isBlobUrl
    ? (mediaRef ?? "")
    : (mediaUrl ?? mediaRef ?? "");
  const value = isPickedHere ? mediaRef : (pickedPreviewUrl ?? fallbackValue);

  return (
    <div className={styles.mediaField} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={styles.groupLabel}>
        {t("quizshow:questions.media.label")}
      </span>
      <ImageUploadField
        kind="event-cover"
        value={value}
        size={MEDIA_SLOT_HEIGHT}
        isPosterAware
        onUploaded={track}
        onChange={(key) => {
          // Set at once: the preview callback can fire in the same tick and
          // must carry this key.
          currentKeyRef.current = key || null;
          setPickedKey(key || null);
          onChange(key || null, key ? undefined : null);
        }}
        onPreviewChange={(previewUrl) => {
          const pickedMediaRef = currentKeyRef.current;
          const isFreshBlob = previewUrl?.startsWith("blob:") ?? false;
          // The field revokes its own blob: url when it unmounts, so the
          // draft gets a copy it owns for the slot to show after a remount.
          if (
            previewUrl &&
            isFreshBlob &&
            pickedMediaRef !== null &&
            onPickedPreview
          ) {
            void copyPicturePreview(previewUrl).then((copyUrl) => {
              if (copyUrl !== null) onPickedPreview(pickedMediaRef, copyUrl);
            });
          }
          // The field previews a fresh pick itself; the draft keeps only urls
          // that outlive it.
          onChange(pickedMediaRef, isFreshBlob ? null : previewUrl);
        }}
      />
      <Collapse isOpen={Boolean(errorText)}>
        <p className={styles.problem} role="alert">
          {errorText}
        </p>
      </Collapse>
    </div>
  );
}
