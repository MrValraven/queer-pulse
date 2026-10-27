import type {
  StudioArtistRefView,
  StudioPlaylistView,
  StudioReleaseView,
  StudioTrackView,
} from "../api/studio.adapters";
import type { StudioShareKind } from "./studioLinkTarget";

/** The two picker rules (spec rulings). `canSendToOthers` false: the viewer
 *  owns a persona-credited, Connections-only playlist, so sending it from
 *  their account would pair them with the persona; Copy link stays.
 *  `ownPersonaName`: the viewer owns the persona behind this release or
 *  track, so the picker says so in one line. */
export interface StudioShareRules {
  canSendToOthers: boolean;
  ownPersonaName: string | null;
}

export interface StudioShareRuleSources {
  track?: StudioTrackView;
  release?: StudioReleaseView;
  playlist?: StudioPlaylistView;
  /** Milestone links: the persona the milestone belongs to. */
  milestoneArtistId?: string;
}

const OPEN_RULES: StudioShareRules = {
  canSendToOthers: true,
  ownPersonaName: null,
};

export function studioShareRulesOf(
  kind: StudioShareKind,
  sources: StudioShareRuleSources,
  ownedPersonas: readonly StudioArtistRefView[],
): StudioShareRules {
  const ownedPersonaName = (personaId: string) =>
    ownedPersonas.find((persona) => persona.id === personaId)?.name ?? null;
  if (kind === "milestone") {
    // Anyone may send a milestone; the owner hears whose it is.
    return {
      canSendToOthers: true,
      ownPersonaName: ownedPersonaName(sources.milestoneArtistId ?? ""),
    };
  }
  if (kind === "playlist") {
    const playlist = sources.playlist;
    // Fails closed until the playlist is known.
    if (!playlist) return { canSendToOthers: false, ownPersonaName: null };
    const isPersonaConnectionsPlaylist =
      playlist.isOwner &&
      playlist.credit.kind === "persona" &&
      playlist.visibility === "connections";
    return {
      canSendToOthers: !isPersonaConnectionsPlaylist,
      ownPersonaName: null,
    };
  }
  if (kind === "release") {
    const release = sources.release;
    if (!release) return OPEN_RULES;
    return {
      canSendToOthers: true,
      ownPersonaName:
        ownedPersonaName(release.artist.id) ??
        (release.isOwner ? release.artist.name : null),
    };
  }
  const track = sources.track;
  return {
    canSendToOthers: true,
    ownPersonaName: track ? ownedPersonaName(track.release.artist.id) : null,
  };
}
