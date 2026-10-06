/**
 * i18n Pattern A: every field here is platform-authored homepage chrome, so
 * each one is a catalog key that `ReferenceDigestModal` resolves with `t()`.
 *
 * The Manifesto section's two outbound controls ("Where we stand" inside the
 * body copy, and the "How we keep this safe" button) open a dialog instead of
 * navigating, so a visitor reading the landing page keeps their place. Each
 * entry is a digest of the destination written for someone who has just read
 * the section: it adds what the full page says that the section leaves out,
 * and skips the claims the assurance list already makes. `href` is the way out
 * the dialog's footer button uses.
 */
import type { ReferenceDigestTopic } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";

export type ManifestoDigestId = "stand" | "safety";

/**
 * Both entries follow the same key shape, so the catalog paths are derived
 * from the id rather than written out twice.
 */
function digest(
  id: ManifestoDigestId,
  href: string,
  pointIds: string[],
): ReferenceDigestTopic {
  const base = `homepage:manifesto.digest.${id}`;
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

export const MANIFESTO_DIGESTS: Record<
  ManifestoDigestId,
  ReferenceDigestTopic
> = {
  stand: digest("stand", `${routes.about}#stand`, [
    "trans",
    "money",
    "positions",
    "principle",
  ]),
  safety: digest("safety", routes.safety, [
    "data",
    "reports",
    "access",
    "leaving",
  ]),
};
