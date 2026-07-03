import { useRef, useState } from "react";
import { FiImage, FiX } from "react-icons/fi";
import styles from "./SubmitStoryPage.module.css";

export function SubmitStoryCover({
  onChange,
}: {
  onChange: (name: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cover, setCover] = useState<{ url: string; name: string } | null>(
    null,
  );

  function pick(file: File | undefined) {
    if (!file) return;
    if (cover) URL.revokeObjectURL(cover.url);
    const url = URL.createObjectURL(file);
    setCover({ url, name: file.name });
    onChange(file.name);
  }

  function remove() {
    if (cover) URL.revokeObjectURL(cover.url);
    setCover(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        hidden
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {cover ? (
        <div className={styles.coverPreview}>
          <img
            className={styles.coverImg}
            src={cover.url}
            alt="Cover preview"
          />
          <div className={styles.coverMeta}>
            <div className={styles.coverName}>{cover.name}</div>
            <div className={styles.coverActions}>
              <button
                type="button"
                className={styles.coverLink}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
              <button
                type="button"
                className={styles.coverLink}
                onClick={remove}
              >
                <FiX aria-hidden="true" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.coverDrop}
          onClick={() => inputRef.current?.click()}
        >
          <FiImage className={styles.coverIcon} aria-hidden="true" />
          <p>Add a cover image</p>
          <span>
            JPG or PNG · min 1200 × 600px · displayed at top of published story
          </span>
        </button>
      )}
    </div>
  );
}
