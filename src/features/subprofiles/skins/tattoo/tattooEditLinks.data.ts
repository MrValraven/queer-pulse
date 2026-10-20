import { subprofileEditPath } from "../../../../app/routeMap";
import type { TattooChapterKey } from "../../tattooEditorChapters.data";
import type { TattooBlockKey } from "./tattooView";

/**
 * Where an owner's "Edit" link lands in the persona editor. `pane` becomes
 * `?pane=`, `chapter` becomes `?chapter=` (Page blocks only) and `field`
 * becomes `?field=`: a skinData dot path ("tattoo.status"), a section
 * control's path ("section:flash") or an identity or presence field name.
 */
export type TattooEditTarget =
  | { pane: "skinBlocks"; chapter: TattooChapterKey; field?: string }
  | { pane: "identity" | "presence"; field?: string };

function blocks(chapter: TattooChapterKey, field?: string): TattooEditTarget {
  return field
    ? { pane: "skinBlocks", chapter, field }
    : { pane: "skinBlocks", chapter };
}

/** Every owner "Edit" link on the tattoo page, by the block or value it
 *  edits. */
export const TATTOO_EDIT_TARGETS: Record<
  TattooBlockKey | "status" | "city",
  TattooEditTarget
> = {
  status: blocks("booking", "tattoo.status"),
  city: blocks("booking", "tattooStudio.city"),
  flash: blocks("flash", "section:flash"),
  wannaDos: blocks("flash", "section:wanna_dos"),
  healed: blocks("healed", "section:healed"),
  projects: blocks("healed", "section:in_progress"),
  scarWork: blocks("scarCoverUps", "tattooScarWork.intro"),
  coverUps: blocks("scarCoverUps", "section:cover_ups"),
  styles: blocks("booking", "tattooStyles.styles"),
  booking: blocks("booking", "tattooBooking.route"),
  prices: blocks("prices", "tattooPrices.minimum"),
  comfort: blocks("care", "tattooComfort.options"),
  hygiene: blocks("care", "tattooHygiene.practices"),
  aftercare: blocks("care", "section:aftercare"),
  guestSpots: blocks("outAndAbout", "section:guest_spots"),
  flashDays: blocks("outAndAbout", "section:flash_days"),
  shop: blocks("outAndAbout", "section:shop"),
  lineage: blocks("about", "tattooLineage.trainedWith"),
  faq: blocks("about", "faq"),
  gallery: blocks("about", "section:gallery"),
};

/** The editor address for a target: the persona's edit path plus `?pane=`,
 *  `?chapter=` (Page blocks only) and `?field=` when given. */
export function tattooEditHref(
  subprofileId: string,
  target: TattooEditTarget,
): string {
  const params = new URLSearchParams({ pane: target.pane });
  if (target.pane === "skinBlocks") params.set("chapter", target.chapter);
  if (target.field) params.set("field", target.field);
  return `${subprofileEditPath(subprofileId)}?${params.toString()}`;
}
