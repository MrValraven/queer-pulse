import type { ReactNode } from "react";
import {
  FiClock,
  FiEyeOff,
  FiLock,
  FiShield,
  FiUserPlus,
} from "react-icons/fi";

export interface ManifestoAssurance {
  icon: ReactNode;
  title: string;
  description: string;
}

/** The five safety guarantees shown beside the manifesto copy. */
export const manifestoAssurances: ManifestoAssurance[] = [
  {
    icon: <FiUserPlus />,
    title: "Vouched entry",
    description:
      "You're introduced by someone already here. That's the entry — not a form, not a waitlist.",
  },
  {
    icon: <FiLock />,
    title: "Encrypted messaging",
    description:
      "What you say here stays here. Conversations between members are end-to-end encrypted.",
  },
  {
    icon: <FiEyeOff />,
    title: "Granular privacy",
    description:
      "Choose what your profile shows, and to whom. Your visibility is always in your hands.",
  },
  {
    icon: <FiClock />,
    title: "24h moderation response",
    description:
      "A real human reads every report. Response guaranteed within 24 hours, always.",
  },
  {
    icon: <FiShield />,
    title: "Quick exit, always",
    description:
      "Leave any page instantly if you need to. Your safety matters more than your session.",
  },
];
