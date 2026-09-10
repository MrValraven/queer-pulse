import {
  CONFIRM_GATE_LABEL_KEYS,
  GATE_ANCHOR,
  TOTAL_STEPS,
  confirmAnchor,
} from "./createGathering.data";
import { OTHER_FORMAT_KEY } from "./gatheringCatalog";
import type { GatheringForm } from "./useGatheringForm";

/**
 * What a single step asks of the host before the wizard will move on.
 *
 * This file is the ONE place that answers "can this step advance, and if not,
 * why". The page used to answer it twice: a `isStepComplete` switch that
 * disabled the button, and a separate ternary chain that wrote the tooltip.
 * The two drifted (the publish tooltip still said "all three boxes" long after
 * the pricing confirmation was removed and only two were left), and a host
 * reading a wrong reason for a disabled button has no way to tell it is wrong.
 * Now the gate and the on-screen checklist read the same rows.
 */
export interface StepRequirement {
  /** Stable identity for React keys; never shown. */
  key: string;
  /** Namespaced catalog key, phrased as the action still to take. */
  labelKey: string;
  met: boolean;
  /**
   * The id of the field group this row is about (see `GATE_ANCHOR`), so the
   * checklist can send the host straight to it instead of only naming it.
   */
  anchor: string;
  /**
   * A constraint on an OPTIONAL field, listed only while it is violated.
   * "The join link is valid" ticked green against a field the host chose to
   * leave empty reads as a demand for something the wizard does not want.
   */
  onlyWhenUnmet?: boolean;
}

/**
 * Does this step gate the wizard at all?
 *
 * Type (0) and date/place (1) hold everything the backend refuses to create an
 * event without; review (last) holds the two publish pledges. Repeats (2) and
 * capacity (3) are entirely skippable: a host can walk straight through both
 * and still publish. Steps 2 and 3 can still raise a requirement row once the
 * host opts into something (a repeat rule needs a valid end condition), which
 * is why "required step" and "has unmet requirements" stay separate questions.
 */
export function isStepRequired(stepIndex: number): boolean {
  return stepIndex === 0 || stepIndex === 1 || stepIndex === TOTAL_STEPS - 1;
}

/** Every requirement of a step, met or not. */
export function stepRequirements(
  form: GatheringForm,
  stepIndex: number,
): StepRequirement[] {
  if (stepIndex === 0) {
    return [
      // Step 1 asks two questions now. The first row covers the pair of
      // pickers, so a host who has chosen nothing reads one line about
      // choosing. The second row is the constraint "Something else" adds, and
      // it appears ONLY for a host who picked it and left the box empty: for
      // everyone else it is met from the start, so "Name your own format"
      // never asks for words the wizard does not want. Together the two rows
      // are exactly `form.isFormatChosen`, so the gate itself is unchanged.
      {
        key: "type",
        labelKey: "gatherings:create.gate.type",
        met: Boolean(form.family) && Boolean(form.format),
        anchor: GATE_ANCHOR.type,
      },
      {
        key: "format",
        labelKey: "gatherings:create.gate.format",
        met:
          form.format !== OTHER_FORMAT_KEY || form.otherText.trim().length > 0,
        anchor: GATE_ANCHOR.format,
        onlyWhenUnmet: true,
      },
      {
        key: "title",
        labelKey: "gatherings:create.gate.title",
        met: form.title.trim().length > 0,
        anchor: GATE_ANCHOR.title,
      },
    ];
  }
  if (stepIndex === 1) {
    return [
      {
        key: "date",
        labelKey: "gatherings:create.gate.date",
        met: form.dateValid && form.scheduleValid,
        anchor: GATE_ANCHOR.date,
      },
      // The online gathering's join link (PRD-182). Optional, so it earns a row
      // only once the host has typed something the backend's `@IsUrl` would
      // reject: catching it here turns a 400 four steps later into a line the
      // host can act on now.
      {
        key: "joinLink",
        labelKey: "gatherings:create.gate.joinLink",
        met: form.onlineUrlValid,
        anchor: GATE_ANCHOR.joinLink,
        onlyWhenUnmet: true,
      },
    ];
  }
  if (stepIndex === 2) {
    return [
      {
        key: "recurrence",
        labelKey: "gatherings:create.gate.recurrence",
        met: form.recurrenceValid,
        anchor: GATE_ANCHOR.recurrence,
        onlyWhenUnmet: true,
      },
    ];
  }
  if (stepIndex === TOTAL_STEPS - 1) {
    // One row per pledge rather than a single "tick every box", so a host who
    // has ticked one of the two is told which one is still open.
    return CONFIRM_GATE_LABEL_KEYS.map((labelKey, index) => ({
      key: `confirm-${index}`,
      labelKey,
      met: form.checks[index] ?? false,
      anchor: confirmAnchor(index),
    }));
  }
  return [];
}

/** The rows worth putting on screen: constraint rows drop out once satisfied. */
export function visibleStepRequirements(
  form: GatheringForm,
  stepIndex: number,
): StepRequirement[] {
  return stepRequirements(form, stepIndex).filter(
    (requirement) => !requirement.onlyWhenUnmet || !requirement.met,
  );
}

/** Can the wizard advance from this step? */
export function isStepSatisfied(
  form: GatheringForm,
  stepIndex: number,
): boolean {
  return stepRequirements(form, stepIndex).every(
    (requirement) => requirement.met,
  );
}
