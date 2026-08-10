import { useState } from "react";
import { Modal, Button, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskModals.module.css";

export interface CommissionPayload {
  angle: string;
  section: string;
  words: number | null;
  dueDate: string;
  fee: string;
}

interface CommissionModalProps {
  pitch?: { title: string; byline: string; note: string };
  sectionName?: string;
  sections: { name: string }[];
  onClose: () => void;
  onCommission: (payload: CommissionPayload) => void;
}

/**
 * Commission a pitch into a brief — or start a brief from scratch when no
 * pitch prompted it. Same fields either way: the angle, where it runs, how
 * long, and by when.
 */
export function CommissionModal({
  pitch,
  sectionName,
  sections,
  onClose,
  onCommission,
}: CommissionModalProps) {
  const { t } = useTranslation();
  const [angle, setAngle] = useState(pitch?.note ?? "");
  const [section, setSection] = useState(sectionName ?? sections[0]?.name ?? "");
  const [words, setWords] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fee, setFee] = useState("");

  const send = () => {
    onCommission({
      angle: angle.trim(),
      section,
      words: words.trim() ? Number(words) : null,
      dueDate,
      fee: fee.trim(),
    });
    onClose();
  };

  return (
    <Modal
      title={
        pitch
          ? t("magazine:desk.modals.commission.titleFromPitch")
          : t("magazine:desk.modals.commission.titleFromScratch")
      }
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button variant="primary" onClick={send}>
            {t("magazine:desk.modals.commission.sendBrief")}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>
        {pitch
          ? t("magazine:desk.modals.commission.bodyFromPitch", {
              byline: pitch.byline,
            })
          : t("magazine:desk.modals.commission.bodyFromScratch")}
      </p>
      <FormField label={t("magazine:desk.modals.commission.angleLabel")}>
        <textarea
          rows={4}
          value={angle}
          onChange={(event) => setAngle(event.target.value)}
        />
      </FormField>
      <div className={styles.row}>
        <FormField label={t("magazine:desk.modals.commission.sectionLabel")}>
          <select
            value={section}
            onChange={(event) => setSection(event.target.value)}
          >
            {sections.map((option) => (
              <option key={option.name} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("magazine:desk.modals.commission.wordsLabel")}>
          <input
            type="number"
            min={0}
            value={words}
            onChange={(event) => setWords(event.target.value)}
          />
        </FormField>
      </div>
      <div className={styles.row}>
        <FormField label={t("magazine:desk.modals.commission.dueDateLabel")}>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </FormField>
        <FormField label={t("magazine:desk.modals.commission.feeLabel")}>
          <input
            type="text"
            placeholder={t("magazine:desk.modals.commission.feePlaceholder")}
            value={fee}
            onChange={(event) => setFee(event.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  );
}
