import { useRef, useState } from "react";
import { FiImage, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage } from "../members/api/useUploadImage";
import styles from "./SubmitStoryPage.module.css";
import upload from "./SubmitStoryCover.module.css";

/**
 * Story-cover picker. Uploads through `useUploadImage("story-cover")`, which
 * resolves to `{ key, previewUrl }`. The thumbnail renders `previewUrl` (an
 * instant local preview, revoked on replace/remove/unmount); `onChange` emits
 * `key` — the value that's actually persisted through the submit-story save
 * flow, never the preview URL.
 */
export function SubmitStoryCover({
  onChange,
}: {
  onChange: (key: string | null) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadCover = useUploadImage("story-cover");
  const [cover, setCover] = useState<{ previewUrl: string; name: string } | null>(
    null,
  );
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function revokeCoverPreview() {
    if (cover) URL.revokeObjectURL(cover.previewUrl);
  }

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const { key, previewUrl } = await uploadCover(file, {
        onProgress: (p) => setProgress(p),
      });
      // Single-slot picker — the previous preview (if any) is now stale, so
      // revoke it right away instead of leaving it to the hook's unmount sweep.
      revokeCoverPreview();
      setCover({ previewUrl, name: file.name });
      onChange(key);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : t("magazine:submitStory.cover.errorFallback"),
      );
    } finally {
      setProgress(null);
    }
  }

  function remove() {
    revokeCoverPreview();
    setCover(null);
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const busy = progress !== null;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label={t("magazine:submitStory.cover.addCta")}
        hidden
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {cover ? (
        <div className={styles.coverPreview}>
          <img
            className={styles.coverImg}
            src={cover.previewUrl}
            alt={t("magazine:submitStory.cover.previewAlt")}
            loading="lazy"
            decoding="async"
            width={640}
            height={200}
          />
          <div className={styles.coverMeta}>
            <div className={styles.coverName}>{cover.name}</div>
            <div className={styles.coverActions}>
              <button
                type="button"
                className={styles.coverLink}
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                {t("magazine:submitStory.cover.replaceCta")}
              </button>
              <button
                type="button"
                className={styles.coverLink}
                onClick={remove}
                disabled={busy}
              >
                <FiX aria-hidden="true" />{" "}
                {t("magazine:submitStory.cover.removeCta")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.coverDrop}
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <FiImage className={styles.coverIcon} aria-hidden="true" />
          <p>
            {busy
              ? t("magazine:submitStory.cover.uploading")
              : t("magazine:submitStory.cover.addCta")}
          </p>
          <span>{t("magazine:submitStory.cover.hint")}</span>
        </button>
      )}

      {busy && (
        <div className={upload.progress}>
          <div className={upload.progressLabel}>
            {t("magazine:submitStory.cover.uploadingProgress", { progress })}
          </div>
          <div
            className={upload.track}
            role="progressbar"
            aria-valuenow={progress ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={upload.bar}
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className={upload.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
