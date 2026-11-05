import type { IconType } from "react-icons";
import { FiGrid } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  EventBrowseFacetsDTO,
  EventFacetGroupDTO,
} from "../api/events.api";
import { HOODS } from "../createGathering.data";
import {
  formatsForFamily,
  GATHERING_FAMILIES,
  GATHERING_FORMATS,
  type GatheringFamily,
} from "../gatheringCatalog";
import {
  COST_FILTERS,
  COST_LABEL_KEYS,
  WHEN_LABEL_KEYS,
  WHEN_PRESETS,
  type BrowseFilterState,
  type CostFilter,
  type WhenPreset,
} from "./browseFilters";

/** One filter option with its availability count. */
export interface FacetOption<Value extends string> {
  value: Value;
  label: string;
  /** Drawn before the label, decorative. Only the family row carries one. */
  icon?: IconType;
  /** How many events picking this option would show. Undefined while the
   *  counts are unknown (loading, failed, an older server), which draws no
   *  number and never disables the option. */
  count?: number;
  /** "Any kind", "Any time" and the rest, which only lift a filter and so
   *  are never disabled. */
  isAny: boolean;
}

/**
 * One option's count from its group. `null` is the group's "Any", which
 * reads the server's distinct `all`. A key the group does not list is a 0
 * for the grouped facets (family, neighbourhood, format, cost: the server
 * lists every value some event carries) and unknown for the date chips,
 * whose missing window was never counted.
 */
function countFor(
  group: EventFacetGroupDTO | undefined,
  key: string | null,
  isMissingKeyZero: boolean,
): number | undefined {
  if (!group) return undefined;
  if (key === null) return group.all;
  const count = group.options[key];
  if (count !== undefined) return count;
  return isMissingKeyZero ? 0 : undefined;
}

/**
 * The browse drawer's five option lists, each option carrying the count the
 * facets give it. `hood` and `type` are keyed lowercased on the wire, the
 * form their filters compare in. The format list narrows to the chosen
 * family, as before.
 */
export function useBrowseFacetOptions(
  filters: BrowseFilterState,
  facets: EventBrowseFacetsDTO | undefined,
) {
  const { t } = useTranslation();
  const familyOptions: FacetOption<GatheringFamily | "">[] = [
    {
      value: "",
      label: t("gatherings:hub.browse.familyAny"),
      icon: FiGrid,
      count: countFor(facets?.family, null, true),
      isAny: true,
    },
    ...GATHERING_FAMILIES.map((family) => ({
      value: family.key,
      label: t(family.nameKey),
      icon: family.icon,
      count: countFor(facets?.family, family.key, true),
      isAny: false,
    })),
  ];
  const whenOptions: FacetOption<WhenPreset>[] = WHEN_PRESETS.map((preset) => ({
    value: preset,
    label: t(WHEN_LABEL_KEYS[preset]),
    count: countFor(facets?.when, preset === "any" ? null : preset, false),
    isAny: preset === "any",
  }));
  const hoodOptions: FacetOption<string>[] = [
    {
      value: "",
      label: t("gatherings:hub.browse.hoodAny"),
      count: countFor(facets?.hood, null, true),
      isAny: true,
    },
    ...HOODS.map((hood) => ({
      value: hood.value,
      label: t(hood.labelKey),
      count: countFor(facets?.hood, hood.value.toLowerCase(), true),
      isAny: false,
    })),
  ];
  // Narrowed to the chosen family, so the list is six or seven rows rather
  // than fifty-six. With no family chosen it is the whole catalog, which is
  // still the right answer for a member who knows the word but not the kind.
  const formats = filters.family
    ? formatsForFamily(filters.family)
    : GATHERING_FORMATS;
  const typeOptions: FacetOption<string>[] = [
    {
      value: "",
      label: t("gatherings:hub.browse.typeAny"),
      count: countFor(facets?.type, null, true),
      isAny: true,
    },
    ...formats.map((format) => ({
      value: format.key,
      label: t(format.nameKey),
      count: countFor(facets?.type, format.key.toLowerCase(), true),
      isAny: false,
    })),
  ];
  const costOptions: FacetOption<CostFilter>[] = COST_FILTERS.map((cost) => ({
    value: cost,
    label: t(COST_LABEL_KEYS[cost]),
    count: countFor(facets?.cost, cost === "any" ? null : cost, true),
    isAny: cost === "any",
  }));
  return { familyOptions, whenOptions, hoodOptions, typeOptions, costOptions };
}

/** Nothing left under this option, so picking it could only empty the
 *  board. Never while it is selected, or the member could not leave it, and
 *  never for an "Any" option, which only lifts a filter. */
export function isFacetOptionUnavailable(
  option: FacetOption<string>,
  isSelected: boolean,
): boolean {
  return option.count === 0 && !isSelected && !option.isAny;
}
