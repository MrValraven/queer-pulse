import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client";
import type {
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
