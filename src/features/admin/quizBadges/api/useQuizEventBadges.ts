import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import type { Paginated } from "../../../../shared/api/refs";
import type {
  QuizEventBadgeSetupDTO,
  QuizEventBadgeSetupSaveResponse,
  QuizEventSearchRowDTO,
  QuizGameWinRevokeResponse,
} from "../../../../shared/contracts/quizWinBadges";
import { eventKeys } from "../../../gatherings/api/eventKeys";
import { quizshowKeys } from "../../../quizshow/api/quizshowKeys";
import {
  demoGetQuizEventBadgeSetup,
  demoPutQuizEventBadgeSetup,
  demoRevokeQuizGameWin,
  demoSearchQuizEvents,
} from "../../../quizshow/winBadges/quizWinBadgesDemoStore";
import {
  getQuizEventBadgeSetup,
  putQuizEventBadgeSetup,
  revokeQuizGameWin,
  searchQuizEvents,
  type QuizEventBadgeSetupBody,
} from "./quizBadgesAdmin.api";
import { quizBadgesAdminKeys } from "./quizBadgesAdminKeys";

// The setup page and the revoke dialog own their error copy.
const SILENT_ERROR_META = { silentError: true } as const;

/** Every read a quiz badge write can change: the admin library and setups,
 *  the members' Badges page, the Pulse Live previews and results, and the
 *  event detail whose `quizshow.winBadges` the event page reads live. */
export async function invalidateAfterQuizBadgeWrite(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: quizBadgesAdminKeys.root }),
    queryClient.invalidateQueries({ queryKey: ["recognition"] }),
    queryClient.invalidateQueries({ queryKey: quizshowKeys.root }),
    queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot }),
  ]);
}

/** Events that run a quiz, newest first. The previous page stays on screen
 *  while the next one loads. */
export function useQuizEventSearch(
  q: string,
  page: number,
): UseQueryResult<Paginated<QuizEventSearchRowDTO>> {
  const { demoMode } = useDemoMode();
  return useQuery<Paginated<QuizEventSearchRowDTO>>({
    queryKey: quizBadgesAdminKeys.events(q, page, demoMode),
    placeholderData: keepPreviousData,
    // The key holds the typed search text.
    meta: { isPrivateQueryKey: true },
    queryFn: async () =>
      demoMode ? demoSearchQuizEvents(q, page) : searchQuizEvents(q, page),
  });
}

/** One event's badge setup and finished games. An undefined id holds the read back. */
export function useQuizEventBadgeSetup(
  eventId: string | undefined,
): UseQueryResult<QuizEventBadgeSetupDTO> {
  const { demoMode } = useDemoMode();
  return useQuery<QuizEventBadgeSetupDTO>({
    queryKey: quizBadgesAdminKeys.eventSetup(eventId ?? "", demoMode),
    enabled: eventId !== undefined && eventId !== "",
    queryFn: async () => {
      if (eventId === undefined) {
        throw new Error("An event badge setup needs an event id");
      }
      return demoMode
        ? demoGetQuizEventBadgeSetup(eventId)
        : getQuizEventBadgeSetup(eventId);
    },
  });
}

/** Puts the whole setup of an event: a badge added to a finished game
 *  reaches that game's live winners. */
export function useSaveQuizEventBadgeSetup(
  eventId: string,
): UseMutationResult<
  QuizEventBadgeSetupSaveResponse,
  Error,
  QuizEventBadgeSetupBody
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    QuizEventBadgeSetupSaveResponse,
    Error,
    QuizEventBadgeSetupBody
  >({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) =>
      demoMode
        ? demoPutQuizEventBadgeSetup(eventId, body)
        : putQuizEventBadgeSetup(eventId, body),
    onSuccess: () => invalidateAfterQuizBadgeWrite(queryClient),
  });
}

/** Revokes the whole game for one member: every badge that game gave them goes. */
export function useRevokeQuizGameWin(
  eventId: string,
): UseMutationResult<
  QuizGameWinRevokeResponse,
  Error,
  { winnerId: string; reason: string }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    QuizGameWinRevokeResponse,
    Error,
    { winnerId: string; reason: string }
  >({
    meta: SILENT_ERROR_META,
    mutationFn: async ({ winnerId, reason }) =>
      demoMode
        ? demoRevokeQuizGameWin(eventId, winnerId, { reason })
        : revokeQuizGameWin(eventId, winnerId, reason),
    onSuccess: () => invalidateAfterQuizBadgeWrite(queryClient),
  });
}
