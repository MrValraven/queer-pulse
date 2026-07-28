import { PARTNERS } from "./partnerDetails.data";
import type { Partner } from "./partnerDetails.types";

export type {
  Region,
  Tint,
  Stat,
  Collab,
  TimelineItem,
  Prose,
  InfoRow,
  Contact,
  Partner,
} from "./partnerDetails.types";

export { PARTNERS };

export function getPartner(slug: string | undefined): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug);
}
