import { useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { studioReasonOf, type StudioFailureReason } from "../studioReason";
import { getStudioMe } from "./studio.api";
import {
  toMeView,
  type StudioArtistRefView,
  type StudioMeView,
} from "./studio.adapters";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import {
  readDemoStudioAccessRequest,
  subscribeDemoStudioAccessRequest,
} from "./studioDemoAccessRequest";
import { isDemoStudioAccessOff } from "./studioDemoAccessSwitch";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { studioKeys } from "./studioQueryKeys";

export type StudioAccessStatus = "pending" | "granted" | "denied";

export interface StudioAccess {
  status: StudioAccessStatus;
  hasAccess: boolean;
  isPending: boolean;
  /** GET /studio/me failed for a reason that says nothing about the grant
   *  (offline, unreachable, a timeout, a rate limit, our server). The status
   *  still reads "denied" and hasAccess false; this only tells a failed read
   *  apart from a real denial, so device memory survives one. A forbidden,
   *  not-found or restricted answer is a real denial and reads false. It
   *  stays true through a Retry, until the read lands. */
  isReadFailed: boolean;
  /** Why the read failed (offline, timeout, our server), so the access error
   *  names the cause. null unless `isReadFailed`. */
  reason: StudioFailureReason | null;
  /** Studio artist personas the member owns or co-owns. Empty without a grant. */
  uploadablePersonas: StudioArtistRefView[];
}

const PENDING: StudioAccess = {
  status: "pending",
  hasAccess: false,
  isPending: true,
  isReadFailed: false,
  reason: null,
  uploadablePersonas: [],
};
const DENIED: StudioAccess = {
  status: "denied",
  hasAccess: false,
  isPending: false,
  isReadFailed: false,
  reason: null,
  uploadablePersonas: [],
};
/** Answers that mean "no grant here": the teaser, never the access error. */
const DENIAL_REASONS: ReadonlySet<StudioFailureReason> = new Set([
  "forbidden",
  "notFound",
  "restricted",
]);

/** A failed read: the same denial everywhere, flagged as a failure. */
function readFailedOf(reason: StudioFailureReason): StudioAccess {
  if (DENIAL_REASONS.has(reason)) return DENIED;
  return { ...DENIED, isReadFailed: true, reason };
}
const DEMO_VIEW = toMeView(DEMO_STUDIO_ME);
const DEMO_ACCESS: StudioAccess = {
  status: "granted",
  hasAccess: true,
  isPending: false,
  isReadFailed: false,
  reason: null,
  uploadablePersonas: DEMO_VIEW.uploadablePersonas,
};

function accessOf(view: StudioMeView): StudioAccess {
  return view.hasAccess
    ? {
        status: "granted",
        hasAccess: true,
        isPending: false,
        isReadFailed: false,
        reason: null,
        uploadablePersonas: view.uploadablePersonas,
      }
    : DENIED;
}

/** The access read plus the fields the adapter does not carry yet. */
type StudioMeRead = StudioMeView & {
  /** DES-84: claims on the member's tracks they can still counter. null
   *  until the server sends `counterWindowsOpen` (a backend follow-up). */
  counterWindowsOpen: number | null;
  /** Landing v2: a Studio access request is waiting. */
  hasPendingRequest: boolean;
  /** Landing v2: the waiting request asked to release music. */
  wantsToRelease: boolean;
};

function counterWindowsOpenOf(dto: unknown): number | null {
  const value =
    typeof dto === "object" && dto !== null && "counterWindowsOpen" in dto
      ? dto.counterWindowsOpen
      : null;
  return typeof value === "number" && value >= 0 ? value : null;
}

/** Anything but `true` reads false, the way a server that predates the field
 *  reads. */
function flagOf(dto: unknown, field: string): boolean {
  return (
    typeof dto === "object" &&
    dto !== null &&
    field in dto &&
    (dto as Record<string, unknown>)[field] === true
  );
}

/** The one GET /studio/me read every caller shares (same key, one fetch). */
function useStudioMeQuery() {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, user } = useAuth();
  const userId = user?.id ?? null;
  const query = useQuery({
    queryKey: studioKeys.me(demoMode, userId),
    enabled: !demoMode && loggedIn && !checking,
    queryFn: async (): Promise<StudioMeRead> => {
      const dto = await getStudioMe();
      const hasPendingRequest = flagOf(dto, "hasPendingRequest");
      return {
        ...toMeView(dto),
        counterWindowsOpen: counterWindowsOpenOf(dto),
        hasPendingRequest,
        wantsToRelease: hasPendingRequest && flagOf(dto, "wantsToRelease"),
      };
    },
    staleTime: 60_000,
    // A failed read shows the Studio-framed access error, so no toast.
    meta: { silentError: true },
  });
  return { query, demoMode, loggedIn, checking };
}

/**
 * Whether the signed-in member may use Studio (GET /studio/me). The route
 * gate, the nav, the player and the persona sections all read this one
 * query. Demo grants everyone with the demo persona and never asks. A failed
 * read still reads as no grant everywhere, flagged `isReadFailed` with its
 * `reason`, so the router shows the access error with Retry and never the
 * teaser. In demo, `?studioAccess=off` (`studioDemoAccessSwitch.ts`) reports
 * no grant until `?studioAccess=on`.
 */
export function useStudioAccess(): StudioAccess {
  const { query, demoMode, loggedIn, checking } = useStudioMeQuery();
  // A Retry resets the query to pending and its error to null. The last
  // settled reason is held (adjusted during render) so the access error
  // keeps its panel, its reason and its focus until the read lands.
  const [settledReason, setSettledReason] =
    useState<StudioFailureReason>("unknown");
  const liveReason = query.isError ? studioReasonOf(query.error) : null;
  if (liveReason !== null && liveReason !== settledReason) {
    setSettledReason(liveReason);
  }
  // `?studioAccess=off` (demo only) shows every surface as a member without
  // a grant sees it, the Studio teaser card included.
  if (demoMode) return isDemoStudioAccessOff() ? DENIED : DEMO_ACCESS;
  if (checking) return PENDING;
  if (!loggedIn) return DENIED;
  if (query.data) return accessOf(query.data);
  const hasFailedBefore = query.errorUpdateCount > 0;
  if (hasFailedBefore) return readFailedOf(liveReason ?? settledReason);
  return PENDING;
}

/** DES-84, live: the open counter windows GET /studio/me reports, or null
 *  while the server does not send the field (and always in demo). */
export function useStudioCounterWindowsOpenLive(): number | null {
  const { query, demoMode } = useStudioMeQuery();
  if (demoMode) return null;
  return query.data?.counterWindowsOpen ?? null;
}

/** The access read as a Studio load state, for the access error panel: its
 *  reason line and its Retry, which keeps the panel up while it runs. */
export function useStudioAccessLoadState(): StudioLoadState {
  const { query } = useStudioMeQuery();
  return studioLoadStateOf(query, query.data !== undefined);
}

/** Landing v2: where the member stands on the "waiting for Studio" list. */
export interface StudioAccessRequestState {
  /** False until GET /studio/me answered (and in demo with access on). */
  isKnown: boolean;
  hasPendingRequest: boolean;
  wantsToRelease: boolean;
}

const REQUEST_UNKNOWN: StudioAccessRequestState = {
  isKnown: false,
  hasPendingRequest: false,
  wantsToRelease: false,
};
const REQUEST_NONE: StudioAccessRequestState = {
  ...REQUEST_UNKNOWN,
  isKnown: true,
};

/**
 * Whether the member is on the Studio access list, read from the same
 * GET /studio/me query as `useStudioAccess` (no second fetch). Demo with
 * access off reads the in-memory request (`studioDemoAccessRequest.ts`); demo
 * with access on reads no request.
 */
export function useStudioAccessRequestState(): StudioAccessRequestState {
  const { query, demoMode } = useStudioMeQuery();
  const demoRequest = useSyncExternalStore(
    subscribeDemoStudioAccessRequest,
    readDemoStudioAccessRequest,
  );
  if (demoMode) {
    return isDemoStudioAccessOff()
      ? { isKnown: true, ...demoRequest }
      : REQUEST_NONE;
  }
  if (!query.data) return REQUEST_UNKNOWN;
  return {
    isKnown: true,
    hasPendingRequest: query.data.hasPendingRequest,
    wantsToRelease: query.data.wantsToRelease,
  };
}
