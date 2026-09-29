import { useState } from "react";
import {
  Modal,
  Button,
  FormField,
  SegmentedControl,
  Select,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { DeskTrack } from "./deskTrack";
import { CommissionDetailsFields } from "./CommissionDetailsFields";
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
  /** The picked writer (`null` for none); its name bylines a scratch brief. */
  writerId: string | null;
  writerName: string | null;
}

interface CommissionModalProps {
  /** `isExternal`: no submitter account, so the editor names the writer. */
  pitch?: { title: string; byline: string; note: string; isExternal: boolean };
  sectionName?: string;
  /**
   * The section taxonomy from `useMagazineSections`, the seeded rows in live
   * mode (PRD-130). It arrives EMPTY while loading and after a failure, which
   * disables the picker: the Issue plan can never count a sectionless piece.
   */
  sections: { name: string }[];
  writers: { id: string; name: string }[];
  /** True while the writer roster loads, or after it failed to. */
  isWriterListUnavailable: boolean;
  /** Track pre-selected to match the desk's active tab. */
  defaultTrack: DeskTrack;
  /** Whether an issue is selected — the Issue choice is disabled without one. */
  hasCurrentIssue: boolean;
  /** The selected issue's display number, for the Issue choice label. */
  issueNumber: string;
  onClose: () => void;
  onCommission: (payload: CommissionPayload) => void;
}

/** Commission a pitch into a brief, or start one from scratch: the angle,
 *  where it runs, how long, by when, and who writes it. */
export function CommissionModal({
  pitch,
  sectionName,
  sections,
  writers,
  isWriterListUnavailable,
  defaultTrack,
  hasCurrentIssue,
  issueNumber,
  onClose,
  onCommission,
}: CommissionModalProps) {
  const { t } = useTranslation();
  const [angle, setAngle] = useState(pitch?.note ?? "");
  // The taxonomy can land after this modal opens, so the editor's pick is an
  // OVERRIDE over a derived default: a late list fills the picker without an
  // effect and never swaps out a section the editor already picked.
  const [sectionOverride, setSectionOverride] = useState<string | null>(
    sectionName ?? null,
  );
  const section = sectionOverride ?? sections[0]?.name ?? "";
  const [words, setWords] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fee, setFee] = useState("");
  const [writerId, setWriterId] = useState("");
  const hasNoSections = sections.length === 0;
  const isWriterPickerShown = !pitch || pitch.isExternal;

  // Without a selected issue there's nowhere to bind an issue piece, and the
  // "everything" scope names no issue, so both pre-select Unassigned.
  const [track, setTrack] = useState<DeskTrack>(
    hasCurrentIssue && defaultTrack === "issue" ? "issue" : "unassigned",
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
      writerId: writerId || null,
      writerName:
        writers.find((writer) => writer.id === writerId)?.name ?? null,
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
      <CommissionDetailsFields
        words={words}
        dueDate={dueDate}
        fee={fee}
        onWordsChange={setWords}
        onDueDateChange={setDueDate}
        onFeeChange={setFee}
        writers={isWriterPickerShown ? writers : null}
        isWriterListUnavailable={isWriterListUnavailable}
        writerId={writerId}
        onWriterChange={setWriterId}
      />
    </Modal>
  );
}
