import type { IconType } from "react-icons";
import { FiBook, FiCoffee, FiFeather, FiFilm } from "react-icons/fi";

/**
 * i18n Pattern A — `HERO_TYPES` and `TYPE_CARDS` are platform-authored
 * host-guide/marketing copy that ships in the bundle in both modes, so the
 * data file holds catalog keys and the component resolves them with `t()`.
 * `SPACES` below stays untranslated: partner-venue directory records fetched
 * in live mode (hood/name/note are real venue data, not chrome).
 */
export const HERO_TYPES = [
  "gatherings:host.hero.type.supperClub",
  "gatherings:host.hero.type.studioVisit",
  "gatherings:host.hero.type.skillsWorkshop",
  "gatherings:host.hero.type.filmScreening",
  "gatherings:host.hero.type.morningWalk",
  "gatherings:host.hero.type.bookClub",
  "gatherings:host.hero.type.openStudio",
];

export const TYPE_CARDS: {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
}[] = [
  {
    icon: FiCoffee,
    titleKey: "gatherings:host.typeCard.supperClub.title",
    bodyKey: "gatherings:host.typeCard.supperClub.body",
  },
  {
    icon: FiFeather,
    titleKey: "gatherings:host.typeCard.studioVisit.title",
    bodyKey: "gatherings:host.typeCard.studioVisit.body",
  },
  {
    icon: FiBook,
    titleKey: "gatherings:host.typeCard.skillsSession.title",
    bodyKey: "gatherings:host.typeCard.skillsSession.body",
  },
  {
    icon: FiFilm,
    titleKey: "gatherings:host.typeCard.screeningTalk.title",
    bodyKey: "gatherings:host.typeCard.screeningTalk.body",
  },
];

/** Partner-venue directory records — real data fetched in live mode. */
export const SPACES = [
  {
    hood: "Mouraria",
    name: "Casa da Mariquinhas",
    note: "Kitchen + dining room · up to 20",
  },
  {
    hood: "Príncipe Real",
    name: "Atelier Pulso",
    note: "Studio · up to 15 · member-run",
  },
  {
    hood: "Marvila",
    name: "Fábrica Nuno Gama",
    note: "Warehouse · up to 50 · events only",
  },
];
