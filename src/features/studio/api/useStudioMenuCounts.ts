import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { studioTrackPath } from "../studioPaths";
import { studioSafetyKeys } from "./studioSafetyQueryKeys";
import { useStudioCounterWindowsOpenLive } from "./useStudioAccess";

/** The menu badges own no failure state: a failed count reads as none. */
const SILENT = { silentError: true } as const;
const loadDemo = () => import("./studioDemoSafety");

export interface StudioCounterWindows {
  /** Claims holding one of the member's tracks offline that they can still
   *  answer with a counter-notice. */
  count: number;
  /** The track page of the oldest open window, where the counter form is. */
  href: string | null;
}

const NO_WINDOWS: StudioCounterWindows = { count: 0, href: null };

/**
 * DES-84: the artist's open counter-notice windows, so the avatar menu
 * keeps pointing at them after the one-off notification is read.
 *
 * Demo reads the demo claim state. Live reads `counterWindowsOpen` from
 * GET /studio/me once the server sends it (a backend follow-up), and
 * reports none until then. Live knows only the count, so the row opens
 * Your numbers, where the artist's releases are listed.
 */
export function useStudioCounterWindows(): StudioCounterWindows {
  const { demoMode } = useDemoMode();
  const liveCount = useStudioCounterWindowsOpenLive();
  const query = useQuery({
    queryKey: [...studioSafetyKeys.myClaims(demoMode), "counterWindows"],
    enabled: demoMode,
    meta: SILENT,
    queryFn: async (): Promise<StudioCounterWindows> => {
      const demo = await loadDemo();
      const openClaims = [...demo.demoWithheldTrackIds()].flatMap((trackId) =>
        demo
          .demoOwnerClaimsOfTrack(trackId)
          .filter((claim) => claim.canCounter),
      );
      const oldestClaim = [...openClaims].sort((left, right) =>
        left.acceptedAt.localeCompare(right.acceptedAt),
      )[0];
      return {
        count: openClaims.length,
        href: oldestClaim ? studioTrackPath(oldestClaim.trackId) : null,
      };
    },
  });
  if (!demoMode) {
    return liveCount && liveCount > 0
      ? { count: liveCount, href: null }
      : NO_WINDOWS;
  }
  return query.data ?? NO_WINDOWS;
}
