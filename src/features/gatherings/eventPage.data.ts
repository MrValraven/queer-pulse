import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiCoffee,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import type { SpotsLabel } from "./data";

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1562050344-f7ad946cee35?q=80&w=1000&auto=format&fit=crop";

/**
 * This organizer's own copy for the static event — fetched in live mode, so
 * (like `type`/`title`/`hood` on `GatheringDetail`) it stays in English and is
 * held here as plain constants rather than inline JSX text, so the lint rule
 * that guards against un-keyed chrome doesn't also flag organizer content.
 */
export const EVENT_TYPE_LABEL = "Community gathering · Food & conversation";
export const EVENT_TITLE_LINE = "Newcomer";
export const EVENT_TITLE_EM = "Welcome Dinner";
export const EVENT_HOST_NAME = "Mateus Costa";
export const EVENT_PILL_LOCATION = "Casa do Alentejo, Intendente";
export const EVENT_HOOD_LABEL = "Intendente";
export const EVENT_HERO_ALT =
  "Event image: warm dinner setting, long communal table, candlelight";
export const EVENT_ABOUT_P1 =
  "Once a month, we set a long table for people who have recently arrived in Lisbon, or who arrived a while ago and never quite found their people. This dinner is informal, unhurried, and bilingual. You don't need to know anyone.";
export const EVENT_ABOUT_P2 =
  "We eat well, we stay too long, we probably talk about housing at some point. The idea is to make introductions that have a chance of becoming something real. Some of the people at the last dinner have since become flatmates, collaborators, or close friends.";
export const EVENT_ABOUT_ACCESSIBILITY_TEXT =
  "Casa do Alentejo is accessible by wheelchair via the side entrance on Rua de Palma. Step-free access to all areas.";

/**
 * This static event's date/time, held as a real `Date` so `EventPage` can
 * format it with `useFormat()` instead of shipping a baked
 * "Sat 14 June · 7:00pm" string.
 */
export const EVENT_DATE = new Date(2026, 5, 14, 19, 0);

/** Sliding-scale ticket range shown in the hero pill, in euros. */
export const EVENT_PRICE_MIN = 0;
export const EVENT_PRICE_MAX = 15;

/**
 * Hero pill spots line — the phrase is chrome (composed in the live adapter
 * too), the count is this event's own data, so it's held as a `SpotsLabel`
 * and resolved at render via `spotsText()`, reusing the already-authored
 * `gatherings:spots.spotsLeft` key.
 */
export const EVENT_SPOTS: SpotsLabel = {
  key: "gatherings:spots.spotsLeft",
  values: { count: 5 },
};

/**
 * i18n Pattern A — sliding-scale tier names/descriptions are fixed platform
 * chrome: `CreateGatheringSteps.tsx` hardcodes these same three tiers, the
 * host only ever sets price/spots. `price` is a plain number, formatted via
 * `useFormat().currency()` at render rather than a baked `"€8"` string.
 */
export const TIERS: {
  nameKey: string;
  descriptionKey: string;
  price: number;
}[] = [
  {
    nameKey: "gatherings:event.tiers.free.name",
    descriptionKey: "gatherings:event.tiers.free.desc",
    price: 0,
  },
  {
    nameKey: "gatherings:event.tiers.standard.name",
    descriptionKey: "gatherings:event.tiers.standard.desc",
    price: 8,
  },
  {
    nameKey: "gatherings:event.tiers.supporter.name",
    descriptionKey: "gatherings:event.tiers.supporter.desc",
    price: 15,
  },
];

/**
 * Event-details rows. `labelKey` is chrome (a fixed field name — "Date &
 * time", "Location"…); `value`/`sub` are this organizer's own entries for
 * this specific event — fetched in live mode, so they stay in English same
 * as any other organizer-authored field.
 */
export const DETAILS: {
  icon: IconType;
  labelKey: string;
  value: string;
  sub: string;
}[] = [
  {
    icon: FiCalendar,
    labelKey: "gatherings:event.details.dateTime",
    value: "Saturday, 14 June 2026",
    sub: "7:00pm–10:30pm (doors open 6:45pm)",
  },
  {
    icon: FiMapPin,
    labelKey: "gatherings:event.details.location",
    value: "Casa do Alentejo",
    sub: "Rua das Portas de Santo Antão 58, Intendente · 5 min from Intendente metro",
  },
  {
    icon: FiCoffee,
    labelKey: "gatherings:event.details.foodDrink",
    value: "Shared dinner included",
    sub: "Note dietary requirements when you RSVP. Vegetarian and vegan options always available.",
  },
  {
    icon: FiMessageCircle,
    labelKey: "gatherings:event.details.language",
    value: "PT / EN · bilingual throughout",
    sub: "No one will be left out of a conversation.",
  },
];
