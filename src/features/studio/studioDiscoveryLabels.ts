import type {
  StudioCreditRole,
  StudioMood,
  StudioPersonaCreditStatus,
} from "./api/studio.types";

// Catalog keys for the discovery vocabularies. A module of its own, with no
// imports beyond the types, so the notifications feature can name a credit
// role without loading the Studio adapters.

export const STUDIO_MOOD_LABEL_KEY: Record<StudioMood, string> = {
  "late-night": "studio:mood.lateNight",
  euphoric: "studio:mood.euphoric",
  tender: "studio:mood.tender",
  melancholy: "studio:mood.melancholy",
  defiant: "studio:mood.defiant",
  dreamy: "studio:mood.dreamy",
  "slow-burn": "studio:mood.slowBurn",
  sweaty: "studio:mood.sweaty",
  calm: "studio:mood.calm",
  playful: "studio:mood.playful",
};

export const STUDIO_CREDIT_ROLE_LABEL_KEY: Record<StudioCreditRole, string> = {
  featured: "studio:credits.role.featured",
  producer: "studio:credits.role.producer",
  "co-writer": "studio:credits.role.coWriter",
  mixing: "studio:credits.role.mixing",
  mastering: "studio:credits.role.mastering",
  remix: "studio:credits.role.remix",
  "cover-art": "studio:credits.role.coverArt",
  other: "studio:credits.role.other",
};

export const STUDIO_CREDIT_STATUS_LABEL_KEY: Record<
  StudioPersonaCreditStatus,
  string
> = {
  pending: "studio:credits.status.pending",
  accepted: "studio:credits.status.accepted",
  declined: "studio:credits.status.declined",
};
