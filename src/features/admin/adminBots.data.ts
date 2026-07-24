import type { ProfileDTO } from "../members/api/members.api";
import type { AdminBotSummaryDTO } from "./api/adminBots.api";

/**
 * Demo fixtures for the admin System Accounts page — so the whole surface runs
 * standalone (VITE_API_URL unset) with no backend. One entry: the QueerPulse
 * house account.
 */
export const DEMO_BOTS: AdminBotSummaryDTO[] = [
  {
    userId: "demo-house-account",
    slug: "queerpulse",
    firstName: "QueerPulse",
    lastName: "",
    avatarUrl: null,
  },
];

/** The values the editor pre-fills from in demo mode, keyed by slug. */
export const DEMO_BOT_PROFILES: Record<string, ProfileDTO> = {
  queerpulse: {
    slug: "queerpulse",
    firstName: "QueerPulse",
    lastName: "",
    pronouns: "they/them",
    tagline: "The house voice — welcomes, invites, and the occasional cheer.",
    location: "Lisbon",
    avatarUrl: null,
    // Required by MemberCardDTO (which ProfileDTO extends): the house account
    // is fully public and isn't vouched for the way a member would be.
    vouchCount: 0,
    visibility: "open",
    bio: "We keep the lights on and the door held open. Say hi any time.",
    socials: [{ platform: "Instagram", urlOrHandle: "@queerpulse" }],
    limited: false,
  },
};
