import type { TFunction } from "../../../shared/i18n/types";
import { hoodLabelKey } from "../createGathering.data";
import { COST_KIND_LABEL_KEYS } from "../gatheringExtras";
import type { GatheringForm } from "../useGatheringForm";
import { GENERIC_HOOD_LABEL_KEY, ONLINE_HOOD_VALUE } from "./shareKit.data";

/** The form fields the share text reads. */
export type ShareTextForm = Pick<
  GatheringForm,
  "hood" | "venue" | "cap" | "cost" | "costKind"
>;

const DETAIL_SEPARATOR = " · ";

/** The neighbourhood as a reader sees it; empty for "Other in Lisbon". */
function hoodDisplayName(hood: string, t: TFunction): string {
  const labelKey = hoodLabelKey(hood);
  if (!labelKey) return hood.trim();
  return labelKey === GENERIC_HOOD_LABEL_KEY ? "" : t(labelKey);
}

/**
 * Where the gathering happens, as public share text: "venue, neighbourhood",
 * "Online" for an online gathering, or "" when the host named no place. The
 * street address stays out: it belongs to confirmed attendees.
 */
export function gatheringPlaceLabel(form: ShareTextForm, t: TFunction): string {
  if (form.hood === ONLINE_HOOD_VALUE) return t("gatherings:common.online");
  const parts: string[] = [];
  for (const part of [form.venue.trim(), hoodDisplayName(form.hood, t)]) {
    const isDuplicate = parts.some(
      (existing) => existing.toLowerCase() === part.toLowerCase(),
    );
    if (part && !isDuplicate) parts.push(part);
  }
  return parts.join(", ");
}

/** What it costs, in the design's words: "Free", "Pay what you can · 5 to 15
 *  EUR", or the fixed price the host wrote. */
export function gatheringCostLabel(form: ShareTextForm, t: TFunction): string {
  const costText = form.cost.trim();
  const kindLabel = t(COST_KIND_LABEL_KEYS[form.costKind]);
  if (form.costKind === "free") return kindLabel;
  if (form.costKind === "pay-what-you-can") {
    return costText ? `${kindLabel}${DETAIL_SEPARATOR}${costText}` : kindLabel;
  }
  return costText || kindLabel;
}

/** "14 spots · Free", or just the cost when there is no cap. */
export function gatheringSpotsAndCostLine(
  form: ShareTextForm,
  t: TFunction,
): string {
  const capacity = Number.parseInt(form.cap, 10);
  const spots =
    Number.isFinite(capacity) && capacity > 0
      ? t("gatherings:create.v2.success.storySpots", { count: capacity })
      : "";
  return [spots, gatheringCostLabel(form, t)]
    .filter(Boolean)
    .join(DETAIL_SEPARATOR);
}
