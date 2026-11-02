import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createEventBatch,
  type CreateEventBatchDto,
  type CreatedEventBatchDTO,
} from "./eventBatch.api";
import { eventKeys } from "./eventKeys";

/** The My Events dashboard's key root (`useMyEventsData`). */
const MY_EVENTS_KEY_ROOT = ["my-events"] as const;

/**
 * Publishes a month of events in one all-or-nothing request
 * (`POST /events/batch`). The page names every failure reason itself, so the
 * global error toast stays quiet. On success it refreshes every events list
 * (the hosting list, profile events through `byMember`, the starting-event
 * picker) and My Events. Demo mode publishes through the stand-in in
 * `addMonth/eventBatchDemo.ts`.
 */
export function useCreateEventBatch(): UseMutationResult<
  CreatedEventBatchDTO,
  Error,
  CreateEventBatchDto
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CreatedEventBatchDTO, Error, CreateEventBatchDto>({
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) {
        const { createDemoEventBatch } =
          await import("../addMonth/eventBatchDemo");
        return createDemoEventBatch(dto, new Date());
      }
      return createEventBatch(dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.listRoot });
      void queryClient.invalidateQueries({ queryKey: MY_EVENTS_KEY_ROOT });
    },
  });
}
