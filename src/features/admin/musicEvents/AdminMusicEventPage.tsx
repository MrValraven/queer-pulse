import { useParams } from "react-router-dom";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useEvent } from "../../gatherings/api/useEvent";
import { gatheringSlugFromParam } from "../../gatherings/gatheringPaths";
import { EventHostScopeContext } from "../../gatherings/eventHostScope";
import { HOUSE_MUSIC_DEMO_SLUGS } from "../../gatherings/houseMusicEvents.data";
import { ManageGatheringDashboard } from "../../gatherings/ManageGatheringDashboard";
import { isMusicEventNotFound } from "./api/musicEventErrors";
import {
  AdminMusicEventLoadError,
  AdminMusicEventManageSkeleton,
  AdminMusicEventNotFound,
} from "./AdminMusicEventStates";
import { AdminMusicEventFrame } from "./AdminMusicEventFrame";
import { MUSIC_ADMIN_HOST_SCOPE } from "./musicAdminHostScope";

/** The slugs demo mode can open here: the four house music events. */
const HOUSE_DEMO_SLUGS: ReadonlySet<string> = new Set(
  Object.values(HOUSE_MUSIC_DEMO_SLUGS),
);

/**
 * One QueerPulse music event's dashboard in the admin console. Everything
 * runs inside the music admin host scope, so the detail, the writes and the
 * pickers all go to the admin music events API.
 */
export function AdminMusicEventPage() {
  return (
    <EventHostScopeContext.Provider value={MUSIC_ADMIN_HOST_SCOPE}>
      <AdminMusicEventBody />
    </EventHostScopeContext.Provider>
  );
}

function AdminMusicEventBody() {
  const { slug } = useParams();
  const { demoMode } = useDemoMode();
  const { data, error, isError, isFetching, refetch } = useEvent(slug);

  // Demo resolves any slug to some registry entry, so only the house events
  // count as hosted by QueerPulse there.
  const isOutsideHouseDemo =
    demoMode && !HOUSE_DEMO_SLUGS.has(gatheringSlugFromParam(slug ?? ""));
  if (isOutsideHouseDemo) return <AdminMusicEventNotFound />;

  // A loaded event stays on screen through a failed refetch.
  if (data) {
    return (
      <ManageGatheringDashboard
        demoMode={demoMode}
        gathering={data.gathering}
        slug={data.gathering.slug}
        routeParam={slug}
        Frame={AdminMusicEventFrame}
      />
    );
  }
  if (isMusicEventNotFound(error)) return <AdminMusicEventNotFound />;
  if (isError) {
    return (
      <AdminMusicEventLoadError
        error={error}
        isRetrying={isFetching}
        onRetry={() => void refetch()}
      />
    );
  }
  return <AdminMusicEventManageSkeleton />;
}
