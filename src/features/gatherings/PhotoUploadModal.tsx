import { useEffect, useState } from "react";
import { FiCheck, FiImage, FiUploadCloud } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./PhotoUploadModal.module.css";

export interface RecapPhoto {
  id: string;
  caption: string;
  tint: "coral" | "jade" | "plum";
}

interface PhotoUploadModalProps {
  onClose: () => void;
  onSubmit: (photo: RecapPhoto) => void;
}

// Simulated "files" the member can pick — no real file IO in this prototype.
const SAMPLE_FILES = [
  { label: "terrace-morning.jpg", tint: "coral" as const },
  { label: "long-table.jpg", tint: "jade" as const },
  { label: "the-toast.jpg", tint: "plum" as const },
];

export function PhotoUploadModal({ onClose, onSubmit }: PhotoUploadModalProps) {
  useScrollLock();
  const [picked, setPicked] = useState(0);
  const [caption, setCaption] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={
          done ? `${styles.dialog} ${styles.dialogConfirm}` : styles.dialog
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-title"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className={styles.confirm}>
            <span className={styles.confirmIcon} aria-hidden>
              <FiCheck />
            </span>
            <h2 id="photo-title" className={styles.confirmTitle}>
              Added to <em>the recap</em>
            </h2>
            <p className={styles.confirmBody}>
              Thanks for sharing — your photo is now in the gallery for everyone
              who was there.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({
                id: `photo-${Date.now()}`,
                caption: caption.trim() || "A moment from the day",
                tint: SAMPLE_FILES[picked]!.tint,
              });
              setDone(true);
            }}
          >
            <h2 id="photo-title" className={styles.dialogTitle}>
              <FiImage aria-hidden /> Add a photo
            </h2>
            <p className={styles.dialogSub}>
              Share a moment from the gathering. Choose a photo and add a
              caption.
            </p>

            <div className={styles.preview}>
              <ImageSlot
                tint={SAMPLE_FILES[picked]!.tint}
                height={150}
                radius={12}
                placeholder="your photo"
              />
            </div>

            <div className={styles.fieldLabel}>Choose a photo</div>
            <div className={styles.fileRow}>
              {SAMPLE_FILES.map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  className={[styles.fileBtn, picked === i && styles.fileBtnOn]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setPicked(i)}
                >
                  <FiUploadCloud aria-hidden /> {f.label}
                </button>
              ))}
            </div>

            <label className={styles.fieldLabel} htmlFor="photo-caption">
              Caption
            </label>
            <input
              id="photo-caption"
              className={styles.input}
              type="text"
              placeholder="Say something about this moment…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              autoFocus
            />

            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add photo
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
