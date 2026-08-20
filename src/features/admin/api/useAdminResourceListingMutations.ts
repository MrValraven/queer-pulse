import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createResourceListing,
  deleteResourceListing,
  updateResourceListing,
  type AdminResourceListingDTO,
  type ResourceListingWriteBody,
} from "./adminResourceListings.api";
import { ADMIN_RESOURCE_LISTINGS_KEY } from "./useAdminResourceListings";
import { useDemoAwareMutation } from "./demoAwareMutation";

export function useCreateResourceListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminResourceListingDTO | undefined,
    Error,
    ResourceListingWriteBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true },
    demoResult: () => undefined,
    live: (body) => createResourceListing(body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_RESOURCE_LISTINGS_KEY],
      });
    },
  });
}

export interface UpdateResourceListingVars {
  id: string;
  body: Partial<ResourceListingWriteBody>;
}

export function useUpdateResourceListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminResourceListingDTO | undefined,
    Error,
    UpdateResourceListingVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true },
    demoResult: () => undefined,
    live: ({ id, body }) => updateResourceListing(id, body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_RESOURCE_LISTINGS_KEY],
      });
    },
  });
}

export function useDeleteResourceListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, string>({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true },
    demoResult: () => undefined,
    live: (id) => deleteResourceListing(id),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_RESOURCE_LISTINGS_KEY],
      });
    },
  });
}
