import type { WellbeingResource } from "./types";
import { routes } from "../../../app/routeMap";

/**
 * i18n Pattern A — a fixed set of platform-defined wellbeing categories
 * (identical in demo and live mode), so title/description/ctaLabel hold
 * catalog keys rather than literal strings.
 */
export const wellbeingResources: WellbeingResource[] = [
  {
    href: `${routes.wellbeing}#therapists`,
    titleKey: "homepage:wellbeing.therapists.title",
    descriptionKey: "homepage:wellbeing.therapists.description",
    ctaLabelKey: "homepage:wellbeing.therapists.cta",
    tone: "violet",
    icon: "heart",
  },
  {
    href: `${routes.wellbeing}#peer-support`,
    titleKey: "homepage:wellbeing.peerSupport.title",
    descriptionKey: "homepage:wellbeing.peerSupport.description",
    ctaLabelKey: "homepage:wellbeing.peerSupport.cta",
    tone: "jade",
    icon: "people",
  },
  {
    href: `${routes.wellbeing}#crisis`,
    titleKey: "homepage:wellbeing.crisis.title",
    descriptionKey: "homepage:wellbeing.crisis.description",
    ctaLabelKey: "homepage:wellbeing.crisis.cta",
    tone: "coral",
    icon: "phone",
  },
  {
    href: routes.legal,
    titleKey: "homepage:wellbeing.legal.title",
    descriptionKey: "homepage:wellbeing.legal.description",
    ctaLabelKey: "homepage:wellbeing.legal.cta",
    tone: "plum",
    icon: "shield",
  },
  {
    href: routes.employerReviews,
    titleKey: "homepage:wellbeing.employerReviews.title",
    descriptionKey: "homepage:wellbeing.employerReviews.description",
    ctaLabelKey: "homepage:wellbeing.employerReviews.cta",
    tone: "coral",
    icon: "briefcase",
  },
  {
    href: `${routes.wellbeing}#harm-reduction`,
    titleKey: "homepage:wellbeing.harmReduction.title",
    descriptionKey: "homepage:wellbeing.harmReduction.description",
    ctaLabelKey: "homepage:wellbeing.harmReduction.cta",
    tone: "jade",
    icon: "info",
  },
];
