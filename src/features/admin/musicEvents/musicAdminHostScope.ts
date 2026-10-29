import { routes } from "../../../app/routeMap";
import type { EventHostScope } from "../../gatherings/eventHostScope";
import { MusicEventCohostAddDialog } from "./MusicEventCohostAddDialog";
import { StudioArtistPickStep } from "./StudioArtistPickStep";
import { musicEventManagePath } from "./musicEventPaths";

/** How often the door of a QueerPulse music event refetches while open. */
export const MUSIC_EVENT_DOOR_REFETCH_MS = 10_000;

/**
 * The host scope of QueerPulse music events run from the admin console: the
 * house hosts, the family is fixed to Music, only members and invite-only
 * audiences are on offer, and the lineup and cohost steps use the admin
 * pickers.
 */
export const MUSIC_ADMIN_HOST_SCOPE: EventHostScope = {
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  allowedVisibilities: ["members", "invite_only"],
  doorRefetchIntervalMs: MUSIC_EVENT_DOOR_REFETCH_MS,
  homePath: routes.adminMusicEvents,
  managePathFor: musicEventManagePath,
  LineupPickStep: StudioArtistPickStep,
  CohostAddDialog: MusicEventCohostAddDialog,
};
