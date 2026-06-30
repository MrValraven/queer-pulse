import type { WellbeingResource } from "./types";
import { routes } from "../../../app/routeMap";

export const wellbeingResources: WellbeingResource[] = [
  {
    href: `${routes.wellbeing}#therapists`,
    title: "Queer-affirming therapists",
    description:
      "A curated directory of LGBTQ+-affirming therapists and psychiatrists in Lisbon — vetted by community members, not an algorithm.",
    ctaLabel: "Find a therapist →",
    tone: "violet",
    icon: "heart",
  },
  {
    href: `${routes.wellbeing}#peer-support`,
    title: "Mental health peer support",
    description:
      "A moderated space for members going through difficult times. Shared experience, no advice unless asked, no judgement.",
    ctaLabel: "Join the group →",
    tone: "jade",
    icon: "people",
  },
  {
    href: `${routes.wellbeing}#crisis`,
    title: "Crisis & emergency resources",
    description:
      "Immediate support lines and safe spaces — available 24 hours, specific to LGBTQ+ situations. No one navigates a crisis alone.",
    ctaLabel: "View resources →",
    tone: "coral",
    icon: "phone",
  },
  {
    href: routes.legal,
    title: "Legal aid & your rights",
    description:
      "Know your rights at work, in housing, and in healthcare. Queer-friendly lawyers, discrimination guides, and contract templates.",
    ctaLabel: "Get informed →",
    tone: "plum",
    icon: "shield",
  },
  {
    href: routes.employerReviews,
    title: "Queer employer reviews",
    description:
      "Is your workplace actually safe? Anonymous reviews by LGBTQ+ employees — beyond the Pride logo, behind the closed office door.",
    ctaLabel: "Read & write reviews →",
    tone: "coral",
    icon: "briefcase",
  },
  {
    href: `${routes.wellbeing}#harm-reduction`,
    title: "Harm reduction",
    description:
      "Non-judgmental guides for nightlife safety — practical information for the community as it actually exists, not as some would prefer.",
    ctaLabel: "Read the guide →",
    tone: "jade",
    icon: "info",
  },
];
