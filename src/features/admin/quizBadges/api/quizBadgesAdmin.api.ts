import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../../shared/api/client";
import type { Paginated } from "../../../../shared/api/refs";
import type {
  QuizBadgeDefinitionDTO,
  QuizBadgeLibraryResponse,
  QuizBadgeRarity,
  QuizBadgeTint,
  QuizEventBadgeSetupDTO,
  QuizEventBadgeSetupSaveResponse,
  QuizEventSearchRowDTO,
  QuizGameWinRevokeResponse,
} from "../../../../shared/contracts/quizWinBadges";

const BADGES_PATH = "/admin/quizshow/badges";
const EVENTS_PATH = "/admin/quizshow/events";

/** One language of a badge text; a blank or null `pt` falls back to English. */
export interface QuizBadgeTextInput {
  en: string;
  pt?: string | null;
}

export interface QuizBadgeCreateBody {
  name: QuizBadgeTextInput;
  description: QuizBadgeTextInput;
  iconKey: string;
  tint: QuizBadgeTint;
  rarity: QuizBadgeRarity;
}

export type QuizBadgeUpdateBody = Partial<QuizBadgeCreateBody>;

/** The whole setup in one write: a game left out loses its badges. */
export interface QuizEventBadgeSetupBody {
  games: { gameNumber: number; badgeDefinitionIds: string[] }[];
}

const badgePath = (definitionId: string): string =>
  `${BADGES_PATH}/${encodeURIComponent(definitionId)}`;

const eventPath = (eventId: string): string =>
  `${EVENTS_PATH}/${encodeURIComponent(eventId)}`;

/** Route 1: live badges by name, then archived ones. */
export const getQuizBadgeLibrary = (): Promise<QuizBadgeLibraryResponse> =>
  apiGet<QuizBadgeLibraryResponse>(BADGES_PATH);

/** Route 2. */
export const createQuizBadge = (
  body: QuizBadgeCreateBody,
): Promise<QuizBadgeDefinitionDTO> =>
  apiPost<QuizBadgeDefinitionDTO>(BADGES_PATH, body);

/** Route 3. */
export const updateQuizBadge = (
  definitionId: string,
  body: QuizBadgeUpdateBody,
): Promise<QuizBadgeDefinitionDTO> =>
  apiPatch<QuizBadgeDefinitionDTO>(badgePath(definitionId), body);

/** Route 4. */
export const archiveQuizBadge = (
  definitionId: string,
): Promise<QuizBadgeDefinitionDTO> =>
  apiPost<QuizBadgeDefinitionDTO>(`${badgePath(definitionId)}/archive`);

/** Route 5. */
export const restoreQuizBadge = (
  definitionId: string,
): Promise<QuizBadgeDefinitionDTO> =>
  apiPost<QuizBadgeDefinitionDTO>(`${badgePath(definitionId)}/restore`);

/** Route 6: 204, refused while any win exists. */
export const deleteQuizBadge = (definitionId: string): Promise<void> =>
  apiDelete<void>(badgePath(definitionId));

/** Route 7: a blank search term stays out of the query. */
export const searchQuizEvents = (
  q: string,
  page: number,
): Promise<Paginated<QuizEventSearchRowDTO>> => {
  const trimmedSearch = q.trim();
  const searchPart =
    trimmedSearch === "" ? "" : `q=${encodeURIComponent(trimmedSearch)}&`;
  return apiGet<Paginated<QuizEventSearchRowDTO>>(
    `${EVENTS_PATH}?${searchPart}page=${page}`,
  );
};

/** Route 9. */
export const getQuizEventBadgeSetup = (
  eventId: string,
): Promise<QuizEventBadgeSetupDTO> =>
  apiGet<QuizEventBadgeSetupDTO>(`${eventPath(eventId)}/badges`);

/** Route 8. */
export const putQuizEventBadgeSetup = (
  eventId: string,
  body: QuizEventBadgeSetupBody,
): Promise<QuizEventBadgeSetupSaveResponse> =>
  apiPut<QuizEventBadgeSetupSaveResponse>(`${eventPath(eventId)}/badges`, body);

/** Route 10: revokes the whole game for one member. */
export const revokeQuizGameWin = (
  eventId: string,
  winnerId: string,
  reason: string,
): Promise<QuizGameWinRevokeResponse> =>
  apiPost<QuizGameWinRevokeResponse>(
    `${eventPath(eventId)}/winners/${encodeURIComponent(winnerId)}/revoke`,
    { reason },
  );
