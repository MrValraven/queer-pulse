import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  demoHostConfig,
  demoHostSummary,
  demoSaveHostConfig,
} from "../goTogether.mock";
import {
  getGoTogetherHostConfig,
  getGoTogetherHostSummary,
  saveGoTogetherHostConfig,
} from "./goTogether.api";
import type {
  HostConfigBody,
  HostConfigDTO,
  HostSummaryDTO,
} from "./goTogether.types";
import { goTogetherKeys } from "./goTogetherKeys";

function useIsActiveSession(): boolean {
  const { loggedIn, checking, status } = useAuth();
  return !checking && loggedIn && status === "active";
}

/** The host's Go together settings, `GET /events/:slug/go-together/config`. */
export function useGoTogetherHostConfig(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const isActiveSession = useIsActiveSession();
  return useQuery<HostConfigDTO>({
    queryKey: goTogetherKeys.hostConfig(slug, demoMode),
    enabled: Boolean(slug) && (demoMode || isActiveSession),
    retry: false,
    queryFn: async () =>
      demoMode || !slug
        ? demoHostConfig(slug ?? "")
        : getGoTogetherHostConfig(slug),
  });
}

/** PUT /events/:slug/go-together/config. The card shows the host questions
 *  and the cutoff, so every card refreshes. */
export function useSaveGoTogetherHostConfig(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<HostConfigDTO, Error, HostConfigBody>({
    meta: { silentError: true },
    mutationFn: async (body) =>
      demoMode
        ? demoSaveHostConfig(slug, body)
        : saveGoTogetherHostConfig(slug, body),
    onSuccess: (config) => {
      queryClient.setQueryData(
        goTogetherKeys.hostConfig(slug, demoMode),
        config,
      );
      void queryClient.invalidateQueries({ queryKey: goTogetherKeys.cardRoot });
    },
  });
}

/** The host sees counts only, with no member ids: `GET /events/:slug/go-together/summary`. */
export function useGoTogetherHostSummary(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const isActiveSession = useIsActiveSession();
  return useQuery<HostSummaryDTO>({
    queryKey: goTogetherKeys.hostSummary(slug, demoMode),
    enabled: Boolean(slug) && (demoMode || isActiveSession),
    retry: false,
    queryFn: async () =>
      demoMode || !slug ? demoHostSummary() : getGoTogetherHostSummary(slug),
  });
}
