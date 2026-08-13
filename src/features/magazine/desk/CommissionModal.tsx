import { useState } from "react";
import { Modal, Button, DatePicker, FormField, SegmentedControl, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { DeskTrack } from "./DeskTrackTabs";
import styles from "./DeskModals.module.css";

export interface CommissionPayload {
  angle: string;
  section: string;
  words: number | null;
  dueDate: string;
  fee: string;
  /** Which editorial track the new piece lands in — `issue` stamps the current
   *  issue's id, `highlights` leaves it standalone (`issueId: null`). */
  track: DeskTrack;
}

interface CommissionModalProps {
  pitch?: { title: string; byline: string; note: string };
  sectionName?: string;
  sections: { name: string }[];
  /** Track pre-selected to match the desk's active tab. */
  defaultTrack: DeskTrack;
  /** Whether a current issue exists — the Issue choice is disabled without one. */
  hasCurrentIssue: boolean;
  /** The current issue's display number, for the Issue choice label. */
  issueNumber: string;
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
  defaultTrack,
  hasCurrentIssue,
  issueNumber,
  onClose,
  onCommission,
}: CommissionModalProps) {
  const { t } = useTranslation();
  const [angle, setAngle] = useState(pitch?.note ?? "");
  const [section, setSection] = useState(sectionName ?? sections[0]?.name ?? "");
  const [words, setWords] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fee, setFee] = useState("");
  // Without a current issue there's nowhere to bind an issue piece, so a
  // commission can only land as a standalone highlight.
  const [track, setTrack] = useState<DeskTrack>(
    hasCurrentIssue ? defaultTrack : "highlights",
  );

  const send = () => {
    onCommission({
      angle: angle.trim(),
      section,
      words: words.trim() ? Number(words) : null,
      dueDate,
      fee: fee.trim(),
      track,
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
      {!pitch && (
        <FormField label={t("magazine:desk.modals.commission.trackLabel")}>
          <SegmentedControl
            label={t("magazine:desk.modals.commission.trackLabel")}
            value={track}
            onChange={(value) => setTrack(value as DeskTrack)}
            options={[
              {
                value: "highlights",
                label: t("magazine:desk.modals.commission.trackHighlights"),
              },
              {
                value: "issue",
                label: t("magazine:desk.modals.commission.trackIssue", {
                  number: issueNumber,
                }),
              },
            ]}
            disabledOptions={hasCurrentIssue ? undefined : ["issue"]}
          />
        </FormField>
      )}
      <FormField label={t("magazine:desk.modals.commission.angleLabel")}>
        <textarea
          rows={4}
          value={angle}
          onChange={(event) => setAngle(event.target.value)}
        />
      </FormField>
      <div className={styles.row}>
        <FormField label={t("magazine:desk.modals.commission.sectionLabel")}>
          <Select
            value={section}
            onChange={(value) => setSection(value ?? "")}
            options={sections.map((option) => ({
              value: option.name,
              label: option.name,
            }))}
          />
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
          <DatePicker
            mode="date"
            label={t("magazine:desk.modals.commission.dueDateLabel")}
            value={dueDate || null}
            onChange={(value) => setDueDate(value ?? "")}
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
