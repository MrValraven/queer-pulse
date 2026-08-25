import { useEffect, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ConfirmDialog, ImageSlot } from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type UploadKind } from "../members/api/useUploadImage";
import { PhotoPickerModal } from "../members/PhotoPickerModal";
import styles from "./SubprofileEditor.module.css";

interface ImageUploadFieldProps {
  value: string;
  /** Saved reframe crop for `value` (the currently-committed image), shown
   *  until a fresh pick this session supersedes it. Pass this ONLY when the
   *  rendered slot's box is locked to the crop's own pixel aspect (e.g. a
   *  `circle` avatar slot where `width === height`) — never for a freeform
   *  (work-image) slot, whose box aspect doesn't match an arbitrary crop. */
  crop?: CropRect;
  /** Saved crop for `value` rendered as a FOCAL POINT rather than an exact
   *  frame — for a non-circle slot (the cover), whose box aspect never matches
   *  the crop's. Superseded by a fresh pick's own crop while one is showing. */
  focus?: CropRect;
  onChange: (key: string) => void;
  /**
   * Optional: report the local, immediately-renderable preview URL to the
   * parent (or `null` on clear). `onChange` only surfaces the storage `key`,
   * which is NOT fetchable — so a live preview elsewhere (e.g. the persona
   * editor's docked card) has nothing to show for a freshly picked image until
   * it's saved and the backend resolves a display URL. Wire this to render the
   * pick instantly there too. For a device upload the URL is a `blob:` URL; for
   * a past-upload pick it's the resolved absolute URL.
   */
  onPreviewChange?: (previewUrl: string | null, crop?: CropRect) => void;
  /** Which upload surface — sets size/dimension limits (avatar vs work image). */
  kind: UploadKind;
  circle?: boolean;
  size?: number;
  placeholder?: string;
}

/**
 * Image picker used across the editor: an image slot plus add / change / remove.
 * The actual sourcing — upload-from-device OR reuse a past upload (with delete) —
 * happens in the shared `PhotoPickerModal`; this component only opens it and
 * applies the result. It shows the picked preview for an instant render and
 * calls `onChange` with the storage `key` — the value that actually gets
 * persisted.
 *
 * The preview is tied to the `value` prop rather than kept as free-floating
 * local state: a pick is only shown while the parent still holds the `key` it
 * was picked for. The moment the parent reverts `value` (a Discard / baseline
 * revert, which the parent drives without re-notifying this field), the pick
 * no longer matches and the field snaps back to the reverted value — and the
 * stale `blob:` URL is revoked. Without this, a discarded pick would linger on
 * screen forever.
 */
export function ImageUploadField({
  value,
  crop,
  focus,
  onChange,
  onPreviewChange,
  kind,
  circle = false,
  size = 150,
  placeholder,
}: ImageUploadFieldProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  // The picked (key, previewUrl, crop) triple. Shown only while `pick.key ===
  // value`; once the parent reverts `value` the pick is stale (see below).
  const [pick, setPick] = useState<{
    key: string;
    url: string;
    crop?: CropRect;
  } | null>(null);
  const resolvedPlaceholder =
    placeholder ?? t("subprofiles:imageUpload.defaultPlaceholder");

  // A pick only shows while the parent still holds the key it was picked for;
  // once the parent reverts `value` (Discard / baseline revert) it's stale and
  // hidden. Its blob URL is revoked when the pick is replaced or on unmount (the
  // cleanup below) — never left showing, never leaked.
  const previewUrl = pick && pick.key === value ? pick.url : null;
  // The crop to render: a fresh pick's own crop while it's showing, else the
  // saved crop the parent passed in for the currently-committed `value`.
  const displayedCrop = pick && pick.key === value ? pick.crop : crop;
  // Same pairing for the focal-point slot: a fresh pick's own crop wins while
  // it's showing, else the saved crop for the committed value.
  const displayedFocus = pick && pick.key === value ? pick.crop : focus;

  useEffect(() => {
    // Revoke the previous pick's blob when it's replaced, and the last one on
    // unmount. Revoking a non-`blob:` URL is a harmless no-op, so this is safe
    // for both device uploads and past-upload picks.
    if (!pick) return;
    return () => URL.revokeObjectURL(pick.url);
  }, [pick]);

  function handlePick(key: string, newPreviewUrl: string, newCrop?: CropRect) {
    // Single-slot field — replacing `pick` revokes the previous blob via the
    // effect cleanup above.
    setPick({ key, url: newPreviewUrl, crop: newCrop });
    onChange(key);
    // The crop rides along so a live preview elsewhere (the editor's docked
    // card) frames the fresh pick the way the member just framed it, instead of
    // falling back to the crop saved for the image they just replaced.
    onPreviewChange?.(newPreviewUrl, newCrop);
  }

  function clear() {
    // Clearing changes `value` to "", which makes the current pick stale — the
    // derived `previewUrl` stops showing it; its blob is revoked on the next
    // pick or on unmount.
    onChange("");
    onPreviewChange?.(null);
  }

  const displayedValue = previewUrl ?? value;

  return (
    <div
      className={`${styles.imgField} ${circle ? styles.avatarField : ""}`}
      aria-busy={pickerOpen || undefined}
    >
      <ImageSlot
        tint="plum"
        shape={circle ? "circle" : "rounded"}
        src={displayedValue || undefined}
        width={circle ? size : "100%"}
        height={size}
        radius={14}
        placeholder={resolvedPlaceholder}
        // `circle` is the only mode where width===height, matching a locked
        // 1:1 avatar crop's own pixel aspect — the non-circle mode (cover /
        // work-image) box isn't guaranteed to match its crop's aspect, so it
        // always renders uncropped regardless of what the caller passed in.
        crop={circle ? displayedCrop : undefined}
        // The non-circle (cover) slot renders the crop as a focal point — its
        // box is a fixed-height strip that never matches the crop's aspect, so
        // an exact `crop` here would distort it.
        focus={circle ? undefined : displayedFocus}
      />
      <div className={styles.imgActions}>
        <button
          type="button"
          className={styles.smallBtn}
          onClick={() => setPickerOpen(true)}
        >
          <FiCamera size={14} aria-hidden />
          {displayedValue
            ? t("subprofiles:imageUpload.change")
            : t("subprofiles:imageUpload.add")}
        </button>
        {displayedValue && (
          <button
            type="button"
            className={styles.smallBtn}
            aria-label={t("subprofiles:imageUpload.remove")}
            onClick={() => setConfirmRemoveOpen(true)}
          >
            <FiTrash2 size={14} aria-hidden />
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirmRemoveOpen}
        tone="destructive"
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={() => {
          clear();
          setConfirmRemoveOpen(false);
        }}
        title={t("subprofiles:imageUpload.removeConfirm.title")}
        description={t("subprofiles:imageUpload.removeConfirm.body")}
        confirmLabel={t("subprofiles:imageUpload.removeConfirm.confirm")}
        cancelLabel={t("subprofiles:imageUpload.removeConfirm.cancel")}
      />
      {pickerOpen && (
        <PhotoPickerModal
          kind={kind}
          currentValue={value}
          onPick={handlePick}
          onDeletedCurrent={clear}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
