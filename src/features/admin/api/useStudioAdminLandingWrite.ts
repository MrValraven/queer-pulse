import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { studioErrorCodeOf } from "../../studio/api/studio.api";
import { studioKeys } from "../../studio/api/studioQueryKeys";
import {
  STUDIO_ADMIN_SILENT_META,
  studioAdminDemoRefusal,
} from "../studioAdminDemoErrors";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { type AdminStudioLandingDTO } from "./studioLandingAdmin.api";
import { adminStudioLandingKey } from "./useStudioAdminLanding";

// The one write every Studio page mutation goes through.

/** The server answered a Studio `*_not_found` code: the row is already gone. */
function isNotFoundCode(error: unknown): boolean {
  return studioErrorCodeOf(error)?.endsWith("_not_found") ?? false;
}

export type LandingData = typeof import("../StudioAdminLanding.data");

export interface LandingMutationConfig<Data, Variables> {
  live: (variables: Variables) => Promise<Data>;
  demo: (data: LandingData, variables: Variables) => Data;
  /** The cache after a live success; demo reads the store instead. */
  patch: (
    landing: AdminStudioLandingDTO,
    result: Data,
    variables: Variables,
  ) => AdminStudioLandingDTO;
  /** Founding and settings writes also refresh the members' founding read. */
  shouldRefreshFounding?: boolean;
  /** Writes that change which approved rows are on the page: the staff read
   *  is fetched again, since the flags come from the server. */
  shouldRefreshStaffRead?: boolean;
  /** Reorders: the list moves at once. */
  optimistic?: (
    landing: AdminStudioLandingDTO,
    variables: Variables,
  ) => AdminStudioLandingDTO;
  /** Reorders in demo: false answers the order 409 before anything moves. */
  isOrderValid?: (
    landing: AdminStudioLandingDTO,
    variables: Variables,
  ) => boolean;
}

/** One staff write on the Studio page content. Live patches the cache in
 *  place and refreshes the members' reads; demo runs the store function
 *  (which throws the contract's refusal) and copies the store into the cache.
 *  An optimistic reorder rolls back when the server refuses the order. */
export function useLandingMutation<Data, Variables>(
  config: LandingMutationConfig<Data, Variables>,
) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = adminStudioLandingKey(demoMode);
  const read = () => queryClient.getQueryData<AdminStudioLandingDTO>(key);
  const refreshLanding = () => {
    void queryClient.invalidateQueries({
      queryKey: studioKeys.landing(demoMode),
    });
    if (config.shouldRefreshStaffRead)
      void queryClient.invalidateQueries({ queryKey: key });
    if (config.shouldRefreshFounding)
      void queryClient.invalidateQueries({
        queryKey: studioKeys.foundingArtists(demoMode),
      });
  };
  return useDemoAwareMutation<
    Data,
    Error,
    Variables,
    { previous: AdminStudioLandingDTO | undefined }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: async (variables) => {
      const data = await import("../StudioAdminLanding.data");
      const result = config.demo(data, variables);
      queryClient.setQueryData(key, data.demoAdminStudioLanding());
      return result;
    },
    live: config.live,
    onMutate: async (variables) => {
      const { optimistic, isOrderValid } = config;
      if (!optimistic) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: key });
      const previous = read();
      if (!previous) return { previous };
      if (demoMode && isOrderValid && !isOrderValid(previous, variables))
        throw studioAdminDemoRefusal("studio_landing_order_mismatch");
      queryClient.setQueryData(key, optimistic(previous, variables));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    // After a refused live reorder the server's own order is read again, in
    // case another console moved it.
    // A 404 `*_not_found` means another console already removed the row, so
    // the staff read is fetched again and the ghost row leaves.
    onLiveError: (error) => {
      if (config.optimistic || isNotFoundCode(error))
        void queryClient.invalidateQueries({ queryKey: key });
    },
    onSuccess: (result, variables) => {
      const landing = read();
      if (!demoMode && landing)
        queryClient.setQueryData(key, config.patch(landing, result, variables));
    },
    onLiveSuccess: refreshLanding,
  });
}
