import type { BoardPost } from "./types";
import { routes } from "../../../app/routeMap";
import { MEMBERS, memberName } from "../../members/data/members";

// i18n Pattern A — a fixed filter-chip vocabulary (chrome).
export const boardFilters: {
  value: "all" | "looking" | "offering" | "design" | "tech" | "space" | "care";
  labelKey: string;
}[] = [
  { value: "all", labelKey: "homepage:board.filter.all" },
  { value: "looking", labelKey: "homepage:board.filter.asking" },
  { value: "offering", labelKey: "homepage:board.filter.offering" },
  { value: "design", labelKey: "homepage:board.filter.design" },
  { value: "tech", labelKey: "homepage:board.filter.tech" },
  { value: "space", labelKey: "homepage:board.filter.space" },
  { value: "care", labelKey: "homepage:board.filter.care" },
];

// Poster name + initials come from the canonical registry; `posterMeta` is the
// board's own abbreviated "role · hood" label, kept local.
export const boardPosts: BoardPost[] = [
  {
    href: `${routes.offer}#zine-collab`,
    kind: "looking",
    category: "design",
    title: "A collaborator for a queer zine launching in September",
    posterInitials: MEMBERS.ines!.initials,
    posterName: memberName("ines"),
    posterMeta: "Designer · Príncipe Real",
    age: "3 days ago",
  },
  {
    href: `${routes.offer}#free-portraits`,
    kind: "offering",
    category: "care",
    title: "Free portrait sessions for trans & nonbinary members",
    posterInitials: MEMBERS.andre!.initials,
    posterName: memberName("andre"),
    posterMeta: "Photographer · Cais do Sodré",
    age: "2 days ago",
  },
  {
    href: `${routes.offer}#sublet-arroios`,
    kind: "looking",
    category: "space",
    title: "A sublet in Arroios, June through August",
    posterInitials: MEMBERS.carla!.initials,
    posterName: memberName("carla"),
    posterMeta: "Product · Arroios",
    age: "1 week ago",
  },
  {
    href: `${routes.offer}#mentoring-engineers`,
    kind: "offering",
    category: "tech",
    title: "Monthly mentoring for junior engineers",
    posterInitials: MEMBERS.rui!.initials,
    posterName: memberName("rui"),
    posterMeta: "Engineer · Marvila",
    age: "4 days ago",
  },
  {
    href: `${routes.offer}#desks-graca`,
    kind: "offering",
    category: "space",
    title: "Two desks to share in a bright Graça studio",
    posterInitials: MEMBERS.beatriz!.initials,
    posterName: memberName("beatriz"),
    posterMeta: "Ceramicist · Graça",
    age: "1 week ago",
  },
  {
    href: `${routes.offer}#composer-doc`,
    kind: "looking",
    category: "design",
    title: "A composer for a short documentary, paid",
    posterInitials: MEMBERS.sofia!.initials,
    posterName: memberName("sofia"),
    posterMeta: "Filmmaker · Alfama",
    age: "2 weeks ago",
  },
];
