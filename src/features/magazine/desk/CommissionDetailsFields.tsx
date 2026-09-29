import { DatePicker, FormField, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskModals.module.css";

interface CommissionDetailsFieldsProps {
  words: string;
  dueDate: string;
  fee: string;
  onWordsChange: (words: string) => void;
  onDueDateChange: (dueDate: string) => void;
  onFeeChange: (fee: string) => void;
  /** The writer roster, or `null` to hide the picker (a member's pitch is
   *  written by its submitter). */
  writers: { id: string; name: string }[] | null;
  /** True while the roster loads or after it failed: the picker is disabled
   *  and says why, and the brief can still go out with no writer. */
  isWriterListUnavailable: boolean;
  /** The picked writer's id, `""` for none. */
  writerId: string;
  onWriterChange: (writerId: string) => void;
}

/** The commission's terms: how long, by when, for how much, and who writes it. */
export function CommissionDetailsFields({
  words,
  dueDate,
  fee,
  onWordsChange,
  onDueDateChange,
  onFeeChange,
  writers,
  isWriterListUnavailable,
  writerId,
  onWriterChange,
}: CommissionDetailsFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      {writers && (
        <FormField
          label={t("magazine:desk.modals.commission.writerLabel")}
          helper={
            isWriterListUnavailable
              ? t("magazine:desk.modals.commission.writersUnavailable")
              : undefined
          }
        >
          <Select
            value={writerId}
            disabled={isWriterListUnavailable}
            onChange={(value) => onWriterChange(value ?? "")}
            options={[
              {
                value: "",
                label: t("magazine:desk.modals.commission.writerNone"),
              },
              ...writers.map((writer) => ({
                value: writer.id,
                label: writer.name,
              })),
            ]}
          />
        </FormField>
      )}
      <div className={styles.termsRow}>
        <FormField label={t("magazine:desk.modals.commission.wordsLabel")}>
          <input
            type="number"
            min={0}
            value={words}
            onChange={(event) => onWordsChange(event.target.value)}
          />
        </FormField>
        <FormField label={t("magazine:desk.modals.commission.dueDateLabel")}>
          <DatePicker
            mode="date"
            label={t("magazine:desk.modals.commission.dueDateLabel")}
            value={dueDate || null}
            onChange={(value) => onDueDateChange(value ?? "")}
          />
        </FormField>
      </div>
      <div className={styles.termsRow}>
        <FormField label={t("magazine:desk.modals.commission.feeLabel")}>
          <input
            type="text"
            placeholder={t("magazine:desk.modals.commission.feePlaceholder")}
            value={fee}
            onChange={(event) => onFeeChange(event.target.value)}
          />
        </FormField>
      </div>
    </>
  );
}
