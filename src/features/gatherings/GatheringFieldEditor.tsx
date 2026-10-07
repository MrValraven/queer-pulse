import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsSchedule } from "./EditDetailsSchedule";
import { FieldEditorCapacity } from "./FieldEditorCapacity";
import { FieldEditorDescription } from "./FieldEditorDescription";
import { FieldEditorShell } from "./FieldEditorShell";
import { canSaveFieldEdit } from "./manageGatheringState";

export type GatheringEditableField = "schedule" | "capacity" | "description";

/**
 * One detail of a published gathering, edited on its own from the manage
 * page's Overview rows. Each editor holds the WHOLE saved draft and changes
 * only its own field, so a save goes through the same `GatheringDetailsDraft`
 * the full edit-details modal uses. Save is gated by `canSaveFieldEdit`, which
 * checks that one field alone: a real change the server will take. Venue has
 * its own editor (`EditVenueModal`) because it saves through a callback that
 * keeps the directory listing link.
 */
export function GatheringFieldEditor({
  field,
  initial,
  onClose,
  onSave,
}: {
  field: GatheringEditableField;
  /** The full saved draft, built by the page's `editDraftFor(gatheringState)`. */
  initial: GatheringDetailsDraft;
  onClose: () => void;
  /** Called with the WHOLE draft, only this field's values changed. */
  onSave: (draft: GatheringDetailsDraft) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<GatheringDetailsDraft>(initial);
  // The capacity editor's No limit switch. It opens on when the gathering has
  // no limit, and only the switch itself moves it.
  const [isCapacityUnlimited, setIsCapacityUnlimited] = useState(
    initial.capacity.trim() === "",
  );
  const merge = (patch: Partial<GatheringDetailsDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));
  // With the switch off an empty stepper is a number still being typed, so it
  // holds Save. Saving it would lift the limit while the switch says there
  // is one.
  const isCapacityNumberMissing =
    field === "capacity" &&
    !isCapacityUnlimited &&
    draft.capacity.trim() === "";
  const isSaveEnabled =
    !isCapacityNumberMissing && canSaveFieldEdit(field, draft, initial);

  const save = () => {
    if (!isSaveEnabled) return;
    onSave(draft);
    onClose();
  };

  const shellProps = { isSaveEnabled, onSave: save, onClose };

  if (field === "schedule") {
    return (
      <FieldEditorShell
        {...shellProps}
        title={t("gatherings:manage.fieldEditor.scheduleTitle")}
        sub={t("gatherings:manage.fieldEditor.scheduleSub")}
      >
        <EditDetailsSchedule
          draft={draft}
          startLabel={t("gatherings:create.step2.dateLabel")}
          onChangeStartAt={(value) => merge({ startAt: value })}
          onChangeEndAt={(value) => merge({ endAt: value })}
        />
      </FieldEditorShell>
    );
  }

  if (field === "capacity") {
    return (
      <FieldEditorShell
        {...shellProps}
        title={t("gatherings:manage.details.capacity")}
        sub={t("gatherings:manage.fieldEditor.capacitySub")}
      >
        <FieldEditorCapacity
          draft={draft}
          openedWithCapacity={initial.capacity}
          onChange={(value) => merge({ capacity: value })}
          isUnlimited={isCapacityUnlimited}
          onUnlimitedChange={setIsCapacityUnlimited}
        />
      </FieldEditorShell>
    );
  }

  return (
    <FieldEditorDescription
      {...shellProps}
      value={draft.description}
      onChange={(value) => merge({ description: value })}
    />
  );
}
