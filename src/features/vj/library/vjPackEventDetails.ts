import type {
  VjPackDTO,
  VjPackEventSummaryDTO,
} from "../../../shared/contracts/vj";

/**
 * The pack's linked event with its title and start, or null when the pack
 * links no event or the server withheld both. A holder of the `vj_operator`
 * grant gets the withheld shape (`VjPackEventWithheldSummaryDTO`: the id and
 * `isAvailable` alone) once members can no longer see the event, so every
 * reader of the title or the start goes through here.
 */
export function vjPackEventDetailsOf(
  event: VjPackDTO["event"],
): VjPackEventSummaryDTO | null {
  if (event === null || !("title" in event) || !("startAt" in event)) {
    return null;
  }
  return event;
}
