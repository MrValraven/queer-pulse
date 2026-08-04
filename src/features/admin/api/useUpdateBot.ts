import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type {
  SocialLinkDTO,
  UpdateProfileDTO,
} from "../../members/api/members.api";
import {
  replaceBotSocials,
  updateBotProfile,
  updateBotUsername,
} from "./adminBots.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** Everything the editor collects for one save. */
export interface BotEdits {
  userId: string;
  /** The handle currently on the account — used to skip the rename PUT when unchanged. */
  originalUsername: string;
  username: string;
  profile: UpdateProfileDTO;
  socials: SocialLinkDTO[];
}

/**
 * Save an admin's edits to a system account. Fans out to the three admin
 * endpoints in order (core PATCH → rename PUT only if changed → socials PUT),
 * sequentially so a failure surfaces with its own response (e.g. a 409 on a
 * taken username). Demo mode is a no-op — the editor keeps its local state.
 */
export function useUpdateBot() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, BotEdits>({
    demoMode,
    demoLatencyMs: 0,
    // AdminBotEditorDrawer toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: () => undefined,
    live: async (edits) => {
      await updateBotProfile(edits.userId, edits.profile);
      if (edits.username !== edits.originalUsername) {
        await updateBotUsername(edits.userId, edits.username);
      }
      await replaceBotSocials(edits.userId, edits.socials);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "bots"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "bot"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
