import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createSpaceRequest,
  getLatestSpaceRequest,
  withdrawSpaceRequest,
  type CreateSpaceRequestBody,
  type SpaceRequestDTO,
} from "./communitySpaceRequests.api";

const DEMO_LATENCY_MS = 400;

// Demo mode has no backend, so a request filed this session lives here until
// reload, keyed by community slug.
const demoRequestsBySlug = new Map<string, SpaceRequestDTO | null>();

export function spaceRequestPrefix(slug: string) {
  return ["space-request", slug] as const;
}

/** The community's most recent space request, or null when it never asked. */
export function useLatestSpaceRequest(slug: string, isEnabled: boolean) {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: [...spaceRequestPrefix(slug), demoMode],
    enabled: isEnabled && Boolean(slug),
    queryFn: async (): Promise<SpaceRequestDTO | null> => {
      if (demoMode) return demoRequestsBySlug.get(slug) ?? null;
      const response = await getLatestSpaceRequest(slug);
      return response.request;
    },
  });
}

export function useCreateSpaceRequest(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<SpaceRequestDTO, Error, CreateSpaceRequestBody>({
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (!demoMode) return createSpaceRequest(slug, body);
      await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
      const request: SpaceRequestDTO = {
        id: `demo-space-request-${Date.now()}`,
        status: "open",
        note: body.note ?? null,
        createdAt: new Date().toISOString(),
        decidedAt: null,
        declineReason: null,
        requestedBy: null,
      };
      demoRequestsBySlug.set(slug, request);
      return request;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: spaceRequestPrefix(slug),
      });
    },
  });
}

export function useWithdrawSpaceRequest(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<SpaceRequestDTO | null, Error, void>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (!demoMode) return withdrawSpaceRequest(slug);
      await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
      const current = demoRequestsBySlug.get(slug) ?? null;
      const withdrawn = current
        ? {
            ...current,
            status: "withdrawn" as const,
            decidedAt: new Date().toISOString(),
          }
        : null;
      demoRequestsBySlug.set(slug, withdrawn);
      return withdrawn;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: spaceRequestPrefix(slug),
      });
    },
  });
}
