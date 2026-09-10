import { DatePicker, FormField } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MAX_GATHERING_SPAN_DAYS } from "./createGathering.data";
import type { GatheringDetailsDraft } from "./EditDetailsModal";
import { gatheringWhen } from "./gatheringSchedule";
import { editScheduleProblem } from "./manageGatheringState";

/**
 * The start and end fields of the edit-details modal, together with the two
 * messages that hang off the end field: why a save is being held, and the span
 * the host is about to save read back to them.
 *
 * Split out of `EditDetailsModal` so both components stay inside the 200-line
 * rule. The two fields are one decision gated by one rule, so they move as a
 * pair and the reasoning below travels with them.
 */
export function EditDetailsSchedule({
  draft,
  onChangeStartAt,
  onChangeEndAt,
}: {
  /** The whole draft, since `editScheduleProblem` gates on a draft object and
   *  reads both schedule fields against each other. */
  draft: GatheringDetailsDraft;
  onChangeStartAt: (value: string) => void;
  onChangeEndAt: (value: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Lives in `manageGatheringState` beside the patch builder it gates, so the
  // rule that decides whether a schedule may be saved and the code that puts
  // it on the wire cannot drift apart. See `editScheduleProblem` for why the
  // span is measured in elapsed milliseconds.
  const scheduleProblem = editScheduleProblem(draft);
  // Say WHY the save is being held. A disabled button with nothing beside it
  // is exactly the dead end this field was added to remove, so the message
  // names the fix in the host's own terms. `FormField` puts it in the end
  // field's `aria-describedby`, so a screen reader hears it on a control that
  // can resolve it.
  //
  // It hangs off the END field alone even though the edit that usually causes
  // it is moving the START, which is why the copy names BOTH moves ("move the
  // start earlier, the end later, or clear the end"). Repeating the same
  // sentence under both fields would put one complaint on screen twice and
  // read it out twice, and a host who has just dragged their start is looking
  // at the two fields together.
  const scheduleErrorMessage =
    scheduleProblem === "endBeforeStart"
      ? t("gatherings:manage.editModal.endBeforeStartError")
      : scheduleProblem === "spanTooLong"
        ? t("gatherings:manage.editModal.endSpanError", {
            days: MAX_GATHERING_SPAN_DAYS,
          })
        : undefined;
  // The span the host is about to save, read back to them. A 04:00 end is the
  // case worth showing: on its own it looks like the evening ends before it
  // starts, and `gatheringWhen` is the one place that knows to say "(next
  // day)". One helper line under the field it describes, which is as much as
  // this form's density has room for.
  //
  // DELIBERATELY IN THE EDITING HOST'S OWN ZONE, and it can disagree with the
  // public page. No `timeZone` is passed, so `gatheringWhen` reads the days
  // and prints the clock in the reader's zone, while the gathering page runs
  // the same formatter through `eventZoneFormat` and reads them in the
  // GATHERING's zone. A host editing a Lisbon gathering from São Paulo sees a
  // summary here that can differ by a day from the one attendees see there.
  //
  // That is the honest reading for this surface rather than an oversight. The
  // two `DatePicker`s above already speak the host's own zone: their
  // `"yyyy-mm-ddThh:mm"` wire values are local wall-clock times that
  // `buildEditPatch` turns into instants with `new Date(...)`. A summary in
  // some other zone would name hours that are nowhere on the form the host is
  // filling in. Fixing the disagreement means moving the whole modal onto the
  // gathering's zone, pickers included, which is a change to what those two
  // fields MEAN and belongs in its own piece of work.
  const startInstant = new Date(draft.startAt);
  const endInstant = new Date(draft.endAt);
  const scheduleSummary =
    draft.endAt !== "" &&
    scheduleProblem === null &&
    !Number.isNaN(startInstant.getTime()) &&
    !Number.isNaN(endInstant.getTime())
      ? gatheringWhen(startInstant, endInstant, fmt, t)
      : null;
  const scheduleSummaryMessage = scheduleSummary
    ? [
        t("gatherings:manage.editModal.endSummary", {
          date: scheduleSummary.dateText,
          time: scheduleSummary.timeText,
        }),
        scheduleSummary.nextDayNote,
      ]
        .filter(Boolean)
        .join(" ")
    : undefined;

  return (
    <>
      <FormField
        label={t("gatherings:manage.editModal.fieldDateTime")}
        required
      >
        <DatePicker
          mode="datetime"
          value={draft.startAt || null}
          onChange={(value) => onChangeStartAt(value ?? "")}
        />
      </FormField>
      {/* Optional, and clearable: `DatePicker`'s own `clearable` control
          emits `null`, which `?? ""` reads as the "no stated end" sentinel,
          so a host can take an end off a gathering as well as put one on.
          Directly under the start, because the two are one decision.

          `min` steers away from the invalid range before an error is needed:
          the calendar greys out every day before the start, and a typed day
          segment clamps up to it. It is DAY-level only in `datetime` mode
          (`parseDateBound` reads the date prefix and `parseTimeBound`
          answers null for anything but `mode="time"`), so an end typed at
          04:00 on the start's own day still needs the message above, and the
          gate in `editScheduleProblem` stays the real authority.

          It composes with the clear control rather than fighting it.
          `canClear` reads `clearable && value != null`, never the bounds,
          and clearing calls `onChange(null)` directly, so `min` cannot hold
          a value in the field. Nor can it quietly rewrite one the host
          already set: `DateField` clamps on keystrokes (arrow-step and digit
          entry) and never in response to the bound moving, so pushing the
          start past the end leaves the end exactly as the host left it and
          says so, instead of editing it behind their back. */}
      <FormField
        label={t("gatherings:manage.editModal.fieldEndAt")}
        helper={scheduleSummaryMessage}
        error={scheduleErrorMessage}
      >
        <DatePicker
          mode="datetime"
          clearable
          min={draft.startAt || undefined}
          value={draft.endAt || null}
          onChange={(value) => onChangeEndAt(value ?? "")}
        />
      </FormField>
    </>
  );
}
