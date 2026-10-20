import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getStudioMe } from "./studio.api";
import {
  toMeView,
  type StudioArtistRefView,
  type StudioMeView,
} from "./studio.adapters";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import { isDemoStudioAccessOff } from "./studioDemoAccessSwitch";
import { studioKeys } from "./studioQueryKeys";

export type StudioAccessStatus = "pending" | "granted" | "denied";

export interface StudioAccess {
  status: StudioAccessStatus;
  hasAccess: boolean;
  isPending: boolean;
  /** Studio artist personas the member owns or co-owns. Empty without a grant. */
  uploadablePersonas: StudioArtistRefView[];
}

const PENDING: StudioAccess = {
  status: "pending",
  hasAccess: false,
  isPending: true,
  uploadablePersonas: [],
};
const DENIED: StudioAccess = {
  status: "denied",
  hasAccess: false,
  isPending: false,
  uploadablePersonas: [],
};
const DEMO_VIEW = toMeView(DEMO_STUDIO_ME);
const DEMO_ACCESS: StudioAccess = {
  status: "granted",
  hasAccess: true,
  isPending: false,
  uploadablePersonas: DEMO_VIEW.uploadablePersonas,
};

function accessOf(view: StudioMeView): StudioAccess {
  return view.hasAccess
    ? {
        status: "granted",
        hasAccess: true,
        isPending: false,
        uploadablePersonas: view.uploadablePersonas,
      }
    : DENIED;
}

/**
 * Whether the signed-in member may use Studio (GET /studio/me). The route
 * gate, the nav, the player and the persona sections all read this one
 * query. Demo grants everyone with the demo persona and never asks. A failed
 * read is treated as no grant, which shows the teaser. In demo,
 * `?studioAccess=off` (`studioDemoAccessSwitch.ts`) reports no grant until
 * `?studioAccess=on`.
 */
export function useStudioAccess(): StudioAccess {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, user } = useAuth();
  const userId = user?.id ?? null;
  const query = useQuery({
    queryKey: studioKeys.me(demoMode, userId),
    enabled: !demoMode && loggedIn && !checking,
    queryFn: async () => toMeView(await getStudioMe()),
    staleTime: 60_000,
    // The gate falls back to the teaser on a failed read, so no toast.
    meta: { silentError: true },
  });
  // `?studioAccess=off` (demo only) shows every surface as a member without
  // a grant sees it, the Studio teaser card included.
  if (demoMode) return isDemoStudioAccessOff() ? DENIED : DEMO_ACCESS;
  if (checking) return PENDING;
  if (!loggedIn) return DENIED;
  if (query.data) return accessOf(query.data);
  if (query.isError) return DENIED;
  return PENDING;
}
