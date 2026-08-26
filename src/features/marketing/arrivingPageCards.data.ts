import type { IconType } from "react-icons";
import {
  FiActivity,
  FiHeart,
  FiSmile,
  FiPhone,
  FiBarChart2,
  FiUsers,
  FiFileText,
  FiGlobe,
  FiMessageCircle,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import type { ArrivingLink, ArrivingTone } from "./arrivingPage.data";

/**
 * The health + housing information cards on `/local/arriving`.
 *
 * Every string is an i18n key: the component reads `<keyPrefix>.title`,
 * `.body` and (when a link is present) `.linkLabel`. Every link now names a
 * real destination — a public QueerPulse guide, an official Portuguese
 * service, or an organisation's own site — instead of a section index. Where
 * a card had no honest destination it simply has no link.
 */
export interface InfoCard {
  /** Full i18n key prefix, `ns:` included. */
  keyPrefix: string;
  icon: IconType;
  tone: ArrivingTone;
  link?: ArrivingLink;
}

export const HEALTH: InfoCard[] = [
  {
    keyPrefix: "marketing:arriving.health.cards.sns",
    icon: FiActivity,
    tone: "jade",
    link: { href: "https://www.sns.gov.pt", isExternal: true },
  },
  {
    keyPrefix: "marketing:arriving.health.cards.trans",
    icon: FiHeart,
    tone: "coral",
    // The platform's own trans healthcare guide. Public, so a newcomer can
    // read it before they have an account.
    link: { href: routes.transHealthcare },
  },
  {
    keyPrefix: "marketing:arriving.health.cards.mental",
    icon: FiSmile,
    tone: "violet",
    link: { href: routes.mentalHealth },
  },
  {
    keyPrefix: "marketing:arriving.health.cards.crisis",
    icon: FiPhone,
    tone: "jade",
    link: { href: "https://ilga-portugal.pt", isExternal: true },
  },
];

export const HOUSING: InfoCard[] = [
  {
    keyPrefix: "marketing:arriving.housing.cards.market",
    icon: FiBarChart2,
    tone: "coral",
  },
  {
    keyPrefix: "marketing:arriving.housing.cards.board",
    icon: FiUsers,
    tone: "jade",
    link: { href: routes.housing, isMemberOnly: true },
  },
  {
    keyPrefix: "marketing:arriving.housing.cards.rights",
    icon: FiFileText,
    tone: "neutral",
    link: { href: routes.tenantRights, isMemberOnly: true },
  },
  {
    keyPrefix: "marketing:arriving.housing.cards.visas",
    icon: FiGlobe,
    tone: "violet",
    link: { href: routes.visas },
  },
  {
    keyPrefix: "marketing:arriving.housing.cards.ask",
    icon: FiMessageCircle,
    tone: "coral",
    link: { href: routes.forum, isMemberOnly: true },
  },
];
