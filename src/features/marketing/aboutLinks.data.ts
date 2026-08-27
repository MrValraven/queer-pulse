/**
 * i18n Pattern A — every field here is platform-authored About-page chrome, so
 * each one is a catalog key that `AboutLinkModal` resolves with `t()`.
 *
 * The About page's outbound reference links open a dialog instead of
 * navigating, so a reader working through the positions never loses their place
 * mid-argument. Each entry is a digest of the destination written for the claim
 * that links to it: two links can point at the same page and still open
 * different dialogs (both guidelines links land on the political-speech clause,
 * but one is reached from the trans position and the other from Palestine).
 * `href` is the escape hatch the dialog's footer button uses.
 */
import type {
  ReferenceDigestPoint,
  ReferenceDigestTopic,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";

/** Structurally the shared digest shape; aliased so the two never drift. */
export type AboutLinkPoint = ReferenceDigestPoint;
export type AboutLinkTopic = ReferenceDigestTopic;

export type AboutLinkTopicId =
  | "intersections"
  | "guidelinesExclusion"
  | "transHealthcare"
  | "guidelinesSpeech"
  | "governanceAllocations"
  | "migration"
  | "sexualHealth"
  | "governanceOverview";

/**
 * Every entry follows the same key shape, so the catalog paths are derived from
 * the id rather than written out eight times.
 */
function topic(
  id: AboutLinkTopicId,
  href: string,
  pointIds: string[],
): AboutLinkTopic {
  const base = `marketing:about.linkModal.${id}`;
  return {
    eyebrowKey: `${base}.eyebrow`,
    labelKey: `${base}.label`,
    titleKey: `${base}.title`,
    leadKey: `${base}.lead`,
    paragraphKeys: [`${base}.p1`, `${base}.p2`],
    points: pointIds.map((pointId) => ({
      titleKey: `${base}.point.${pointId}.title`,
      bodyKey: `${base}.point.${pointId}.body`,
    })),
    href,
    ctaKey: `${base}.cta`,
  };
}

export const ABOUT_LINK_TOPICS: Record<AboutLinkTopicId, AboutLinkTopic> = {
  intersections: topic("intersections", routes.intersectionality, [
    "race",
    "faith",
    "class",
  ]),
  guidelinesExclusion: topic("guidelinesExclusion", routes.guidelines, [
    "hardLines",
    "bothDirections",
    "reporting",
  ]),
  transHealthcare: topic("transHealthcare", routes.transHealthcare, [
    "hrt",
    "legal",
    "clinicians",
  ]),
  guidelinesSpeech: topic("guidelinesSpeech", routes.guidelines, [
    "antisemitism",
    "antiPalestinian",
    "test",
  ]),
  governanceAllocations: topic("governanceAllocations", routes.governance, [
    "partners",
    "votes",
    "record",
  ]),
  migration: topic("migration", routes.intersectionality, [
    "queerSpaces",
    "arriving",
    "cost",
  ]),
  sexualHealth: topic("sexualHealth", routes.sexualHealth, [
    "testing",
    "prep",
    "living",
  ]),
  governanceOverview: topic("governanceOverview", routes.governance, [
    "council",
    "finances",
    "proposals",
  ]),
};
