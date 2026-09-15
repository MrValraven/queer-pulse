// ── Lisbon-area neighbourhoods ──────────────────────────────────────────────
// Offered on the categories in `NEIGHBOURHOOD_CATEGORIES`, where the answer
// genuinely changes by area: which landlord, which studio, which commute.
//
// These are PROPER NOUNS. "Arroios" is Arroios in every language, so each one
// is a value the state stores and the card prints verbatim, never a catalog
// key. The single exception is the trailing "Other", which is an English word
// doing an English job, so it carries a key like any other piece of UI copy.

export interface ComposeNeighbourhood {
  /** The canonical value stored on the state and sent on publish. */
  id: string;
  /** The name as printed, when it is a proper noun. */
  name?: string;
  /** Catalog key, for the one entry that is UI copy rather than a place. */
  labelKey?: string;
}

/** The value the trailing "Other" option stores. */
export const NEIGHBOURHOOD_OTHER_ID = "other";

export const NEIGHBOURHOODS: readonly ComposeNeighbourhood[] = [
  { id: "Arroios", name: "Arroios" },
  { id: "Alvalade", name: "Alvalade" },
  { id: "Anjos", name: "Anjos" },
  { id: "Graça", name: "Graça" },
  { id: "Príncipe Real", name: "Príncipe Real" },
  { id: "Cais do Sodré", name: "Cais do Sodré" },
  { id: "Campo de Ourique", name: "Campo de Ourique" },
  { id: "Marvila", name: "Marvila" },
  { id: "Almada", name: "Almada" },
  {
    id: NEIGHBOURHOOD_OTHER_ID,
    labelKey: "forum:composePage.neighbourhood.other",
  },
];

/** Every valid value, for dropping a stale one out of a restored draft. */
export const NEIGHBOURHOOD_IDS: readonly string[] = NEIGHBOURHOODS.map(
  (neighbourhood) => neighbourhood.id,
);
