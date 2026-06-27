import { PARTNERS_A } from "./partnerDetails.dataA";
import { PARTNERS_B } from "./partnerDetails.dataB";
import type { Partner } from "./partnerDetails.types";

export type { Region, Tint, Stat, Collab, TimelineItem, Prose, InfoRow, Contact, Partner } from "./partnerDetails.types";

export const PARTNERS: Partner[] = [...PARTNERS_A, ...PARTNERS_B];

export function getPartner(slug: string | undefined): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug);
}
