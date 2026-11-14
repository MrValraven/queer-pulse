import type { AdminTone, AvatarTone } from "../ui";
import type {
  HiddenLeadPersonaState,
  LeadStage,
  LeadType,
} from "./api/leads.types";

/** The label of each stage, keyed by the wire value. */
export const LEAD_STAGE_LABEL_KEY: Record<LeadStage, string> = {
  to_contact: "admin:leads.stage.to_contact",
  contacted: "admin:leads.stage.contacted",
  in_talks: "admin:leads.stage.in_talks",
  on_board: "admin:leads.stage.on_board",
  not_now: "admin:leads.stage.not_now",
};

/** The label of each type, keyed by the wire value. */
export const LEAD_TYPE_LABEL_KEY: Record<LeadType, string> = {
  artist: "admin:leads.type.artist",
  dj: "admin:leads.type.dj",
  band: "admin:leads.type.band",
  venue: "admin:leads.type.venue",
  promoter: "admin:leads.type.promoter",
  collective: "admin:leads.type.collective",
  business: "admin:leads.type.business",
  other: "admin:leads.type.other",
};

/** The persona card's status line when the linked persona left the public
 *  directory. */
export const LEAD_PERSONA_STATE_KEY: Record<HiddenLeadPersonaState, string> = {
  draft: "admin:leads.persona.state.draft",
  not_open: "admin:leads.persona.state.not_open",
  removed: "admin:leads.persona.state.removed",
  taken_down: "admin:leads.persona.state.taken_down",
};

/** The stage pill's tone. */
export const LEAD_STAGE_TONE: Record<LeadStage, AdminTone> = {
  to_contact: "ghost",
  contacted: "violet",
  in_talks: "amber",
  on_board: "jade",
  not_now: "plum",
};

/** The tint of a lead's initials avatar, by type, so a scan of the list
 *  groups venues, artists and the rest at a glance. */
export const LEAD_TYPE_AVATAR_TONE: Record<LeadType, AvatarTone> = {
  artist: "coral",
  dj: "violet",
  band: "amber",
  venue: "jade",
  promoter: "plum",
  collective: "coral",
  business: "jade",
  other: "plum",
};
