import { PROFESSION_IDS_BY_FIELD } from "../members/workTaxonomy.data";
import type { SubprofileKind } from "./api/subprofiles.api";
import { KIND_FAMILIES } from "./kindFamilies.data";
import { WORK_FIELD_BY_KIND } from "./kindWorkFields.data";

/** The field id of the trailing group for kinds with no single work field. */
const OTHER_GROUP_FIELD = "other";

/** One heading in the directory's Profession band: a work field, and the
 *  professions under it that at least one persona in the directory actually
 *  has. Fields with none are dropped by `groupProfessionsByWorkField`. */
export interface DirectoryProfessionGroup {
  field: string;
  labelKey: string;
  kinds: SubprofileKind[];
}

// Every kind in canonical order: the families' kind lists, flattened in
// `KIND_FAMILIES` order.
const CANONICAL_KINDS = KIND_FAMILIES.flatMap((family) => family.kinds);

/**
 * The directory's Profession chips, each group headed by the work area
 * members pick in onboarding (`PROFESSION_IDS_BY_FIELD`), so somebody
 * browsing for a photographer finds them under "Photo", in the same
 * words they used for their own work. Each kind's field comes from
 * `WORK_FIELD_BY_KIND`; kinds with no single field (`generic`) close the band
 * under "Something else".
 *
 * Only professions present in the fetched set get a chip, so the band is two
 * chips on a young directory and never a wall of every profession the app can
 * model. Field order follows onboarding, and profession order within a field
 * follows the canonical kind order, so the band never reshuffles as counts
 * move.
 */
export function groupProfessionsByWorkField(
  presentKinds: ReadonlySet<SubprofileKind>,
): DirectoryProfessionGroup[] {
  const presentInOrder = CANONICAL_KINDS.filter((kind) =>
    presentKinds.has(kind),
  );
  const fieldGroups = Object.keys(PROFESSION_IDS_BY_FIELD).map((field) => ({
    field,
    labelKey: `members:directory.discipline.${field}`,
    kinds: presentInOrder.filter((kind) => WORK_FIELD_BY_KIND[kind] === field),
  }));
  const otherGroup = {
    field: OTHER_GROUP_FIELD,
    labelKey: "subprofiles:directory.refine.professionOtherGroup",
    kinds: presentInOrder.filter((kind) => WORK_FIELD_BY_KIND[kind] === null),
  };
  return [...fieldGroups, otherGroup].filter((group) => group.kinds.length > 0);
}
