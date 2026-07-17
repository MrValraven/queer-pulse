import type { IconType } from "react-icons";
import { FiBarChart2, FiSlash, FiCheckSquare } from "react-icons/fi";

/**
 * i18n Pattern A. `value` is the plain euro amount (formatted with
 * `useFormat().currency()` at render, never baked into a string) and
 * `noteKey` resolves the small descriptive tag through `t()`.
 */
export interface DonationAmount {
  value: number;
  noteKey: string;
  featured?: boolean;
}

export const AMOUNTS: DonationAmount[] = [
  { value: 5, noteKey: "marketing:donate.amounts.coffee" },
  { value: 15, noteKey: "marketing:donate.amounts.mostChosen", featured: true },
  { value: 40, noteKey: "marketing:donate.amounts.sustainsMember" },
  { value: 100, noteKey: "marketing:donate.amounts.fundsGathering" },
];

export const ALLOCATION = [
  {
    pct: "52%",
    labelKey: "marketing:donate.allocation.mutualAid.label",
    bodyKey: "marketing:donate.allocation.mutualAid.body",
  },
  {
    pct: "24%",
    labelKey: "marketing:donate.allocation.gatherings.label",
    bodyKey: "marketing:donate.allocation.gatherings.body",
  },
  {
    pct: "16%",
    labelKey: "marketing:donate.allocation.platform.label",
    bodyKey: "marketing:donate.allocation.platform.body",
  },
  {
    pct: "8%",
    labelKey: "marketing:donate.allocation.magazine.label",
    bodyKey: "marketing:donate.allocation.magazine.body",
  },
];

export const TRUST: { icon: IconType; titleKey: string; bodyKey: string }[] = [
  {
    icon: FiBarChart2,
    titleKey: "marketing:donate.trust.reported.title",
    bodyKey: "marketing:donate.trust.reported.body",
  },
  {
    icon: FiSlash,
    titleKey: "marketing:donate.trust.noAds.title",
    bodyKey: "marketing:donate.trust.noAds.body",
  },
  {
    icon: FiCheckSquare,
    titleKey: "marketing:donate.trust.membersDecide.title",
    bodyKey: "marketing:donate.trust.membersDecide.body",
  },
];
