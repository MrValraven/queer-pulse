import { useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { eventKeys } from "../../../gatherings/api/eventKeys";
import { MUSIC_ADMIN_LIST_KEY_ROOT } from "../../../gatherings/api/eventApiTarget";
import { useDemoAwareMutation } from "../../api/demoAwareMutation";
import { addMusicEventCohost } from "./musicEvents.api";

interface AddMusicEventCohostVariables {
  memberSlug: string;
}

/**
 * Adds a cohost to a house music event straight away (contract route 27).
 * The dialog shows the refusal itself, so the global error toast stays
 * quiet. Demo resolves without a request. A live success refreshes the event
 * detail, where the cohosts ride, and the admin list.
 */
export function useAddMusicEventCohost(
  eventSlug: string,
): UseMutationResult<{ ok: true }, Error, AddMusicEventCohostVariables> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    { ok: true },
    Error,
    AddMusicEventCohostVariables
  >({
    demoMode,
    meta: { silentError: true },
    demoResult: () => ({ ok: true }),
    live: ({ memberSlug }) => addMusicEventCohost(eventSlug, memberSlug),
    logLabel: "admin.musicEvents.addCohost",
    logContext: ({ memberSlug }) => ({ eventSlug, memberSlug }),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
      void queryClient.invalidateQueries({
        queryKey: MUSIC_ADMIN_LIST_KEY_ROOT,
      });
    },
  });
}
