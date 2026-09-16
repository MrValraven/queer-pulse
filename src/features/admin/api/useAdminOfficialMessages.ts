import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  DEMO_OFFICIAL_BROADCASTS,
  demoOfficialBroadcast,
  demoOfficialMessageSent,
  searchDemoOfficialRecipients,
} from "../adminOfficialMessages.data";
import {
  createOfficialBroadcast,
  getOfficialBroadcasts,
  isBroadcastUnfinished,
  OFFICIAL_RECIPIENT_MIN_SEARCH_LENGTH,
  searchOfficialRecipients,
  sendOfficialMessage,
  type OfficialBroadcastDTO,
  type OfficialMessageSentDTO,
  type OfficialRecipientDTO,
} from "./adminOfficialMessages.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

const OFFICIAL_BROADCASTS_KEY = ["admin", "official-broadcasts"] as const;

/** How often the history refreshes while a live broadcast is still delivering. */
const UNFINISHED_BROADCAST_POLL_MS = 5000;

/**
 * Broadcast history, newest 50. Demo reads the fixture; live polls every few
 * seconds only while some broadcast is still pending or sending, so the
 * delivered count climbs on screen and polling stops once everything settles.
 */
export function useOfficialBroadcasts() {
  const { demoMode } = useDemoMode();
  return useQuery<OfficialBroadcastDTO[]>({
    queryKey: [...OFFICIAL_BROADCASTS_KEY, demoMode],
    queryFn: () =>
      demoMode ? DEMO_OFFICIAL_BROADCASTS : getOfficialBroadcasts(),
    refetchInterval: (query) =>
      !demoMode && (query.state.data ?? []).some(isBroadcastUnfinished)
        ? UNFINISHED_BROADCAST_POLL_MS
        : false,
  });
}

/**
 * The "message one member" typeahead. Disabled below the minimum term length;
 * `placeholderData` keeps the previous results on screen while the next
 * keystroke's request is in flight (mirrors `useTrustNetworkMemberSearch`).
 */
export function useOfficialRecipientSearch(term: string) {
  const { demoMode } = useDemoMode();
  const trimmedTerm = term.trim();
  const recipientsQuery = useQuery<OfficialRecipientDTO[]>({
    queryKey: ["admin", "official-recipients", demoMode, trimmedTerm],
    enabled: trimmedTerm.length >= OFFICIAL_RECIPIENT_MIN_SEARCH_LENGTH,
    queryFn: ({ signal }) =>
      demoMode
        ? searchDemoOfficialRecipients(trimmedTerm)
        : searchOfficialRecipients(trimmedTerm, signal),
    placeholderData: (previous) => previous,
  });
  return { ...recipientsQuery, results: recipientsQuery.data ?? [] };
}

export interface SendOfficialMessageVariables {
  recipient: OfficialRecipientDTO;
  body: string;
}

/** Posts to one member's official thread. Demo never touches the network. */
export function useSendOfficialMessage() {
  const { demoMode } = useDemoMode();
  return useDemoAwareMutation<
    OfficialMessageSentDTO,
    Error,
    SendOfficialMessageVariables,
    unknown
  >({
    demoMode,
    demoResult: ({ recipient }) => demoOfficialMessageSent(recipient),
    live: ({ recipient, body }) => sendOfficialMessage(recipient.userId, body),
    logLabel: "admin.officialMessages.send",
    logContext: ({ recipient }) => ({ recipientId: recipient.userId }),
  });
}

export interface CreateOfficialBroadcastVariables {
  body: string;
  idempotencyKey: string;
}

/**
 * Accepts a broadcast. The returned row is prepended to the history in both
 * modes, so it appears at once; live mode then invalidates, and the polling in
 * `useOfficialBroadcasts` follows its delivery.
 */
export function useCreateOfficialBroadcast() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    OfficialBroadcastDTO,
    Error,
    CreateOfficialBroadcastVariables,
    unknown
  >({
    demoMode,
    demoResult: ({ body, idempotencyKey }) =>
      demoOfficialBroadcast(body, idempotencyKey),
    live: ({ body, idempotencyKey }) =>
      createOfficialBroadcast(body, idempotencyKey),
    logLabel: "admin.officialMessages.broadcast",
    onSuccess: (broadcast) => {
      queryClient.setQueryData<OfficialBroadcastDTO[]>(
        [...OFFICIAL_BROADCASTS_KEY, demoMode],
        (previous) => [
          broadcast,
          ...(previous ?? []).filter((row) => row.id !== broadcast.id),
        ],
      );
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: OFFICIAL_BROADCASTS_KEY });
    },
  });
}
