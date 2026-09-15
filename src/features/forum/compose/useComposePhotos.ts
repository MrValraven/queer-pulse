import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useUploadImage } from "../../members/api/useUploadImage";
import { ImageProcessingError } from "../../members/api/uploadProcessing";
import {
  COMPOSE_ALT_MAX_LENGTH,
  COMPOSE_PHOTO_LIMIT,
  type ComposePhoto,
} from "./composeThread.types";

// ── Up to four photos, each with its own description ────────────────────────
// `usePostImageAttach` stages exactly ONE image, and `ThreadComposer` and the
// old modal both still rely on that. Widening it to a gallery would change the
// shape under two working composers for the sake of a third, so this is a
// sibling wrapper around the SAME upload pipeline (`useUploadImage` → EXIF
// strip and downscale → presigned PUT) rather than a rewrite of the single-
// image hook.
//
// Same upload kind as every other post photo (`work-image`): freeform aspect,
// lenient on the minimum dimensions a phone snapshot arrives at, and served
// under the logged-in visibility the forum already uses.

/** What the page needs to render and drive the photo grid. */
export interface ComposePhotosController {
  photos: ComposePhoto[];
  /** True while at least one file is still uploading. */
  isUploading: boolean;
  /** A ready-to-render error line, or null. */
  error: string | null;
  /** The hidden file input the picker button opens. */
  inputRef: RefObject<HTMLInputElement | null>;
  openPicker: () => void;
  /** Uploads what the picker handed back, in order, stopping at the limit. */
  addFiles: (files: FileList | readonly File[] | null) => Promise<void>;
  setAlt: (index: number, alt: string) => void;
  remove: (index: number) => void;
  /** Moves one photo one place left (`-1`) or right (`1`). */
  move: (index: number, direction: -1 | 1) => void;
  /** Replaces the whole set. Used by a reset after a publish. */
  replaceAll: (photos: ComposePhoto[]) => void;
  /**
   * Applies a restored draft's photos, and only while the member has staged
   * none of their own. The draft restore resolves asynchronously (each preview
   * is probed before it is trusted), so by the time it lands the member may
   * already have picked a photo, and a restore must never eat that.
   */
  restoreIfEmpty: (photos: ComposePhoto[]) => void;
  /** True once four photos are staged, so the picker can say so. */
  hasReachedLimit: boolean;
}

export function useComposePhotos(): ComposePhotosController {
  const { t } = useTranslation();
  const upload = useUploadImage("work-image");
  const [photos, setPhotos] = useState<ComposePhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Read inside the async upload loop so a second pick started while the
  // first is still running still sees the real count and stops at four.
  // Synced in an effect rather than assigned during render: writing a ref
  // while rendering is what `react-hooks/refs` forbids, because a render React
  // throws away would still have mutated it. The loop below reads this long
  // after paint, so the one-commit lag is not observable.
  const photoCountRef = useRef(0);
  useEffect(() => {
    photoCountRef.current = photos.length;
  });

  const addFiles = useCallback(
    async (files: FileList | readonly File[] | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      setIsUploading(true);
      try {
        for (const file of Array.from(files)) {
          if (photoCountRef.current >= COMPOSE_PHOTO_LIMIT) {
            setError(
              t("forum:composePage.photo.limitReached", {
                count: COMPOSE_PHOTO_LIMIT,
              }),
            );
            break;
          }
          const result = await upload(file);
          photoCountRef.current += 1;
          setPhotos((previous) => [
            ...previous,
            { key: result.key, previewUrl: result.previewUrl, alt: "" },
          ]);
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof ImageProcessingError
            ? t(uploadError.i18nKey, uploadError.values)
            : t("communities:common.imageUploadError"),
        );
      } finally {
        setIsUploading(false);
        // Clearing the input is what lets the member re-pick the same file
        // after removing it.
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [t, upload],
  );

  const setAlt = useCallback((index: number, alt: string) => {
    // Capped here rather than on the input, so a paste and a programmatic
    // write are bounded too. See `COMPOSE_ALT_MAX_LENGTH` on why an
    // overlong description would cost the member their whole autosave.
    const bounded = alt.slice(0, COMPOSE_ALT_MAX_LENGTH);
    setPhotos((previous) =>
      previous.map((photo, position) =>
        position === index ? { ...photo, alt: bounded } : photo,
      ),
    );
  }, []);

  const remove = useCallback((index: number) => {
    setPhotos((previous) => {
      const removed = previous[index];
      // The caller owns every `previewUrl` `useUploadImage` hands back (it
      // stops tracking one the moment it returns it), so a photo the member
      // deliberately took off the post is this hook's to release. A photo
      // still on the post is never revoked: the draft restore probes that
      // exact URL to decide whether the attachment survived.
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return previous.filter((_, position) => position !== index);
    });
    setError(null);
  }, []);

  const move = useCallback((index: number, direction: -1 | 1) => {
    setPhotos((previous) => {
      const target = index + direction;
      if (index < 0 || index >= previous.length) return previous;
      if (target < 0 || target >= previous.length) return previous;
      const reordered = [...previous];
      const [moved] = reordered.splice(index, 1);
      if (!moved) return previous;
      reordered.splice(target, 0, moved);
      return reordered;
    });
  }, []);

  const replaceAll = useCallback((next: ComposePhoto[]) => {
    setPhotos(next);
  }, []);

  const restoreIfEmpty = useCallback((next: ComposePhoto[]) => {
    setPhotos((previous) => (previous.length ? previous : next));
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    photos,
    isUploading,
    error,
    inputRef,
    openPicker,
    addFiles,
    setAlt,
    remove,
    move,
    replaceAll,
    restoreIfEmpty,
    hasReachedLimit: photos.length >= COMPOSE_PHOTO_LIMIT,
  };
}
