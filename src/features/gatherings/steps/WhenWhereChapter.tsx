import type { GatheringForm } from "../useGatheringForm";
import { DateNotes } from "./DateNotes";
import { PlaceFields } from "./PlaceFields";
import { RepeatsFields } from "./RepeatsFields";
import { SameAsLastTimeStrip } from "./SameAsLastTimeStrip";
import { ScheduleFields } from "./ScheduleFields";

/**
 * Chapter 2, "When and where?": the "same as last time" offer, the schedule
 * with its date notes, the place (neighbourhood, venue, then the join link or
 * the address), and the repeat rule with its series. The shell supplies the
 * intro and the Continue footer.
 *
 * Anchors: `GATE_ANCHOR.date` on the start pair, `GATE_ANCHOR.hood` on the
 * neighbourhood, `GATE_ANCHOR.joinLink` on the join link and
 * `GATE_ANCHOR.recurrence` on the series end field.
 */
export function WhenWhereChapter({ form }: { form: GatheringForm }) {
  return (
    <>
      <SameAsLastTimeStrip form={form} />
      <ScheduleFields form={form} />
      <DateNotes form={form} />
      <PlaceFields form={form} />
      <RepeatsFields form={form} />
    </>
  );
}
