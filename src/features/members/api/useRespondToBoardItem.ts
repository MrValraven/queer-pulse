import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { respondToBoardItem } from "./members.api";

export interface RespondToBoardItemVariables {
  memberSlug: string;
  postSlug: string;
  kind: "help" | "hello";
  note?: string;
}

/**
 * Offer to help with, or say hello about, another member's board post.
 *
 * A repeat response is a 409 from the backend, which the calling component
 * renders as "you have already offered" rather than as a failure.
 */
export function useRespondToBoardItem() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    { kind: string; createdAt: string },
    Error,
    RespondToBoardItemVariables
  >({
    mutationFn: async ({ memberSlug, postSlug, kind, note }) => {
      if (demoMode) {
        return { kind, createdAt: new Date().toISOString() };
      }
      return respondToBoardItem(memberSlug, postSlug, kind, note);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
