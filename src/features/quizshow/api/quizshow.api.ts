import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client";
import type {
  QuizshowCreateGameInput,
  QuizshowGameInput,
  QuizshowGameListResponse,
  QuizshowGameResponse,
  QuizshowImportInput,
  QuizshowImportSource,
  QuizshowJoinInput,
  QuizshowJoinResponse,
  QuizshowOpenSessionInput,
  QuizshowOpenSessionResponse,
  QuizshowQuizInput,
  QuizshowQuizResponse,
  QuizshowResultsResponse,
  QuizshowStarterPackCard,
} from "../../../shared/contracts/quizshow";

const eventPath = (slug: string): string =>
  `/events/${encodeURIComponent(slug)}/quizshow`;

export const getQuizshowQuiz = (slug: string): Promise<QuizshowQuizResponse> =>
  apiGet<QuizshowQuizResponse>(eventPath(slug));

export const putQuizshowQuiz = (
  slug: string,
  body: QuizshowQuizInput,
): Promise<QuizshowQuizResponse> =>
  apiPut<QuizshowQuizResponse>(eventPath(slug), body);

export const importQuizshowQuiz = (
  slug: string,
  body: QuizshowImportInput,
): Promise<QuizshowQuizResponse> =>
  apiPost<QuizshowQuizResponse>(`${eventPath(slug)}/import`, body);

export const getQuizshowImportSources = (
  slug: string,
): Promise<{ items: QuizshowImportSource[] }> =>
  apiGet<{ items: QuizshowImportSource[] }>(
    `${eventPath(slug)}/import-sources`,
  );

export const getQuizshowPacks = (): Promise<{
  items: QuizshowStarterPackCard[];
}> => apiGet<{ items: QuizshowStarterPackCard[] }>("/quizshow/packs");

export const openQuizshowSession = (
  slug: string,
  body: QuizshowOpenSessionInput,
): Promise<QuizshowOpenSessionResponse> =>
  apiPost<QuizshowOpenSessionResponse>(`${eventPath(slug)}/sessions`, body);

export const joinQuizshow = (
  body: QuizshowJoinInput,
): Promise<QuizshowJoinResponse> =>
  apiPost<QuizshowJoinResponse>("/quizshow/join", body);

export const getQuizshowResults = (
  slug: string,
): Promise<QuizshowResultsResponse> =>
  apiGet<QuizshowResultsResponse>(`${eventPath(slug)}/results`);

export const deleteQuizshowResults = (slug: string): Promise<void> =>
  apiDelete<void>(`${eventPath(slug)}/results`);

const GAMES_PATH = "/quizshow/games";

const gamePath = (gameId: string): string =>
  `${GAMES_PATH}/${encodeURIComponent(gameId)}`;

export const getQuizshowGames = (): Promise<QuizshowGameListResponse> =>
  apiGet<QuizshowGameListResponse>(GAMES_PATH);

export const createQuizshowGame = (
  body: QuizshowCreateGameInput,
): Promise<QuizshowGameResponse> =>
  apiPost<QuizshowGameResponse>(GAMES_PATH, body);

export const getQuizshowGame = (
  gameId: string,
): Promise<QuizshowGameResponse> =>
  apiGet<QuizshowGameResponse>(gamePath(gameId));

export const putQuizshowGame = (
  gameId: string,
  body: QuizshowGameInput,
): Promise<QuizshowGameResponse> =>
  apiPut<QuizshowGameResponse>(gamePath(gameId), body);

export const deleteQuizshowGame = (gameId: string): Promise<void> =>
  apiDelete<void>(gamePath(gameId));

export const duplicateQuizshowGame = (
  gameId: string,
): Promise<QuizshowGameResponse> =>
  apiPost<QuizshowGameResponse>(`${gamePath(gameId)}/duplicate`);

export const importQuizshowGame = (
  gameId: string,
  body: QuizshowImportInput,
): Promise<QuizshowGameResponse> =>
  apiPost<QuizshowGameResponse>(`${gamePath(gameId)}/import`, body);

export const getQuizshowGameImportSources = (
  gameId: string,
): Promise<{ items: QuizshowImportSource[] }> =>
  apiGet<{ items: QuizshowImportSource[] }>(
    `${gamePath(gameId)}/import-sources`,
  );

export const openQuizshowGameSession = (
  gameId: string,
  body: QuizshowOpenSessionInput,
): Promise<QuizshowOpenSessionResponse> =>
  apiPost<QuizshowOpenSessionResponse>(`${gamePath(gameId)}/sessions`, body);

export const getQuizshowGameResults = (
  gameId: string,
): Promise<QuizshowResultsResponse> =>
  apiGet<QuizshowResultsResponse>(`${gamePath(gameId)}/results`);

export const deleteQuizshowGameResults = (gameId: string): Promise<void> =>
  apiDelete<void>(`${gamePath(gameId)}/results`);
