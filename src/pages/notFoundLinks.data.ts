import type { IconType } from "react-icons";
import {
  FiBook,
  FiBookOpen,
  FiCalendar,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
} from "react-icons/fi";
import { routes } from "../app/routeMap";

export type NotFoundLinkTone = "coral" | "jade" | "cream";

export interface NotFoundLink {
  id: string;
  Icon: IconType;
  tone: NotFoundLinkTone;
  labelKey: string;
  subKey: string;
  to: string;
}

/** The 404's "Popular places". Full literal keys on purpose, so the
 *  unused-key report can see them. */
export const NOT_FOUND_LINKS: NotFoundLink[] = [
  {
    id: "magazine",
    Icon: FiBookOpen,
    tone: "coral",
    labelKey: "system:notFound.links.magazine.label",
    subKey: "system:notFound.links.magazine.sub",
    to: routes.magazine,
  },
  {
    id: "gatherings",
    Icon: FiCalendar,
    tone: "jade",
    labelKey: "system:notFound.links.gatherings.label",
    subKey: "system:notFound.links.gatherings.sub",
    to: routes.gatherings,
  },
  {
    id: "readingGroups",
    Icon: FiBook,
    tone: "cream",
    labelKey: "system:notFound.links.readingGroups.label",
    subKey: "system:notFound.links.readingGroups.sub",
    to: routes.readingGroups,
  },
  {
    id: "forum",
    Icon: FiMessageCircle,
    tone: "coral",
    labelKey: "system:notFound.links.forum.label",
    subKey: "system:notFound.links.forum.sub",
    to: routes.forum,
  },
  {
    id: "help",
    Icon: FiHelpCircle,
    tone: "jade",
    labelKey: "system:notFound.links.help.label",
    subKey: "system:notFound.links.help.sub",
    to: routes.help,
  },
  {
    id: "contact",
    Icon: FiMail,
    tone: "cream",
    labelKey: "system:notFound.links.contact.label",
    subKey: "system:notFound.links.contact.sub",
    to: routes.contact,
  },
];
