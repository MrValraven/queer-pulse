/**
 * The one "where in Lisbon are you" vocabulary, shared by the profile
 * editor's neighbourhood select and the member directory's "Where they're
 * based" filter. Mirrored server-side by `src/profiles/neighbourhoods.ts`,
 * which does the free-text matching — the two lists must stay identical or a
 * member can pick an area no filter can find them by.
 *
 * It is deliberately TWO vocabularies in one list:
 *
 * - the 24 official freguesias (parishes), derived from the same map data the
 *   freguesia layer renders, so the names and the map can never drift; and
 * - the informal bairros queer Lisbon actually says. "Príncipe Real" and
 *   "Cais do Sodré" are how people describe where they live; "Santo António"
 *   and "Misericórdia" are what the council calls the same ground.
 *
 * The cost of carrying both is that they overlap: Bairro Alto sits inside
 * Misericórdia, so a member filtering on the freguesia will not see the
 * member who picked the bairro. That is the honest trade for letting people
 * name their own neighbourhood, and it is why the profile field pairs the
 * select with a free-text escape hatch.
 */
import { FREGUESIAS } from "../components/map/freguesias.data";

/** Which of the two vocabularies a name belongs to — the select groups on it. */
export type LisbonNeighbourhoodKind = "bairro" | "freguesia";

export interface LisbonNeighbourhood {
  name: string;
  kind: LisbonNeighbourhoodKind;
}

/** Informal bairros: the everyday names that are NOT freguesias. Each one is
 *  already in use somewhere in the app (member profiles, housing listings,
 *  the list-a-business wizard's `CITY` config), so this list adds no new
 *  vocabulary, it just gathers what members already write by hand. */
const BAIRRO_NAMES = [
  "Alfama",
  "Anjos",
  "Bairro Alto",
  "Cais do Sodré",
  "Graça",
  "Intendente",
  "Mouraria",
  "Príncipe Real",
  "Santos",
] as const;

function byName(first: string, second: string): number {
  return first.localeCompare(second, "pt");
}

const FREGUESIA_NAMES: readonly string[] = FREGUESIAS.features
  .map((feature) => feature.properties.name)
  .sort(byName);

const FREGUESIA_NAME_SET = new Set(FREGUESIA_NAMES);

/** Every pickable area, bairros first (what members reach for) then the
 *  freguesias, each group alphabetical. A bairro promoted to a freguesia
 *  upstream drops out of the first group rather than appearing twice. */
export const LISBON_NEIGHBOURHOODS: readonly LisbonNeighbourhood[] = [
  ...BAIRRO_NAMES.filter((name) => !FREGUESIA_NAME_SET.has(name))
    .slice()
    .sort(byName)
    .map((name) => ({ name, kind: "bairro" as const })),
  ...FREGUESIA_NAMES.map((name) => ({ name, kind: "freguesia" as const })),
];

export const LISBON_NEIGHBOURHOOD_NAMES: readonly string[] =
  LISBON_NEIGHBOURHOODS.map((entry) => entry.name);

const NAME_SET = new Set(LISBON_NEIGHBOURHOOD_NAMES);

/** Whether a stored value is one of the pickable areas. A `false` here is not
 *  an error: it is a member who typed their own answer ("Cedofeita, Porto"),
 *  which the profile field keeps in its free-text mode. */
export function isLisbonNeighbourhood(value: string): boolean {
  return NAME_SET.has(value);
}
