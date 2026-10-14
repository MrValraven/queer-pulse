import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toCreditInboxView,
  type StudioCreditInboxView,
} from "./studioDiscovery.adapters";
import { getStudioCreditInbox } from "./studioDiscovery.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** Requests and accepted credits for every persona the member owns or
 *  co-owns. Accept, decline and remove patch this cache. */
export function useStudioCreditInbox(): {
  inbox: StudioCreditInboxView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.creditInbox(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toCreditInboxView(
          demoMode
            ? (await import("./studioDemoCreditReads")).demoStudioCreditInbox()
            : await getStudioCreditInbox(),
        ),
      ),
  });
  return {
    inbox: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
