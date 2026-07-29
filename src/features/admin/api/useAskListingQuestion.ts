import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import { askListingQuestion } from "../../marketing/listBusiness/api/listings.api";
import {
  listingDtoToQueueRow,
  type ListingQueueRow,
} from "./adminListings.api";
import { ADMIN_LISTINGS_KEY } from "./useAdminListings";

/** How long demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 400;

export interface AskListingQuestionVars {
  row: ListingQueueRow;
  body: string;
}

/**
 * A moderator asks a listing's submitter a question. Live mode POSTs
 * `/listings/:ref/question` (which DMs the submitter and moves the listing to
 * `question`), then invalidates the queue. Demo mode resolves after a short
 * simulated delay and never touches the network — the fixture must not appear
 * to mutate platform truth, and no real DM is sent.
 */
export function useAskListingQuestion() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ListingQueueRow, Error, AskListingQuestionVars>({
    mutationFn: async ({ row, body }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.listing.askQuestion (demo — no network)", {
          ref: row.ref,
          length: body.length,
        });
        return { ...row, status: "question" };
      }
      const updated = await askListingQuestion(row.ref, body);
      return listingDtoToQueueRow(updated);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
    },
  });
}
