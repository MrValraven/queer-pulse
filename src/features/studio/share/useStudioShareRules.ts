import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { studioTrackQueryOptions } from "../api/studioTrackQuery";
import { useStudioAccess } from "../api/useStudioAccess";
import { studioPlaylistQueryOptions } from "../api/useStudioPlaylist";
import { studioReleaseQueryOptions } from "../api/useStudioRelease";
import { isTrackShareKind, type StudioLinkTarget } from "./studioLinkTarget";
import { studioShareRulesOf, type StudioShareRules } from "./studioShareRules";

export type { StudioShareRules } from "./studioShareRules";

const OPEN_RULES: StudioShareRules = {
  canSendToOthers: true,
  ownPersonaName: null,
};

/** The two picker rules for one Studio target. `null` (a share that is not
 *  a Studio link) answers the open rules and reads nothing, so a
 *  kind-agnostic caller can call this unconditionally. Each read uses the
 *  Studio page's own query options, so on a Studio page the data is already
 *  cached and nothing new is fetched. */
export function useStudioShareRules(
  target: StudioLinkTarget | null,
): StudioShareRules {
  const { demoMode } = useDemoMode();
  const access = useStudioAccess();
  const isReadable = target !== null && (demoMode || access.hasAccess);
  const targetId = target?.id ?? "";
  const kind = target?.kind ?? null;
  // A lyric link shares its track, so it reads the track's rules.
  const isTrackKind = kind !== null && isTrackShareKind(kind);
  const trackQuery = useQuery({
    ...studioTrackQueryOptions(demoMode, targetId),
    enabled: isReadable && isTrackKind,
  });
  const releaseQuery = useQuery({
    ...studioReleaseQueryOptions(demoMode, targetId),
    enabled: isReadable && kind === "release",
  });
  const playlistQuery = useQuery({
    ...studioPlaylistQueryOptions(demoMode, targetId),
    enabled: isReadable && kind === "playlist",
  });
  if (kind === null) return OPEN_RULES;
  return studioShareRulesOf(
    kind,
    {
      track: isTrackKind ? trackQuery.data : undefined,
      release: kind === "release" ? releaseQuery.data : undefined,
      playlist: kind === "playlist" ? playlistQuery.data : undefined,
      // No read: the owned personas are already in the access answer.
      milestoneArtistId: kind === "milestone" ? target?.artistId : undefined,
    },
    access.uploadablePersonas,
  );
}
