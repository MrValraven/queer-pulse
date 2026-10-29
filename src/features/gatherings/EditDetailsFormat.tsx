import { useId } from "react";
import { FiLock } from "react-icons/fi";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./EditDetailsModal";
import { useEventHostScope } from "./eventHostScope";
import {
  findFamily,
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
import fieldStyles from "./EditDetailsFields.module.css";

/**
 * A field value the host scope fixes, shown as quiet static text with a lock.
 * A group named after the field and described by the field's hint, because a
 * plain paragraph takes neither a label's `for` nor `aria-describedby`.
 * `FormField` leaves a custom component unwired, so the name and the hint are
 * attached here.
 */
function LockedFieldValue({
  fieldName,
  describedById,
  children,
}: {
  fieldName: string;
  describedById: string;
  children: string;
}) {
  return (
    <div
      role="group"
      aria-label={fieldName}
      aria-describedby={describedById}
      className={fieldStyles.lockedValue}
    >
      <FiLock aria-hidden />
      {children}
    </div>
  );
}

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
 *
 * Every field here is a direct child of the section's grid (the fragment and
 * the questions' own fragment both flatten into it). The family keeps its
 * half while no family is picked, so the format opens beside it in the
 * other half and the family field never jumps in width.
 *
 * "Something else" with no words of its own holds Save (`canSaveEditDraft`),
 * so the words field is required and says so under itself while empty.
 *
 * A host scope with a `fixedFamily` (QueerPulse music events) shows that
 * family as locked static text with a hint, and the format list holds its formats plus "Something
 * else".
 */
export function EditDetailsFormat({
  draft,
  onChange,
  otherTextFieldId,
}: {
  draft: GatheringDetailsDraft;
  /** Merged into the draft by the modal. */
  onChange: (patch: Partial<GatheringDetailsDraft>) => void;
  /** The id of the "Name your format" field's wrapper, so the modal's
   *  "Show the field" can reach it while its empty words hold Save. */
  otherTextFieldId?: string;
}) {
  const { t } = useTranslation();
  const lockedHelperId = useId();
  const { fixedFamily } = useEventHostScope();
  const fixedFamilyEntry = findFamily(fixedFamily);
  // The family the format list and the questions follow.
  const familyKey = fixedFamily ?? draft.gatheringFamily;

  const chooseFamily = (value: string | null) => {
    const nextFamily = (value ?? "") as GatheringFamily | "";
    onChange({
      gatheringFamily: nextFamily,
      // A format only means something inside its own family, and a detail
      // answer only belongs to the question its family asks. Both go with the
      // family rather than being left pointing at a question nobody is asking
      // any more. "Something else" is the one format that survives every
      // family, because it is offered inside all ten.
      format:
        findFormat(draft.format)?.family === nextFamily
          ? draft.format
          : draft.format === OTHER_FORMAT_KEY
            ? OTHER_FORMAT_KEY
            : "",
      formatDetails:
        stripDisallowedDetails(
          nextFamily || null,
          draft.formatDetails,
          findFormat(draft.format)?.family === nextFamily ? draft.format : null,
        ) ?? {},
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
      {fixedFamilyEntry ? (
        <FormField
          label={t("gatherings:manage.editModal.fieldFamily")}
          helper={t("shared:apiError.musicEvent.familyLocked")}
          helperId={lockedHelperId}
        >
          <LockedFieldValue
            fieldName={t("gatherings:manage.editModal.fieldFamily")}
            describedById={lockedHelperId}
          >
            {t(fixedFamilyEntry.nameKey)}
          </LockedFieldValue>
        </FormField>
      ) : (
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
      )}
      {familyKey !== "" && (
        <FormField label={t("gatherings:manage.editModal.fieldFormat")}>
          <Select
            label={t("gatherings:manage.editModal.fieldFormat")}
            options={[
              { value: "", label: t("gatherings:manage.editModal.formatNone") },
              ...formatsForFamily(familyKey).map((format) => ({
                value: format.key,
                label: t(format.nameKey),
              })),
              { value: OTHER_FORMAT_KEY, label: t(OTHER_FORMAT_NAME_KEY) },
            ]}
            value={draft.format}
            onChange={(value) =>
              onChange({
                format: value ?? "",
                formatDetails:
                  stripDisallowedDetails(
                    familyKey || null,
                    draft.formatDetails,
                    value,
                  ) ?? {},
              })
            }
          />
        </FormField>
      )}
      {draft.format === OTHER_FORMAT_KEY && (
        <FormField
          id={otherTextFieldId}
          className={fieldStyles.fullRow}
          label={t("gatherings:manage.editModal.fieldFormatOther")}
          required
          error={
            draft.otherText.trim() === ""
              ? t("gatherings:manage.editModal.otherFormatRequiredError")
              : undefined
          }
        >
          <input
            type="text"
            maxLength={MAX_OTHER_FORMAT_LENGTH}
            value={draft.otherText}
            onChange={(event) => onChange({ otherText: event.target.value })}
          />
        </FormField>
      )}
      {familyKey !== "" && (
        <FormatDetailsFields
          family={familyKey}
          formatKey={draft.format}
          details={draft.formatDetails}
          onChange={changeDetail}
        />
      )}
    </>
  );
}
