import {
  ApiError,
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import {
  GO_TOGETHER_ERROR_CODES,
  type FeedbackBody,
  type FriendMatchAnswers,
  type FriendMatchProfileDTO,
  type GoTogetherCardDTO,
  type GoTogetherErrorCode,
  type GoTogetherFeedbackDTO,
  type GoTogetherGroupDTO,
  type HostConfigBody,
  type HostConfigDTO,
  type HostSummaryDTO,
  type OptInBody,
  type PairAnswersBody,
} from "./goTogether.types";

export const getGoTogetherCard = (slug: string) =>
  apiGet<GoTogetherCardDTO>(`/events/${slug}/go-together`);
export const optInGoTogether = (slug: string, body: OptInBody) =>
  apiPost<GoTogetherCardDTO>(`/events/${slug}/go-together`, body);
export const withdrawGoTogether = (slug: string) =>
  apiDelete<GoTogetherCardDTO>(`/events/${slug}/go-together`);
export const acceptGoTogetherPair = (slug: string, body: PairAnswersBody) =>
  apiPost<GoTogetherCardDTO>(`/events/${slug}/go-together/pair/accept`, body);
export const declineGoTogetherPair = (slug: string) =>
  apiPost<GoTogetherCardDTO>(`/events/${slug}/go-together/pair/decline`);

export const getFriendMatchProfile = () =>
  apiGet<FriendMatchProfileDTO>("/go-together/profile");
export const saveFriendMatchProfile = (answers: FriendMatchAnswers) =>
  apiPut<FriendMatchProfileDTO>("/go-together/profile", {
    answers,
    consent: true,
  });
export const deleteFriendMatchProfile = () =>
  apiDelete<{ ok: true }>("/go-together/profile");

export const getGoTogetherGroup = (groupId: string) =>
  apiGet<GoTogetherGroupDTO>(`/go-together/groups/${groupId}`);
export const checkInGoTogether = (groupId: string, status: "here" | "left") =>
  apiPost<GoTogetherGroupDTO>(`/go-together/groups/${groupId}/checkin`, {
    status,
  });
export const leaveGoTogetherGroup = (groupId: string) =>
  apiPost<void>(`/go-together/groups/${groupId}/leave`);
export const acceptGoTogetherMerge = (groupId: string) =>
  apiPost<GoTogetherGroupDTO>(`/go-together/groups/${groupId}/merge/accept`);
export const getGoTogetherFeedback = (groupId: string) =>
  apiGet<GoTogetherFeedbackDTO>(`/go-together/groups/${groupId}/feedback`);
export const saveGoTogetherFeedback = (groupId: string, body: FeedbackBody) =>
  apiPut<GoTogetherFeedbackDTO>(
    `/go-together/groups/${groupId}/feedback`,
    body,
  );

export const getGoTogetherHostConfig = (slug: string) =>
  apiGet<HostConfigDTO>(`/events/${slug}/go-together/config`);
export const saveGoTogetherHostConfig = (slug: string, body: HostConfigBody) =>
  apiPut<HostConfigDTO>(`/events/${slug}/go-together/config`, body);
export const getGoTogetherHostSummary = (slug: string) =>
  apiGet<HostSummaryDTO>(`/events/${slug}/go-together/summary`);

const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set(GO_TOGETHER_ERROR_CODES);

/**
 * The typed `code` a Go together endpoint put on its error body, or null for
 * any other failure (a network drop, a 500, a code this client has not been
 * taught). Reads the parsed body off `ApiError.data` the same way
 * `isAttendanceWindowClosed` does: the code is the contract, and the prose
 * `message` is only a fallback for older clients.
 */
export function goTogetherErrorCode(
  error: unknown,
): GoTogetherErrorCode | null {
  if (!(error instanceof ApiError)) return null;
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  if (typeof code !== "string" || !KNOWN_ERROR_CODES.has(code)) return null;
  return code as GoTogetherErrorCode;
}
