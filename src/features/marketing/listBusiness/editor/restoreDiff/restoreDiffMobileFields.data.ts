import {
  mobileDetailsForPayload,
  type ListingMobileDetails,
} from "../../listingMobile.data";
import type { RestoreFieldChange } from "./restoreDiff.types";
import {
  fieldLabelKey,
  isFieldChanged,
  LIST_SEPARATOR,
  yesNoLabel,
  type RestoreDiffContext,
} from "./restoreDiffFields.data";

/**
 * "Where you work" as the review shows it: one entry per answer that
 * differs, each under the label the form gives it. The comparison runs on
 * the shape a save sends, so parishes kept in the draft while "All of
 * Lisbon" is on never count as a change.
 */
export function mobileDetailsFields(
  context: RestoreDiffContext,
): RestoreFieldChange[] {
  if (!isFieldChanged(context, "mobileDetails")) return [];
  const { t } = context;
  const before = mobileDetailsForPayload(context.current);
  const after = mobileDetailsForPayload(context.saved);
  const entries: RestoreFieldChange[] = [];
  const choice = (
    name: string,
    describe: (details: ListingMobileDetails) => string,
  ) => {
    const beforeText = describe(before);
    const afterText = describe(after);
    if (beforeText === afterText) return;
    entries.push({
      kind: "choice",
      key: `mobileDetails.${name}`,
      labelKey: fieldLabelKey(name),
      before: beforeText,
      after: afterText,
    });
  };
  choice("whereYouWork", (details) =>
    details.allOfCity
      ? t("marketing:listBusiness.step1.whereYouWork.allOfCity")
      : details.parishes.join(LIST_SEPARATOR),
  );
  choice("alsoTravelsTo", (details) =>
    details.alsoTravelsTo.join(LIST_SEPARATOR),
  );
  choice("byAppointment", (details) => yesNoLabel(t, details.byAppointment));
  return entries;
}
