import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { hoodLabelKey } from "../createGathering.data";
import { findFormat, OTHER_FORMAT_KEY } from "../gatheringCatalog";
import type { GatheringForm } from "../useGatheringForm";
import { ONLINE_HOOD_VALUE } from "./dateNotes.data";
import { scheduleInstants } from "./schedulePair";
import { MAX_TITLE_SUGGESTIONS } from "./whatChapter.data";

/** The form fields a suggestion is built from. */
export type TitleSuggestionInput = Pick<
  GatheringForm,
  | "isFormatChosen"
  | "format"
  | "otherText"
  | "venue"
  | "hood"
  | "cap"
  | "date"
  | "time"
  | "endDate"
  | "endTime"
  | "scheduleValid"
>;

/** The chosen format's name as a host would say it: their own words for
 *  "something else", the catalog name otherwise. */
function chosenFormatName(form: TitleSuggestionInput, t: TFunction): string {
  if (form.format === OTHER_FORMAT_KEY) return form.otherText.trim();
  const formatEntry = findFormat(form.format);
  return formatEntry ? t(formatEntry.nameKey) : "";
}

/**
 * Plain titles the host can take with one press, built from what the form
 * already knows: "Supper club at Damas", "Thursday supper club, 8 seats",
 * "Supper club in Graça", "Supper club: first edition".
 *
 * Only while a format is chosen (the caller also waits for an empty title).
 * The venue line wins over the neighbourhood line, and "first edition" is the
 * fallback for a host who has said neither where nor when. An online
 * gathering has no neighbourhood to name.
 */
export function titleSuggestions(
  form: TitleSuggestionInput,
  { t, fmt }: { t: TFunction; fmt: Formatters },
): string[] {
  if (!form.isFormatChosen) return [];
  const formatName = chosenFormatName(form, t);
  if (!formatName) return [];

  const venue = form.venue.trim();
  const { startInstant } = scheduleInstants(form);
  const capacity = Number.parseInt(form.cap, 10);
  const hoodKey =
    form.hood && form.hood !== ONLINE_HOOD_VALUE
      ? hoodLabelKey(form.hood)
      : undefined;
  const hoodName = hoodKey ? t(hoodKey) : "";

  const suggestions: string[] = [];
  if (venue) {
    suggestions.push(
      t("gatherings:create.v2.what.suggestion.atVenue", {
        format: formatName,
        venue,
      }),
    );
  }
  if (startInstant && Number.isFinite(capacity) && capacity > 0) {
    suggestions.push(
      t("gatherings:create.v2.what.suggestion.weekday", {
        weekday: fmt.date(startInstant, { weekday: "long" }),
        format: formatName,
        formatLower: formatName.toLocaleLowerCase(),
        count: capacity,
      }),
    );
  }
  if (!venue && hoodName) {
    suggestions.push(
      t("gatherings:create.v2.what.suggestion.inHood", {
        format: formatName,
        hood: hoodName,
      }),
    );
  }
  if (!venue && !startInstant) {
    suggestions.push(
      t("gatherings:create.v2.what.suggestion.firstEdition", {
        format: formatName,
      }),
    );
  }
  return suggestions.slice(0, MAX_TITLE_SUGGESTIONS);
}
