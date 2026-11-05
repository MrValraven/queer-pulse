import type { PersonaWallFillOrder } from "../api/personaWall.api";

/** The persona wall a demo session starts with. */
export interface DemoPersonaWallSeed {
  /** Picked persona ids, in wall position order. */
  pickPersonaIds: readonly string[];
  fillOrder: PersonaWallFillOrder;
}

/** Three shown picks (one without a photo, since a pick may have none; the
 *  first has a photo, so the hero opens on a picture) and one draft, so the
 *  "Draft" chip renders in demo. */
export const DEMO_PERSONA_WALL_SEED: DemoPersonaWallSeed = {
  pickPersonaIds: [
    "sp-diogo-nightform",
    "sp-vera-bloco",
    "sp-bea-cadeira",
    "sp-tiago-draft",
  ],
  fillOrder: "endorsed",
};

/** Nine shown personas, a full wall for the store, picks and add-dialog
 *  tests. */
export const DEMO_PERSONA_WALL_NINE_SHOWN: readonly string[] = [
  "sp-vera-bloco",
  "sp-diogo-nightform",
  "sp-bea-cadeira",
  "sp-andre-grain",
  "sp-tomas-casa-corvo",
  "sp-kiko-santacruel",
  "sp-celia-terceiro",
  "sp-rita-antes",
  "sp-hugo-aula",
];
