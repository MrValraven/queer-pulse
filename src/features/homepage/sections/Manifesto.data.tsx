import type { ReactNode } from "react";
import {
  FiClock,
  FiEyeOff,
  FiLock,
  FiMapPin,
  FiUserPlus,
} from "react-icons/fi";

export interface ManifestoAssurance {
  icon: ReactNode;
  titleKey: string;
  descriptionKey: string;
}

/**
 * i18n Pattern A — the five safety guarantees shown beside the manifesto
 * copy. Platform-authored chrome (identical in demo and live mode), so the
 * data file holds catalog keys and Manifesto.tsx resolves them with `t()`.
 */
export const manifestoAssurances: ManifestoAssurance[] = [
  {
    icon: <FiUserPlus />,
    titleKey: "homepage:manifesto.assurance.vouched.title",
    descriptionKey: "homepage:manifesto.assurance.vouched.description",
  },
  {
    icon: <FiMapPin />,
    titleKey: "homepage:manifesto.assurance.safeSpaces.title",
    descriptionKey: "homepage:manifesto.assurance.safeSpaces.description",
  },
  {
    icon: <FiLock />,
    titleKey: "homepage:manifesto.assurance.encrypted.title",
    descriptionKey: "homepage:manifesto.assurance.encrypted.description",
  },
  {
    icon: <FiEyeOff />,
    titleKey: "homepage:manifesto.assurance.privacy.title",
    descriptionKey: "homepage:manifesto.assurance.privacy.description",
  },
  {
    icon: <FiClock />,
    titleKey: "homepage:manifesto.assurance.moderation.title",
    descriptionKey: "homepage:manifesto.assurance.moderation.description",
  },
];
