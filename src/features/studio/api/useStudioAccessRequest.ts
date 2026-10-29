import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { studioErrorCodeOf } from "./studio.api";
import {
  cancelStudioAccessRequest,
  createStudioAccessRequest,
} from "./studioAccessRequest.api";
import { setDemoStudioAccessRequest } from "./studioDemoAccessRequest";
import type { StudioAccessRequestStateDTO } from "./studioLanding.types";
import { studioKeys } from "./studioQueryKeys";

// The CTA under the button names the failure's reason, so the global toast
// stays off.
const SILENT = { silentError: true } as const;
/** The demo has no server; a short wait lets the busy state be reviewed. */
const DEMO_LATENCY_MS = 300;

const waitForDemo = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, DEMO_LATENCY_MS);
  });

/** Writes the request fields into the cached GET /studio/me read, so every
 *  CTA that reads it flips at once. A missing read stays missing. */
function patchedMeRead<Read extends object>(
  current: Read | undefined,
  patch: { hasPendingRequest: boolean; wantsToRelease: boolean },
): Read | undefined {
  return current ? { ...current, ...patch } : current;
}

/** Puts the member on the list. A 409 `studio_access_request_exists` reads
 *  the request back from GET /studio/me; a 409 `studio_access_already_granted`
 *  reads every access query again, so the page opens into Studio home. */
export function useRequestStudioAccess(): UseMutationResult<
  StudioAccessRequestStateDTO,
  unknown,
  { wantsToRelease: boolean }
> {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const meKey = studioKeys.me(demoMode, user?.id ?? null);
  return useMutation<
    StudioAccessRequestStateDTO,
    unknown,
    { wantsToRelease: boolean }
  >({
    meta: SILENT,
    mutationFn: async ({ wantsToRelease }) => {
      if (demoMode) {
        await waitForDemo();
        setDemoStudioAccessRequest({ wantsToRelease });
        return {
          hasPendingRequest: true,
          wantsToRelease,
          requestedAt: new Date().toISOString(),
        };
      }
      return createStudioAccessRequest({ wantsToRelease });
    },
    onSuccess: (answer) => {
      if (demoMode) return;
      queryClient.setQueryData(meKey, (current: object | undefined) =>
        patchedMeRead(current, {
          hasPendingRequest: true,
          wantsToRelease: answer.wantsToRelease,
        }),
      );
    },
    onError: (error) => {
      const code = studioErrorCodeOf(error);
      if (code === "studio_access_request_exists") {
        void queryClient.invalidateQueries({ queryKey: meKey });
      } else if (code === "studio_access_already_granted") {
        void queryClient.invalidateQueries({ queryKey: studioKeys.meAll });
      }
    },
  });
}

/** Takes the member off the list. The server answers 204 whether or not a
 *  request exists, so a repeat cancel needs no special case. */
export function useCancelStudioAccessRequest(): UseMutationResult<
  void,
  unknown,
  void
> {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const meKey = studioKeys.me(demoMode, user?.id ?? null);
  return useMutation<void, unknown, void>({
    meta: SILENT,
    mutationFn: async () => {
      if (demoMode) {
        await waitForDemo();
        setDemoStudioAccessRequest(null);
        return;
      }
      await cancelStudioAccessRequest();
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.setQueryData(meKey, (current: object | undefined) =>
        patchedMeRead(current, {
          hasPendingRequest: false,
          wantsToRelease: false,
        }),
      );
    },
  });
}
