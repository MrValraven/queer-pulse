import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useEventHostScope } from "../eventHostScope";
import { CapacityStepper } from "../fields/CapacityStepper";
import type { GatheringForm } from "../useGatheringForm";

/**
 * The wizard's capacity question: the shared `CapacityStepper`, wired to the
 * form.
 *
 * The buttons move the number by one inside the 2..200 range and count as the
 * host touching the field, exactly as typing does, so the format default stops
 * following the family from the first press. An empty field means no cap; a
 * press from empty starts at the minimum.
 */
export function CapacityStepperField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const { isHouseEvent } = useEventHostScope();
  /**
   * Whether the number on screen is still the format's own suggestion, so the
   * hint under the field is true when it says so.
   *
   * `capacityDefault` is already null once the host has touched the field, and
   * the value comparison covers the other way in: a duplicated gathering that
   * carried no capacity seeds `cap` as an empty string and skips the default,
   * and an empty field must not be told what its number means.
   */
  const formatDefaultCapacity =
    form.capacityDefault !== null &&
    form.cap !== "" &&
    form.cap === String(form.capacityDefault)
      ? form.capacityDefault
      : null;
  const defaultLine =
    formatDefaultCapacity === null
      ? null
      : t("gatherings:create.step3.capDefaultHint", {
          count: formatDefaultCapacity,
        });
  // The host holds one of the spots themselves (the server saves their Going
  // RSVP on publish), so a cap of 8 means 7 guests. Said only while there is
  // a cap to count against. QueerPulse takes no seat at an event it hosts, so
  // there the field says what it counts, unless the format's default line is
  // already saying so.
  const hintLines = isHouseEvent
    ? [defaultLine ?? t("admin:musicEvents.house.capacityHint")]
    : [
        defaultLine,
        form.cap === "" ? null : t("gatherings:create.step3.capHostHint"),
      ].filter(Boolean);

  return (
    <CapacityStepper
      label={t("gatherings:create.step3.capLabel")}
      // The default line shows only while the number on screen is still the
      // format's own suggestion. Once the host changes it, that line goes: a
      // line claiming a default that no longer applies is worse than none.
      hint={hintLines.length > 0 ? hintLines.join(" ") : undefined}
      value={form.cap}
      onChange={(value) => form.setCapTouched(value)}
    />
  );
}
