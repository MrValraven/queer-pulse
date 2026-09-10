import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./EditDetailsModal";
import {
  findFormat,
  formatsForFamily,
  GATHERING_FAMILIES,
  MAX_OTHER_FORMAT_LENGTH,
  OTHER_FORMAT_KEY,
  OTHER_FORMAT_NAME_KEY,
  stripDisallowedDetails,
  type FormatDetailKey,
  type FormatDetails,
  type GatheringFamily,
} from "./gatheringCatalog";
import { FormatDetailsFields } from "./steps/FormatDetailsFields";

/**
 * The family, format and format-details fields of the edit-details modal, so
 * a gathering filed under the wrong kind can be moved after it is published
 * instead of being deleted and written again.
 *
 * Split out of `EditDetailsModal` so both components stay inside the 200-line
 * rule, and because these four fields are ONE decision: the family decides
 * which formats exist, whether the host's own words are asked for, and which
 * of the six questions are put. Keeping them together keeps the rule that
 * moves them together in one place too.
 *
 * The whole draft comes in and a partial draft goes back out, the same shape
 * `EditDetailsSchedule` uses, since a family change writes three fields at
 * once and the modal owns the draft.
 */
export function EditDetailsFormat({
  draft,
  onChange,
}: {
  draft: GatheringDetailsDraft;
  /** Merged into the draft by the modal. */
  onChange: (patch: Partial<GatheringDetailsDraft>) => void;
}) {
  const { t } = useTranslation();

  const chooseFamily = (value: string | null) => {
    const nextFamily = (value ?? "") as GatheringFamily | "";
    onChange({
      gatheringFamily: nextFamily,
      // A format only means something inside its own family, and a detail
      // answer only belongs to the question its family asks. Both go with the
      // family rather than being left pointing at a question nobody is asking
      // any more. "Something else" is the one format that survives every
      // family, because it is offered inside all nine.
      format:
        findFormat(draft.format)?.family === nextFamily
          ? draft.format
          : draft.format === OTHER_FORMAT_KEY
            ? OTHER_FORMAT_KEY
            : "",
      formatDetails:
        stripDisallowedDetails(nextFamily || null, draft.formatDetails) ?? {},
    });
  };

  const changeDetail = <Key extends FormatDetailKey>(
    key: Key,
    value: FormatDetails[Key],
  ) => {
    const nextDetails: FormatDetails = { ...draft.formatDetails };
    // An emptied field is the same fact as a question never answered, so the
    // key leaves the bag rather than sitting in it as an empty string.
    if (value === undefined || (typeof value === "string" && value === "")) {
      delete nextDetails[key];
    } else {
      nextDetails[key] = value;
    }
    onChange({ formatDetails: nextDetails });
  };

  return (
    <>
      <FormField label={t("gatherings:manage.editModal.fieldFamily")}>
        <Select
          label={t("gatherings:manage.editModal.fieldFamily")}
          options={[
            { value: "", label: t("gatherings:manage.editModal.familyNone") },
            ...GATHERING_FAMILIES.map((family) => ({
              value: family.key,
              label: t(family.nameKey),
            })),
          ]}
          value={draft.gatheringFamily}
          onChange={chooseFamily}
        />
      </FormField>
      {draft.gatheringFamily !== "" && (
        <FormField label={t("gatherings:manage.editModal.fieldFormat")}>
          <Select
            label={t("gatherings:manage.editModal.fieldFormat")}
            options={[
              { value: "", label: t("gatherings:manage.editModal.formatNone") },
              ...formatsForFamily(draft.gatheringFamily).map((format) => ({
                value: format.key,
                label: t(format.nameKey),
              })),
              { value: OTHER_FORMAT_KEY, label: t(OTHER_FORMAT_NAME_KEY) },
            ]}
            value={draft.format}
            onChange={(value) => onChange({ format: value ?? "" })}
          />
        </FormField>
      )}
      {draft.format === OTHER_FORMAT_KEY && (
        <FormField label={t("gatherings:manage.editModal.fieldFormatOther")}>
          <input
            type="text"
            maxLength={MAX_OTHER_FORMAT_LENGTH}
            value={draft.otherText}
            onChange={(event) => onChange({ otherText: event.target.value })}
          />
        </FormField>
      )}
      {draft.gatheringFamily !== "" && (
        <FormatDetailsFields
          family={draft.gatheringFamily}
          details={draft.formatDetails}
          onChange={changeDetail}
        />
      )}
    </>
  );
}
