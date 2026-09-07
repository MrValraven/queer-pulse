import { useRequiredFieldValidation } from "../../shared/hooks/useWizardForm";
import {
  CAUSE_PICKER_CONTROL_ID,
  commitmentLabelControlId,
  REQUIRED_FIELD_LABEL_KEYS,
  REQUIRED_FIELDS,
  requiredFieldControlId,
  taskTitleControlId,
  type RequiredField,
} from "./postVolunteerOpportunity.data";
import type { PostOpportunityState } from "./postOpportunityState";

/**
 * One entry in the "still missing" list under the submit button. Generic rather
 * than a bare field name because the list mixes two kinds of thing: the six
 * required core fields, and any repeatable row that has a detail typed under an
 * empty title.
 */
export interface MissingFormField {
  /** Stable identity, and the React key. */
  key: string;
  /** i18n key naming the field, resolved by the checklist. */
  labelKey: string;
  /** Interpolation values for `labelKey`, e.g. a row number. */
  labelValues?: Record<string, string | number>;
  /** DOM id of the control the entry jumps to. */
  controlId: string;
}

/**
 * Everything that decides whether the post/edit opportunity form may be
 * submitted, and what the form says while it may not be.
 *
 * Two kinds of thing block a submit. The six required core fields, blank or
 * (for the spots count) filled with something that isn't a positive number.
 * And an unfinished repeatable row: `toDto` sends a task or commitment only
 * when its leading field is filled, so a row carrying nothing but a detail
 * would vanish silently somewhere between the form and the server. Naming it
 * instead makes it the poster's call to either title the row or clear it.
 *
 * Both kinds land in one ordered `missingFields` list, which the checklist
 * under the submit button renders and the button's disabled state reads.
 */
export function usePostOpportunityValidation(state: PostOpportunityState) {
  const requiredValidation = useRequiredFieldValidation({
    values: state,
    requiredFields: REQUIRED_FIELDS,
    buildError: () => "This field is required.",
  });

  const spotsNumber = Number.parseInt(state.spotsTotal, 10);
  const isSpotsCountValid = Number.isFinite(spotsNumber) && spotsNumber > 0;

  // Causes cannot ride `REQUIRED_FIELDS`, which drives a shared hook that tests
  // strings for emptiness. It is an array, and it starts empty on purpose (see
  // `EMPTY` in `postOpportunityState.ts`): a pre-filled default would file
  // every unread form under one cause. The backend's `@ArrayNotEmpty` rejects
  // an empty array, so catching it here is what turns a 400 into a named row in
  // the checklist.
  const hasCause = state.causes.length > 0;

  const untitledTaskIndexes = state.tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => !task.title.trim() && task.description.trim())
    .map(({ index }) => index);
  const unlabelledCommitmentIndexes = state.commitments
    .map((commitment, index) => ({ commitment, index }))
    .filter(
      ({ commitment }) => !commitment.label.trim() && commitment.detail.trim(),
    )
    .map(({ index }) => index);

  // Page order: the core fields as they appear, then the optional rows below
  // them. Walking the list top to bottom walks the form downwards.
  const missingCoreFields: MissingFormField[] = REQUIRED_FIELDS.filter(
    (field) =>
      requiredValidation.missingFields.includes(field) ||
      (field === "spotsTotal" && !isSpotsCountValid),
  ).map((field) => ({
    key: field,
    labelKey: REQUIRED_FIELD_LABEL_KEYS[field],
    controlId: requiredFieldControlId(field),
  }));

  // Spliced in rather than appended, because the cause picker sits third on the
  // form (after `org` and `role`) and this list is read as a walk down the
  // page. The position is counted from what is actually missing rather than
  // anchored to `role`, which may not be in the list at all.
  if (!hasCause) {
    const fieldsAboveCause = REQUIRED_FIELDS.slice(
      0,
      REQUIRED_FIELDS.indexOf("time"),
    );
    const insertAt = missingCoreFields.filter((field) =>
      fieldsAboveCause.includes(field.key as RequiredField),
    ).length;
    missingCoreFields.splice(insertAt, 0, {
      key: "causes",
      labelKey: "marketing:postOpportunity.core.causeLabel",
      controlId: CAUSE_PICKER_CONTROL_ID,
    });
  }

  const missingFields: MissingFormField[] = [
    ...missingCoreFields,
    ...untitledTaskIndexes.map((index) => ({
      key: `task-${index}`,
      labelKey: "marketing:postOpportunity.missing.taskTitle",
      labelValues: { index: index + 1 },
      controlId: taskTitleControlId(index),
    })),
    ...unlabelledCommitmentIndexes.map((index) => ({
      key: `commitment-${index}`,
      labelKey: "marketing:postOpportunity.missing.commitmentLabel",
      labelValues: { index: index + 1 },
      controlId: commitmentLabelControlId(index),
    })),
  ];

  /**
   * The inline error under a core field, or null while it is fine or the form
   * has not been submitted yet. A spots count that is filled but not a positive
   * number gets its own line: "required" would be a lie about a filled field.
   */
  const errorFor = (field: RequiredField): string | null => {
    if (
      field === "spotsTotal" &&
      state.spotsTotal.trim() &&
      !isSpotsCountValid &&
      requiredValidation.hasBeenSubmitted
    ) {
      return "Enter a number of spots greater than zero.";
    }
    return requiredValidation.errorFor(field);
  };

  /** True once the poster has tried to submit AND the row is still unfinished.
   *  The repeatable rows have no `FormField` to carry an error, so this becomes
   *  `aria-invalid` on the row's leading input — which is also what lets a
   *  rejected submit move focus there. */
  const isTaskTitleMissing = (index: number): boolean =>
    requiredValidation.hasBeenSubmitted && untitledTaskIndexes.includes(index);
  const isCommitmentLabelMissing = (index: number): boolean =>
    requiredValidation.hasBeenSubmitted &&
    unlabelledCommitmentIndexes.includes(index);

  return {
    /** True when nothing at all is blocking a submit. */
    isValid: missingFields.length === 0,
    missingFields,
    errorFor,
    isTaskTitleMissing,
    isCommitmentLabelMissing,
    markTouched: requiredValidation.markSubmitted,
    spotsNumber,
  };
}
