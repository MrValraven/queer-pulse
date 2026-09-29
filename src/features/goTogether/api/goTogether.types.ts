import type {
  FriendMatchAnswers,
  HostAnswers,
  HostQuestion,
  Lens,
} from "../goTogetherQuestionnaire.data";

/**
 * Wire shapes for Go together, restated by hand from the backend's
 * `go-together-response.ts`, `go-together-group-response.ts`,
 * `go-together-reasons.ts` and the profile service's response. The two sides
 * share no package, so a field renamed there has to be renamed here too.
 */
export type { FriendMatchAnswers, HostAnswers, HostQuestion, Lens };

/** Compact view of a member, the backend's `common/member-ref.ts`. */
export interface MemberRef {
  slug: string;
  firstName: string;
  lastName: string;
  pronouns: string | null;
  avatarUrl: string | null;
}

export type CardState =
  | "unavailable"
  | "ineligible"
  | "pairInvite"
  | "notOptedIn"
  | "questionnaireNeeded"
  | "waiting"
  | "grouped"
  | "unmatched"
  | "feedbackDue"
  | "closed";

export type MemberBlocker =
  "inactive" | "restricted" | "bannedFromEvent" | "notGoing" | "notVerified";

export interface GoTogetherPairDTO {
  partner: MemberRef;
  status: "pending" | "accepted";
  direction: "sent" | "received";
}

export interface GoTogetherCardDTO {
  state: CardState;
  ineligibleReason: MemberBlocker | null;
  cutoffAt: string | null;
  optInClosesAt: string;
  hostQuestions: HostQuestion[];
  pair: GoTogetherPairDTO | null;
  lens: Lens | null;
  groupId: string | null;
  profile: { exists: boolean; needsRefresh: boolean };
  /** Ids from `hostQuestions` a waiting member has to answer again, because
   *  the host changed, added or removed a question after they opted in.
   *  Always empty unless `state` is `waiting`. */
  unansweredHostQuestionIds: string[];
}

export interface FriendMatchProfileDTO {
  answers: FriendMatchAnswers | null;
  questionnaireVersion: number | null;
  currentVersion: number;
  needsRefresh: boolean;
  refreshSuggested: boolean;
  consentedAt: string | null;
  updatedAt: string | null;
}

export interface HostConfigDTO {
  enabled: boolean;
  cutoffAt: string;
  earliestCutoffAt: string;
  latestCutoffAt: string;
  hostQuestions: HostQuestion[];
  meetingPointNote: string | null;
  /** True once matching has run; the settings can no longer change. */
  isLocked: boolean;
}

export interface HostSummaryDTO {
  waiting: number;
  grouped: number;
  unmatched: number;
  groups: number;
}

export type GroupBand = "strong" | "good";

/** A "why you were grouped" line. Only interests, music, the calm to dancing
 *  energy slider, area and host questions ever appear here. */
export type GroupReason =
  | { kind: "interests"; tagIds: string[]; count: number; total: number }
  | { kind: "music"; tagIds: string[]; count: number; total: number }
  | { kind: "energy"; level: "calm" | "balanced" | "lively" }
  | { kind: "area"; areaId: string; count: number; total: number }
  | {
      kind: "hostQuestion";
      questionId: string;
      optionId: string;
      prompt: string;
      optionLabel: string;
    };

export type MeetAgainVerdict = "yes" | "maybe" | "no";
export type GroupClickAnswer = "yes" | "somewhat" | "no";

/** First name and pronouns only; the avatar follows the member's own photo
 *  setting and is null when they hide it. `memberRef` is an opaque id that
 *  only the group's block and report routes accept: it opens no profile. */
export interface GoTogetherGroupMemberDTO {
  memberRef: string;
  firstName: string;
  pronouns: string | null;
  avatarUrl: string | null;
  isYou: boolean;
  isPairPartner: boolean;
  isHere: boolean;
  hasLeftEvent: boolean;
}

export interface GoTogetherGroupDTO {
  id: string;
  event: {
    id: string;
    slug: string;
    title: string;
    startAt: string;
    endAt: string | null;
  };
  band: GroupBand;
  reasons: GroupReason[];
  meetingPointNote: string | null;
  conversationId: string | null;
  isDissolved: boolean;
  members: GoTogetherGroupMemberDTO[];
  mergeOffer: { groupId: string } | null;
  /** True from the gathering's start: Leave then ends only the chat seat,
   *  and the member stays in the group, on meet-again and keeps their
   *  reveal. */
  isLeaveChatOnly: boolean;
  /** True once the caller holds no seat in the group's chat: Open chat and
   *  Leave chat hide. */
  hasLeftChat: boolean;
  checkIn: { isOpen: boolean; isHere: boolean; hasLeftEvent: boolean };
  feedback: { isOpen: boolean; closesAt: string | null; hasAnswered: boolean };
}

export interface GoTogetherFeedbackMemberDTO {
  slug: string;
  firstName: string;
  pronouns: string | null;
  avatarUrl: string | null;
  verdict: MeetAgainVerdict | null;
}

export interface GoTogetherFeedbackDTO {
  groupId: string;
  isOpen: boolean;
  closesAt: string | null;
  members: GoTogetherFeedbackMemberDTO[];
  clicked: GroupClickAnswer | null;
  goAgain: boolean;
}

/** Every `code` a Go together endpoint puts on an error body. */
export const GO_TOGETHER_ERROR_CODES = [
  "GO_TOGETHER_UNAVAILABLE",
  "GO_TOGETHER_INELIGIBLE",
  "GO_TOGETHER_PROFILE_NEEDED",
  "GO_TOGETHER_INVALID_ANSWERS",
  "GO_TOGETHER_INVALID_QUESTIONS",
  "GO_TOGETHER_INVALID_FEEDBACK",
  "GO_TOGETHER_LENS_CONSENT_REQUIRED",
  "GO_TOGETHER_ALREADY_GROUPED",
  "GO_TOGETHER_PARTNER_UNAVAILABLE",
  "GO_TOGETHER_LENS_MISMATCH",
  "GO_TOGETHER_LOCKED",
  "GO_TOGETHER_BAD_CUTOFF",
  "GO_TOGETHER_CONSENT_REQUIRED",
  "GO_TOGETHER_CHECKIN_CLOSED",
  "GO_TOGETHER_FEEDBACK_CLOSED",
  "GO_TOGETHER_MERGE_EXPIRED",
  "GO_TOGETHER_NOT_WAITING",
  "MATCHED_GROUP_LOCKED",
] as const;
export type GoTogetherErrorCode = (typeof GO_TOGETHER_ERROR_CODES)[number];

export interface OptInBody {
  mode: "solo" | "pair";
  partnerSlug?: string;
  hostAnswers: HostAnswers;
  lens: Lens | null;
  lensConsent: boolean;
}
export type PairAnswersBody = Omit<OptInBody, "mode" | "partnerSlug">;
/** `PUT .../host-answers`: only the questions the card asks again. */
export type HostAnswersBody = Pick<OptInBody, "hostAnswers">;
export interface HostConfigBody {
  enabled: boolean;
  cutoffAt?: string;
  hostQuestions: { prompt: string; options: string[] }[];
  meetingPointNote: string | null;
}
export interface FeedbackBody {
  verdicts?: Record<string, MeetAgainVerdict>;
  clicked?: GroupClickAnswer;
  goAgain?: boolean;
}
