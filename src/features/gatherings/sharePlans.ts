import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { gatheringShareUrl, type GatheringDetail } from "./data";

/**
 * The first draft of "here's where I'll be" (LOC-08).
 *
 * Composed from the catalog rather than concatenated in English, so the
 * message reads naturally in whichever language the sender is using. It
 * carries the most precise place the sender actually holds: the street address
 * once they have RSVP'd and the server has disclosed it, the venue and
 * neighbourhood before that. Nothing is invented to fill a gap.
 *
 * The sender edits this before it goes. It is their message.
 */
export function buildSharePlansMessage(
  gathering: GatheringDetail,
  t: TFunction,
  fmt: Formatters,
): string {
  const when = `${fmt.date(gathering.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
  })}, ${fmt.time(gathering.date)}`;
  const place =
    gathering.address?.trim() ||
    [gathering.venueListing?.name, gathering.neighbourhood ?? gathering.hood]
      .filter(Boolean)
      .join(", ");

  return [
    t("gatherings:sharePlans.template.opening", {
      title: gathering.title,
      when,
    }),
    place ? t("gatherings:sharePlans.template.place", { place }) : "",
    t("gatherings:sharePlans.template.link", {
      link: gatheringShareUrl(gathering.slug),
    }),
  ]
    .filter(Boolean)
    .join("\n");
}
