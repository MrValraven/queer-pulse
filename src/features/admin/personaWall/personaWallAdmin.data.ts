import {
  PERSONA_WALL_FILL_ORDERS,
  type PersonaWallFillOrder,
} from "../../subprofiles/api/personaWall.api";

export interface PersonaWallFillOrderOption {
  id: PersonaWallFillOrder;
  labelKey: string;
  descriptionKey: string;
}

/** The fill order radio group's options, in the contract's order. */
export const PERSONA_WALL_FILL_ORDER_OPTIONS: readonly PersonaWallFillOrderOption[] =
  PERSONA_WALL_FILL_ORDERS.map((fillOrder) => ({
    id: fillOrder,
    labelKey: `admin:personaWall.fill.order.${fillOrder}.label`,
    descriptionKey: `admin:personaWall.fill.order.${fillOrder}.description`,
  }));

/** Placeholder rows while the wall loads. */
export const PERSONA_WALL_SKELETON_ROW_KEYS = [
  "first",
  "second",
  "third",
] as const;

/** A pick row grows in from this scale when it is added. */
export const PERSONA_WALL_ROW_SCALE_FROM = 0.96;
/** How long a pick row takes to enter or leave, in seconds. */
export const PERSONA_WALL_ROW_DURATION_S = 0.22;
