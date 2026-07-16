import type { LibraryItem } from "./types";
import { routes } from "../../../app/routeMap";

export const libraryItems: LibraryItem[] = [
  {
    href: `${routes.library}#freelance-taxes`,
    type: "recording",
    typeLabelKey: "homepage:library.type.recording",
    title: "Navigating freelance taxes in Portugal as a foreign national",
    meta: ["Workshop · May 2026", "48 min"],
  },
  {
    href: `${routes.library}#trans-healthcare`,
    type: "guide",
    typeLabelKey: "homepage:library.type.guide",
    title:
      "Trans healthcare in Portugal: what you're entitled to and how to access it",
    meta: ["Jonas Ferreira", "Updated Apr 2026"],
  },
  {
    href: `${routes.library}#portfolio-notes`,
    type: "notes",
    typeLabelKey: "homepage:library.type.notes",
    title: "Portfolio Night №8: feedback, patterns, and what designers said",
    meta: ["Gathering notes · Mar 2026", "10 min read"],
  },
  {
    href: `${routes.library}#housing-rights`,
    type: "guide",
    typeLabelKey: "homepage:library.type.guide",
    title: "Tenant rights for LGBTQ+ renters in Lisbon: a practical guide",
    meta: ["Catarina Vaz", "Updated Feb 2026"],
  },
  {
    href: `${routes.library}#collective`,
    type: "recording",
    typeLabelKey: "homepage:library.type.recording",
    title:
      "Starting a queer creative collective: legal structures, money, and trust",
    meta: ["Workshop · Jan 2026", "62 min"],
  },
];

export const libraryMoreCount = "47 more";
