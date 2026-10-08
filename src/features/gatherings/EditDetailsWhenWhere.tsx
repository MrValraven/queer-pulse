import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { editFieldDomId } from "./editDetailsChanges";
import { EditDetailsCost } from "./EditDetailsCost";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsSchedule } from "./EditDetailsSchedule";
import { EditDetailsSection } from "./EditDetailsSection";
import fieldStyles from "./EditDetailsFields.module.css";

/**
 * "When and where" in the edit-details modal: the start and end, the
 * location, and what it costs.
 *
 * Split out of `EditDetailsModal` so the modal stays inside the 200-line rule.
 * The start, end and location fields carry ids, since those are the fields
 * that can hold Save and the footer's "Show the field" goes to them.
 *
 * The section's grid holds the schedule's two fields side by side, the
 * "Runs ..." line and the end's error under the end. The schedule returns a
 * fragment and the one-field "Date and time" editor stacks it as before, so
 * the pairing lives here alone.
 *
 * An emptied start or location says so under its own field, by the same
 * rule that holds Save (`canSaveEditDraft`).
 */
export function EditDetailsWhenWhere({
  draft,
  editorId,
  onSetField,
  onChange,
}: {
  draft: GatheringDetailsDraft;
  /** The modal's own id, the prefix of the field ids "Show the field" uses. */
  editorId: string;
  onSetField: <FieldName extends keyof GatheringDetailsDraft>(
    key: FieldName,
    value: GatheringDetailsDraft[FieldName],
  ) => void;
  /** Merged into the draft by the modal. */
  onChange: (patch: Partial<GatheringDetailsDraft>) => void;
}) {
  const { t } = useTranslation();
  return (
    <EditDetailsSection sectionKey="whenWhere">
      <div className={fieldStyles.fieldGrid}>
        <EditDetailsSchedule
          draft={draft}
          onChangeStartAt={(value) => onSetField("startAt", value)}
          onChangeEndAt={(value) => onSetField("endAt", value)}
          fieldIds={{
            startAt: editFieldDomId(editorId, "startAt"),
            endAt: editFieldDomId(editorId, "endAt"),
          }}
          startError={
            draft.startAt.trim() === ""
              ? t("gatherings:manage.editModal.startRequiredError")
              : undefined
          }
          pickerClassName={fieldStyles.schedulePicker}
        />
        <FormField
          id={editFieldDomId(editorId, "location")}
          className={fieldStyles.fullRow}
          label={t("gatherings:manage.editModal.fieldLocation")}
          required
          error={
            draft.location.trim() === ""
              ? t("gatherings:manage.editModal.locationRequiredError")
              : undefined
          }
        >
          <input
            type="text"
            value={draft.location}
            onChange={(event) => onSetField("location", event.target.value)}
          />
        </FormField>
        <EditDetailsCost
          costKind={draft.costKind}
          cost={draft.cost}
          onChange={onChange}
        />
      </div>
    </EditDetailsSection>
  );
}
