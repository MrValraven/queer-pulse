import { useEffect, useState } from "react";
import { FiCheck, FiImage, FiUploadCloud } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
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
              <Translation
                i18nKey="gatherings:recap.upload.confirmTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.confirmBody}>
              {t("gatherings:recap.upload.confirmBody")}
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                {t("gatherings:recap.upload.doneCta")}
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({
                id: `photo-${Date.now()}`,
                caption:
                  caption.trim() || t("gatherings:recap.upload.defaultCaption"),
                tint: SAMPLE_FILES[picked]!.tint,
              });
              setDone(true);
            }}
          >
            <h2 id="photo-title" className={styles.dialogTitle}>
              <FiImage aria-hidden /> {t("gatherings:recap.upload.title")}
            </h2>
            <p className={styles.dialogSub}>
              {t("gatherings:recap.upload.subtitle")}
            </p>

            <div className={styles.preview}>
              <ImageSlot
                tint={SAMPLE_FILES[picked]!.tint}
                height={150}
                radius={12}
                placeholder={t("gatherings:recap.upload.photoPlaceholder")}
              />
            </div>

            <div className={styles.fieldLabel}>
              {t("gatherings:recap.upload.choosePhotoLabel")}
            </div>
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
              {t("gatherings:recap.upload.captionLabel")}
            </label>
            <input
              id="photo-caption"
              className={styles.input}
              type="text"
              placeholder={t("gatherings:recap.upload.captionPlaceholder")}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              autoFocus
            />

            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>
                {t("gatherings:recap.upload.cancelCta")}
              </Button>
              <Button variant="primary" type="submit">
                {t("gatherings:recap.upload.addPhotoCta")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
