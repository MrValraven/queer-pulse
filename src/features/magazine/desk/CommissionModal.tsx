import { useState } from "react";
import {
  Modal,
  Button,
  DatePicker,
  FormField,
  SegmentedControl,
  Select,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { DeskTrack } from "./DeskTrackTabs";
import styles from "./DeskModals.module.css";

export interface CommissionPayload {
  angle: string;
  section: string;
  words: number | null;
  dueDate: string;
  fee: string;
  /** Which track the new piece lands in — `issue` stamps the selected issue's
   *  id, `unassigned` leaves it unfiled (`issueId: null`) for someone to
   *  assign later. */
  track: DeskTrack;
}

interface CommissionModalProps {
  pitch?: { title: string; byline: string; note: string };
  sectionName?: string;
  /**
   * The section taxonomy from `useMagazineSections` (seeded rows in live
   * mode, the canonical fixture in demo). PRD-130: this used to be the demo
   * `DEMO_SECTIONS` constant even in live mode, so an editor commissioned
   * into a hand-curated list the backend had never heard of.
   *
   * It arrives EMPTY while the fetch is in flight and after it fails, and
   * that empty case is what disables the picker below. Commissioning into no
   * section at all is worse than being told to wait: the piece would carry a
   * section the Issue plan can never count.
   */
  sections: { name: string }[];
  /** Track pre-selected to match the desk's active tab. */
  defaultTrack: DeskTrack;
  /** Whether an issue is selected — the Issue choice is disabled without one. */
  hasCurrentIssue: boolean;
  /** The selected issue's display number, for the Issue choice label. */
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
  // The taxonomy is fetched now, so it can land after this modal is already
  // open (the desk opens it on a keystroke). The editor's choice is therefore
  // held as an OVERRIDE and the effective section derived below, so a list
  // that arrives late fills the picker on the next render without an effect,
  // and without ever swapping out a section the editor has already picked.
  const [sectionOverride, setSectionOverride] = useState<string | null>(
    sectionName ?? null,
  );
  const section = sectionOverride ?? sections[0]?.name ?? "";
  const [words, setWords] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fee, setFee] = useState("");
  const hasNoSections = sections.length === 0;

  // Without a selected issue there's nowhere to bind an issue piece, so a
  // commission can only land unfiled.
  const [track, setTrack] = useState<DeskTrack>(
    hasCurrentIssue ? defaultTrack : "unassigned",
  );

  const send = () => {
    // Belt and braces behind the disabled button: a brief with no section is
    // rejected by the backend and orphaned in the Issue plan either way.
    if (!section) return;
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
          <Button variant="primary" onClick={send} disabled={!section}>
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
                value: "unassigned",
                label: t("magazine:desk.modals.commission.trackUnassigned"),
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
        <FormField
          label={t("magazine:desk.modals.commission.sectionLabel")}
          error={
            hasNoSections
              ? t("magazine:desk.modals.commission.sectionsUnavailable")
              : undefined
          }
        >
          <Select
            value={section}
            onChange={setSectionOverride}
            disabled={hasNoSections}
            placeholder={
              hasNoSections
                ? t("magazine:desk.modals.commission.sectionsEmptyOption")
                : undefined
            }
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
