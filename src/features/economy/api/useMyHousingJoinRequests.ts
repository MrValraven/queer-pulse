import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  DEMO_MY_COOP_JOIN_REQUESTS,
  DEMO_MY_GROUP_JOIN_REQUESTS,
  type MyHousingJoinRequest,
} from "../housingJoinRequests.data";
import { getMyCoopJoinRequests } from "./housingCoop.api";
import {
  getMyGroupJoinRequests,
  type MyGroupJoinRequestDTO,
} from "./housingGroups.api";
import type { MyCoopJoinRequestDTO } from "./housingCoop.api";
import { economyKeys } from "./economyKeys";

/**
 * PRD-242. The applicant's own housing applications, on both housing surfaces.
 *
 * Why these exist: triage told nobody. A member asked to join a co-op or a
 * vetted group, the form thanked them, and the outcome then lived only in the
 * review console. The bell now carries `housing_join_decided`, and a bell row
 * that opens a page with no trace of the application on it is still a dead end,
 * so these are what those pages read.
 *
 * Both reads are flat rather than per-slug: `/local/housing/coop` is one page
 * listing every co-op, so a per-slug lookup would be one request per card, and
 * the group read is shaped the same way for consistency (the group detail page
 * picks its own row out by slug).
 */
function coopDtoToJoinRequest(dto: MyCoopJoinRequestDTO): MyHousingJoinRequest {
  return {
    id: dto.id,
    name: dto.coop?.name ?? "",
    slug: dto.coop?.slug ?? null,
    status: dto.status,
    createdAt: dto.createdAt,
  };
}

/** `approved` is the group enum's spelling of the co-op enum's `accepted`. The
 *  page asks one question of both surfaces, so it reads one word. */
function groupDtoToJoinRequest(
  dto: MyGroupJoinRequestDTO,
): MyHousingJoinRequest {
  return {
    id: dto.id,
    name: dto.group?.name ?? "",
    slug: dto.group?.slug ?? null,
    status: dto.status === "approved" ? "accepted" : dto.status,
    createdAt: dto.createdAt,
  };
}

/**
 * Gated the way the backend is: the read sits behind the global JWT guard, so
 * the query stays parked while the session is still being determined and never
 * fires for a signed-out reader (an anonymous by-name application has no owner
 * and is unreadable by anybody). Demo mode reads the colocated fixture and
 * never reaches the network.
 */
function useIsSignedIn(): boolean {
  const { loggedIn, checking } = useAuth();
  return !checking && loggedIn;
}

export function useMyCoopJoinRequests() {
  const { demoMode } = useDemoMode();
  const isSignedIn = useIsSignedIn();
  return useQuery<MyHousingJoinRequest[]>({
    queryKey: economyKeys.myCoopJoinRequests(demoMode),
    enabled: demoMode || isSignedIn,
    queryFn: async () => {
      if (demoMode) return DEMO_MY_COOP_JOIN_REQUESTS;
      const dtos = await getMyCoopJoinRequests();
      return dtos.map(coopDtoToJoinRequest);
    },
  });
}

export function useMyGroupJoinRequests() {
  const { demoMode } = useDemoMode();
  const isSignedIn = useIsSignedIn();
  return useQuery<MyHousingJoinRequest[]>({
    queryKey: economyKeys.myGroupJoinRequests(demoMode),
    enabled: demoMode || isSignedIn,
    queryFn: async () => {
      if (demoMode) return DEMO_MY_GROUP_JOIN_REQUESTS;
      const dtos = await getMyGroupJoinRequests();
      return dtos.map(groupDtoToJoinRequest);
    },
  });
}
