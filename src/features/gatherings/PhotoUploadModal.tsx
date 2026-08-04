import { useId, useState } from "react";
import { FiImage, FiUploadCloud } from "react-icons/fi";
import { Button, ImageSlot, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
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
  const { t } = useTranslation();
  const captionId = useId();
  const [picked, setPicked] = useState(0);
  const [caption, setCaption] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    onSubmit({
      id: `photo-${Date.now()}`,
      caption: caption.trim() || t("gatherings:recap.upload.defaultCaption"),
      tint: SAMPLE_FILES[picked]!.tint,
    });
    setDone(true);
  };

  if (done) {
    return (
      <GatheringSuccessPanel
        title={
          <Translation
            i18nKey="gatherings:recap.upload.confirmTitle"
            components={{ em: <em /> }}
          />
        }
        sub={t("gatherings:recap.upload.confirmBody")}
        onClose={onClose}
        closeLabel={t("gatherings:recap.upload.doneCta")}
      />
    );
  }

  return (
    <Modal
      title={
        <>
          <FiImage aria-hidden /> {t("gatherings:recap.upload.title")}
        </>
      }
      sub={t("gatherings:recap.upload.subtitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={submit}>
            {t("gatherings:recap.upload.addPhotoCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:recap.upload.cancelCta")}
          </Button>
        </>
      }
    >
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
        {SAMPLE_FILES.map((file, index) => (
          <button
            key={file.label}
            type="button"
            className={[styles.fileBtn, picked === index && styles.fileBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setPicked(index)}
          >
            <FiUploadCloud aria-hidden /> {file.label}
          </button>
        ))}
      </div>

      <label className={styles.fieldLabel} htmlFor={captionId}>
        {t("gatherings:recap.upload.captionLabel")}
      </label>
      <input
        id={captionId}
        className={styles.input}
        type="text"
        placeholder={t("gatherings:recap.upload.captionPlaceholder")}
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
      />
    </Modal>
  );
}
