import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { formatLabel, OTHER_FORMAT_KEY } from "../gatheringCatalog";
import { gatheringOccurrences } from "../gatheringOccurrences";
import type { GatheringForm } from "../useGatheringForm";
import { gatheringPlaceLabel, gatheringSpotsAndCostLine } from "./shareText";
import { STORY_BRAND_NAME } from "./storyImage.data";
import type { StoryImageContent } from "./storyImage";

function capitalizeFirst(text: string): string {
  return text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : text;
}

/**
 * The words and numbers the story image prints for this gathering, in the
 * host's language. A series prints its first date.
 */
export function buildStoryContent(
  form: GatheringForm,
  { t, fmt, displayUrl }: { t: TFunction; fmt: Formatters; displayUrl: string },
): StoryImageContent {
  const startAt = gatheringOccurrences(form)[0] ?? null;
  const storedFormat =
    form.format === OTHER_FORMAT_KEY ? form.otherText : form.format;
  const clock = startAt
    ? fmt.time(startAt, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
    : "";
  return {
    brandName: STORY_BRAND_NAME,
    formatName: formatLabel(t, storedFormat).toLocaleUpperCase(),
    dayNumber: startAt ? String(startAt.getDate()) : "",
    weekday: startAt
      ? capitalizeFirst(fmt.date(startAt, { weekday: "long" }))
      : "",
    monthAndTime: startAt
      ? `${capitalizeFirst(fmt.date(startAt, { month: "long" }))} · ${clock}`
      : "",
    title: form.title.trim(),
    place:
      gatheringPlaceLabel(form, t) ||
      t("gatherings:create.v2.success.storyPlaceFallback"),
    details: gatheringSpotsAndCostLine(form, t),
    displayUrl,
  };
}
