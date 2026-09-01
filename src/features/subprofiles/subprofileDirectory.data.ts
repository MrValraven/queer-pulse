import type { SubprofileKind } from "./api/subprofiles.api";
import { KIND_FAMILIES } from "./kindFamilies.data";
import type { SkinFamily } from "./subprofile-skins";

/** One heading in the directory's Profession band: a page family, and the
 *  professions under it that at least one persona in the directory actually
 *  has. Families with none are dropped by `groupProfessionsByFamily`. */
export interface DirectoryProfessionGroup {
  family: SkinFamily;
  labelKey: string;
  kinds: SubprofileKind[];
}

/**
 * The directory's Profession chips, grouped under their page family.
 *
 * The directory used to filter by the family ITSELF (Stage, Studio, Page…),
 * which is a page theme derived from the profession rather than a thing anyone
 * is: `kindFamilies.data.ts` says as much ("a member never picks a family
 * directly"). Somebody browsing for a photographer was being asked to know
 * that photographers live under "Studio". So the profession is now the filter,
 * and the family survives only as the heading that keeps ninety-four of them
 * navigable.
 *
 * Only professions present in the fetched set get a chip, so the band is two
 * chips on a young directory and never a wall of every profession the app can
 * model. Family order follows `KIND_FAMILIES`, and profession order within a
 * family follows the canonical kind order, so the band never reshuffles as
 * counts move.
 */
export function groupProfessionsByFamily(
  presentKinds: ReadonlySet<SubprofileKind>,
): DirectoryProfessionGroup[] {
  return KIND_FAMILIES.map(({ family, labelKey, kinds }) => ({
    family,
    labelKey,
    kinds: kinds.filter((kind) => presentKinds.has(kind)),
  })).filter((group) => group.kinds.length > 0);
}
