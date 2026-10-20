import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_ERROR_CODES,
  type QuizshowErrorCode,
  type QuizshowQuizProblem,
} from "../../../shared/contracts/quizshow";

const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set(QUIZSHOW_ERROR_CODES);

function bodyOf(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError)) return null;
  const { data } = error;
  if (typeof data !== "object" || data === null) return null;
  return data as Record<string, unknown>;
}

export function quizshowErrorCodeOf(error: unknown): QuizshowErrorCode | null {
  const code = bodyOf(error)?.code;
  if (typeof code !== "string" || !KNOWN_ERROR_CODES.has(code)) return null;
  return code as QuizshowErrorCode;
}

export function quizshowProblemsOf(error: unknown): QuizshowQuizProblem[] {
  const problems = bodyOf(error)?.problems;
  return Array.isArray(problems) ? (problems as QuizshowQuizProblem[]) : [];
}

export function quizshowOpenSessionRefOf(
  error: unknown,
): { sessionId: string; joinCode: string } | null {
  if (quizshowErrorCodeOf(error) !== "quizshow_session_already_open") {
    return null;
  }
  const body = bodyOf(error);
  const sessionId = body?.sessionId;
  const joinCode = body?.joinCode;
  if (typeof sessionId !== "string" || typeof joinCode !== "string") {
    return null;
  }
  return { sessionId, joinCode };
}

export function quizshowErrorKeyOf(code: QuizshowErrorCode | null): string {
  if (code === null) return "quizshow:errors.generic";
  if (code === "ACCOUNT_RESTRICTED")
    return "quizshow:errors.account_restricted";
  return `quizshow:errors.${code.replace(/^quizshow_/, "")}`;
}
