import { ApiError } from "../../shared/api/client";
import { gatheringDetails, resolveGathering } from "../gatherings/data";
import {
  currentUserSlug,
  getMember,
  memberAvatar,
  memberName,
} from "../members/data/members";
import { QUESTIONNAIRE_VERSION } from "./goTogetherQuestionnaire.data";
import type {
  FeedbackBody,
  FriendMatchAnswers,
  FriendMatchProfileDTO,
  GoTogetherCardDTO,
  GoTogetherFeedbackDTO,
  GoTogetherGroupDTO,
  GoTogetherGroupMemberDTO,
  GroupClickAnswer,
  HostAnswersBody,
  HostConfigBody,
  HostConfigDTO,
  HostQuestion,
  HostSummaryDTO,
  Lens,
  MeetAgainVerdict,
  MemberRef,
  OptInBody,
  PairAnswersBody,
} from "./api/goTogether.types";
import type {
  GoTogetherMemberReportBody,
  GoTogetherMemberReportDTO,
} from "./api/goTogetherGroupSafety.api";

/**
 * The Go together demo registry. Demo mode never reaches the network, so the
 * hooks read these factories and the mutation hooks move `demoState` forward:
 * saving answers unlocks the opt-in, opting in leads to `waiting`, the demo
 * reveal forms the group (shown as `feedbackDue`, because the demo feedback
 * window opens at once), and withdrawing returns to `notOptedIn`. A demo
 * member can walk the questionnaire, the opt-in, the group reveal and the
 * feedback end to end. `demoCard` also honours `?goTogetherDemo=<value>` on
 * the URL, which pins the card to one of the states that write path can
 * never reach on its own (see `DemoCardStateOverride`), for a design/QA
 * walk of the full state set.
 *
 * Every date is relative to `DEMO_NOW`, anchored once at module load: the
 * other demo registries carry fixed dates that are already in the past, and
 * one anchor keeps each factory returning the same value for the session.
 */
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DEMO_NOW = Date.now();
/** Fallback anchor for a slug this registry doesn't carry a real date for
 *  (an arbitrary test slug, say). Every real demo gathering resolves through
 *  `demoEventStartMs` below instead. */
const DEMO_EVENT_START_MS = DEMO_NOW + 5 * DAY_MS;
const FEEDBACK_CLOSES_MS = DEMO_NOW + 7 * DAY_MS;

/** The demo gathering's own start when `slug` names one in `gatheringDetails`,
 *  so the cutoff, opt-in close and reveal times line up with a gathering
 *  that's actually dated in the future. `DEMO_EVENT_START_MS` is the
 *  fallback for a slug this registry doesn't know (final-wave finding N4:
 *  the reveal time used to be anchored to that fixed fallback regardless of
 *  which gathering it was shown on, and could land after the gathering's
 *  own, real date had already passed). */
function demoEventStartMs(slug: string): number {
  const startAt = gatheringDetails[slug]?.date;
  return startAt ? startAt.getTime() : DEMO_EVENT_START_MS;
}

/** The backend's defaults: cutoff 48h before the start, opt-in closes 6h
 *  before, and a host may pull the cutoff at most 7 days ahead. */
function demoDefaultCutoffMs(slug: string): number {
  return demoEventStartMs(slug) - 48 * HOUR_MS;
}
function demoOptInClosesMs(slug: string): number {
  return demoEventStartMs(slug) - 6 * HOUR_MS;
}
function demoEarliestCutoffMs(slug: string): number {
  return demoEventStartMs(slug) - 7 * DAY_MS;
}
/** The feedback window is open from the reveal on, so a demo member can
 *  reach the feedback step without waiting for the gathering to end. */
const IS_DEMO_FEEDBACK_OPEN = true;

/** The three demo members the viewer is grouped with. */
const DEMO_GROUP_MATE_SLUGS = ["sofia", "rui", "mariana"] as const;
const DEMO_GROUP_ID_PREFIX = "demo-go-together-";

interface DemoEntry {
  /** `closed` is demo-only: a block moved the viewer out once the late-group
   *  pass had run, which the backend leaves `unmatched` and the card reads
   *  as `closed`. */
  status: "waiting" | "grouped" | "closed";
  partnerSlug: string | null;
  pairStatus: "pending" | "accepted";
  lens: Lens | null;
}

interface DemoFeedback {
  verdicts: Record<string, MeetAgainVerdict>;
  clicked: GroupClickAnswer | null;
  goAgain: boolean;
}

interface DemoGoTogetherState {
  savedAnswers: FriendMatchAnswers | null;
  savedAt: string | null;
  entriesBySlug: Map<string, DemoEntry>;
  checkInByGroupId: Map<string, "here" | "left">;
  feedbackByGroupId: Map<string, DemoFeedback>;
  hostConfigBySlug: Map<string, HostConfigDTO>;
  /** Groups whose chat the viewer left after the start (leave or block):
   *  they stay in the group, and `hasLeftChat` reads true. */
  leftChatGroupIds: Set<string>;
  /** Groups a block moved the viewer out of: reading one answers 404 until
   *  the viewer is grouped again, like the backend. */
  movedOutGroupIds: Set<string>;
  /** Per gathering slug, the mates the viewer blocked. The demo never groups
   *  them with the viewer again. */
  blockedMateSlugsByEventSlug: Map<string, Set<string>>;
}

/** The session's demo Go together state. Module level, so it lives as long
 *  as the tab and resets on reload. */
export const demoState: DemoGoTogetherState = {
  savedAnswers: null,
  savedAt: null,
  entriesBySlug: new Map(),
  checkInByGroupId: new Map(),
  feedbackByGroupId: new Map(),
  hostConfigBySlug: new Map(),
  leftChatGroupIds: new Set(),
  movedOutGroupIds: new Set(),
  blockedMateSlugsByEventSlug: new Map(),
};

/** Back to a fresh session. Tests call it between cases. */
export function resetDemoGoTogetherState(): void {
  demoState.savedAnswers = null;
  demoState.savedAt = null;
  demoState.entriesBySlug.clear();
  demoState.checkInByGroupId.clear();
  demoState.feedbackByGroupId.clear();
  demoState.hostConfigBySlug.clear();
  demoState.leftChatGroupIds.clear();
  demoState.movedOutGroupIds.clear();
  demoState.blockedMateSlugsByEventSlug.clear();
  hasConsumedDemoCardStateOverride = false;
}

export function demoGroupIdFor(slug: string): string {
  return `${DEMO_GROUP_ID_PREFIX}${slug}`;
}

function slugFromDemoGroupId(groupId: string): string {
  return groupId.startsWith(DEMO_GROUP_ID_PREFIX)
    ? groupId.slice(DEMO_GROUP_ID_PREFIX.length)
    : groupId;
}

function isoAt(epochMs: number): string {
  return new Date(epochMs).toISOString();
}

function demoMemberRef(slug: string): MemberRef {
  const member = getMember(slug);
  return {
    slug,
    firstName: member?.first ?? memberName(slug),
    lastName: member?.last ?? "",
    pronouns: member?.pronouns ?? null,
    avatarUrl: memberAvatar(slug)?.photo ?? null,
  };
}

function demoCardState(slug: string): GoTogetherCardDTO["state"] {
  const entry = demoState.entriesBySlug.get(slug);
  // The backend rule: a grouped entry whose feedback window is open shows
  // `feedbackDue`, and `grouped` otherwise.
  if (entry?.status === "grouped")
    return IS_DEMO_FEEDBACK_OPEN ? "feedbackDue" : "grouped";
  if (entry?.status === "closed") return "closed";
  if (entry) return "waiting";
  return demoState.savedAnswers ? "notOptedIn" : "questionnaireNeeded";
}

/**
 * The natural demo registry only ever produces one entry per member, so it
 * can walk `questionnaireNeeded`, `notOptedIn`, `waiting` and `feedbackDue`
 * and nothing else: it has no way to seed an incoming pair invite nobody
 * sent through `demoOptIn`, a host who closed matching, or an account in an
 * ineligible standing (final-wave finding I5). A query param pins the card
 * straight to one of them without adding `demoState` machinery for states no
 * demo write path ever produces: `?goTogetherDemo=<value>` on the gathering
 * URL. Demo-only, and read only from `demoCard`, so it can never reach a
 * live response.
 *
 * The pin only lasts until the member actually acts on the card. Every demo
 * transition below that changes the card's own state calls
 * `consumeDemoCardStateOverride()` first, so the very next `demoCard` read
 * answers from real `demoState`, and the pin stops replaying the same state
 * forever (final-wave re-review NEW-8: Accept, Decline and "Stop looking for
 * a group" used to look like no-ops on a `?goTogetherDemo=` URL, because
 * every demo mutation ends by calling `demoCard` again).
 */
export type DemoCardStateOverride =
  | "pairInvite"
  | "pairInviteReceived"
  | "unmatched"
  | "closed"
  | "unavailable"
  | "ineligibleRestricted"
  | "ineligibleVerify"
  | "grouped"
  | "hostQuestionChanged";

const DEMO_CARD_STATE_OVERRIDE_PARAM = "goTogetherDemo";
const DEMO_CARD_STATE_OVERRIDE_VALUES: readonly DemoCardStateOverride[] = [
  "pairInvite",
  "pairInviteReceived",
  "unmatched",
  "closed",
  "unavailable",
  "ineligibleRestricted",
  "ineligibleVerify",
  "grouped",
  "hostQuestionChanged",
];

/** The host question a `hostQuestionChanged` walk asks again, written the
 *  way a host would. */
const DEMO_CHANGED_HOST_QUESTION: HostQuestion = {
  id: "q1",
  prompt: "After the gathering: dancing or a quiet drink?",
  options: [
    { id: "q1o1", label: "Dancing" },
    { id: "q1o2", label: "A quiet drink" },
  ],
};

/** Set by `consumeDemoCardStateOverride` the first time a demo action
 *  changes the card, so the pin stops answering every read after that.
 *  Module level like `demoState`, and reset alongside it. */
let hasConsumedDemoCardStateOverride = false;

function readDemoCardStateOverride(): DemoCardStateOverride | null {
  if (hasConsumedDemoCardStateOverride) return null;
  if (typeof window === "undefined") return null;
  const rawValue = new URLSearchParams(window.location.search).get(
    DEMO_CARD_STATE_OVERRIDE_PARAM,
  );
  const values: readonly string[] = DEMO_CARD_STATE_OVERRIDE_VALUES;
  return rawValue && values.includes(rawValue)
    ? (rawValue as DemoCardStateOverride)
    : null;
}

/** Called by every demo transition that changes the card's own state
 *  (opt in, withdraw, accept or decline a pair, the demo reveal), so a
 *  `?goTogetherDemo=` walk-through link pins the FIRST read only: once the
 *  member has actually acted, the card answers from real `demoState` from
 *  then on, same as a demo session with no override at all. */
function consumeDemoCardStateOverride(): void {
  hasConsumedDemoCardStateOverride = true;
}

/** A synthetic card for one of the states the natural registry can't reach,
 *  built on the same base shape `demoCard` would otherwise return. */
function demoCardWithOverride(
  slug: string,
  override: DemoCardStateOverride,
): GoTogetherCardDTO {
  const base: GoTogetherCardDTO = {
    state: "notOptedIn",
    ineligibleReason: null,
    cutoffAt: isoAt(demoDefaultCutoffMs(slug)),
    optInClosesAt: isoAt(demoOptInClosesMs(slug)),
    hostQuestions: [],
    pair: null,
    lens: null,
    groupId: null,
    profile: { exists: demoState.savedAnswers !== null, needsRefresh: false },
    unansweredHostQuestionIds: [],
  };
  const invitingFriend = demoMemberRef(DEMO_GROUP_MATE_SLUGS[0]);
  switch (override) {
    case "pairInvite":
      // This top-level `pairInvite` card state is always the invitee's own
      // view of an invite nobody has answered yet (final-wave re-review
      // NEW-7), so `direction` reads "received" here, same as the crossing
      // invite `pairInviteReceived` seeds below.
      return {
        ...base,
        state: "pairInvite",
        pair: {
          partner: invitingFriend,
          status: "pending",
          direction: "received",
        },
      };
    case "pairInviteReceived":
      // The invitee's side of a crossing pair invite (frontend review C1):
      // already waiting solo, then a friend names them, so the card offers
      // Accept/Decline for the invite they received.
      return {
        ...base,
        state: "waiting",
        pair: {
          partner: invitingFriend,
          status: "pending",
          direction: "received",
        },
      };
    case "unmatched":
      return { ...base, state: "unmatched" };
    case "closed":
      return { ...base, state: "closed" };
    case "unavailable":
      return { ...base, state: "unavailable" };
    case "ineligibleRestricted":
      return { ...base, state: "ineligible", ineligibleReason: "restricted" };
    case "ineligibleVerify":
      return { ...base, state: "ineligible", ineligibleReason: "notVerified" };
    case "grouped":
      return { ...base, state: "grouped", groupId: demoGroupIdFor(slug) };
    case "hostQuestionChanged":
      // A waiting member whose answer the host's edit cleared, so the card
      // asks that one question again.
      return {
        ...base,
        state: "waiting",
        hostQuestions: [DEMO_CHANGED_HOST_QUESTION],
        unansweredHostQuestionIds: [DEMO_CHANGED_HOST_QUESTION.id],
      };
  }
}

export function demoCard(slug: string): GoTogetherCardDTO {
  const override = readDemoCardStateOverride();
  if (override) return demoCardWithOverride(slug, override);

  const entry = demoState.entriesBySlug.get(slug);
  const hostConfig = demoState.hostConfigBySlug.get(slug);
  const isGrouped = entry?.status === "grouped";
  return {
    state: demoCardState(slug),
    ineligibleReason: null,
    cutoffAt: hostConfig?.cutoffAt ?? isoAt(demoDefaultCutoffMs(slug)),
    optInClosesAt: isoAt(demoOptInClosesMs(slug)),
    hostQuestions: hostConfig?.hostQuestions ?? [],
    pair: entry?.partnerSlug
      ? {
          partner: demoMemberRef(entry.partnerSlug),
          status: entry.pairStatus,
          direction: "sent",
        }
      : null,
    lens: entry?.lens ?? null,
    groupId: isGrouped ? demoGroupIdFor(slug) : null,
    profile: { exists: demoState.savedAnswers !== null, needsRefresh: false },
    unansweredHostQuestionIds: [],
  };
}

export function demoProfile(): FriendMatchProfileDTO {
  const hasAnswers = demoState.savedAnswers !== null;
  return {
    answers: demoState.savedAnswers,
    questionnaireVersion: hasAnswers ? QUESTIONNAIRE_VERSION : null,
    currentVersion: QUESTIONNAIRE_VERSION,
    needsRefresh: false,
    refreshSuggested: false,
    consentedAt: demoState.savedAt,
    updatedAt: demoState.savedAt,
  };
}

/** The viewer's group mates, the pair partner first when there is one. */
function demoGroupMateSlugs(slug: string): string[] {
  const blockedSlugs = demoState.blockedMateSlugsByEventSlug.get(slug);
  const isVisibleMate = (mateSlug: string) => !blockedSlugs?.has(mateSlug);
  const partnerSlug = demoState.entriesBySlug.get(slug)?.partnerSlug ?? null;
  if (!partnerSlug || !isVisibleMate(partnerSlug)) {
    return DEMO_GROUP_MATE_SLUGS.filter(isVisibleMate);
  }
  const others = DEMO_GROUP_MATE_SLUGS.filter(
    (mateSlug) => mateSlug !== partnerSlug && isVisibleMate(mateSlug),
  );
  return [partnerSlug, ...others].slice(0, DEMO_GROUP_MATE_SLUGS.length);
}

const DEMO_MEMBER_REF_PREFIX = "demo-member-";

/** The demo's stand-in for the backend's opaque member ref. */
function demoMemberRefFor(slug: string): string {
  return `${DEMO_MEMBER_REF_PREFIX}${slug}`;
}

function slugFromDemoMemberRef(memberRef: string): string {
  return memberRef.startsWith(DEMO_MEMBER_REF_PREFIX)
    ? memberRef.slice(DEMO_MEMBER_REF_PREFIX.length)
    : memberRef;
}

/** From the gathering's start, Leave ends only the chat seat. */
function isDemoLeaveChatOnly(eventSlug: string): boolean {
  return Date.now() >= demoEventStartMs(eventSlug);
}

function demoGroupMember(
  slug: string,
  flags: Pick<GoTogetherGroupMemberDTO, "isYou" | "isPairPartner" | "isHere">,
): GoTogetherGroupMemberDTO {
  const reference = demoMemberRef(slug);
  return {
    memberRef: demoMemberRefFor(slug),
    firstName: reference.firstName,
    pronouns: reference.pronouns,
    avatarUrl: reference.avatarUrl,
    ...flags,
    hasLeftEvent: false,
  };
}

export function demoGroup(groupId: string): GoTogetherGroupDTO {
  const eventSlug = slugFromDemoGroupId(groupId);
  if (
    demoState.movedOutGroupIds.has(groupId) &&
    demoState.entriesBySlug.get(eventSlug)?.status !== "grouped"
  ) {
    throw new ApiError(404, "You are not in this group", {});
  }
  const partnerSlug =
    demoState.entriesBySlug.get(eventSlug)?.partnerSlug ?? null;
  const checkInStatus = demoState.checkInByGroupId.get(groupId) ?? null;
  const isHere = checkInStatus === "here";
  const hasLeftEvent = checkInStatus === "left";
  const mateSlugs = demoGroupMateSlugs(eventSlug);
  const members = [
    {
      ...demoGroupMember(currentUserSlug, {
        isYou: true,
        isPairPartner: false,
        isHere,
      }),
      hasLeftEvent,
    },
    ...mateSlugs.map((mateSlug, index) =>
      demoGroupMember(mateSlug, {
        isYou: false,
        isPairPartner: mateSlug === partnerSlug,
        isHere: index === 0,
      }),
    ),
  ];
  return {
    id: groupId,
    event: {
      id: `demo-event-${eventSlug}`,
      slug: eventSlug,
      // A plain slug is a key of `gatheringDetails`; `resolveGathering` only
      // understands the `<slug>-<shortId>` route param.
      title:
        gatheringDetails[eventSlug]?.title ?? resolveGathering(eventSlug).title,
      startAt: isoAt(demoEventStartMs(eventSlug)),
      endAt: isoAt(demoEventStartMs(eventSlug) + 4 * HOUR_MS),
    },
    band: "strong",
    reasons: [
      {
        kind: "interests",
        tagIds: ["queerHistory", "boardGames"],
        count: 3,
        total: members.length,
      },
      { kind: "energy", level: "calm" },
      { kind: "area", areaId: "Arroios", count: 2, total: members.length },
    ],
    meetingPointNote:
      demoState.hostConfigBySlug.get(eventSlug)?.meetingPointNote ?? null,
    conversationId: null,
    isDissolved: false,
    members,
    mergeOffer: null,
    isLeaveChatOnly: isDemoLeaveChatOnly(eventSlug),
    hasLeftChat: demoState.leftChatGroupIds.has(groupId),
    checkIn: { isOpen: true, isHere, hasLeftEvent },
    feedback: {
      isOpen: IS_DEMO_FEEDBACK_OPEN,
      closesAt: isoAt(FEEDBACK_CLOSES_MS),
      hasAnswered: demoState.feedbackByGroupId.has(groupId),
    },
  };
}

export function demoFeedback(groupId: string): GoTogetherFeedbackDTO {
  const saved = demoState.feedbackByGroupId.get(groupId);
  const mateSlugs = demoGroupMateSlugs(slugFromDemoGroupId(groupId));
  return {
    groupId,
    isOpen: IS_DEMO_FEEDBACK_OPEN,
    closesAt: isoAt(FEEDBACK_CLOSES_MS),
    members: mateSlugs.map((mateSlug) => {
      const reference = demoMemberRef(mateSlug);
      return {
        slug: mateSlug,
        firstName: reference.firstName,
        pronouns: reference.pronouns,
        avatarUrl: reference.avatarUrl,
        verdict: saved?.verdicts[mateSlug] ?? null,
      };
    }),
    clicked: saved?.clicked ?? null,
    goAgain: saved?.goAgain ?? false,
  };
}

export function demoHostConfig(slug: string): HostConfigDTO {
  return (
    demoState.hostConfigBySlug.get(slug) ?? {
      enabled: false,
      cutoffAt: isoAt(demoDefaultCutoffMs(slug)),
      earliestCutoffAt: isoAt(demoEarliestCutoffMs(slug)),
      latestCutoffAt: isoAt(demoOptInClosesMs(slug)),
      hostQuestions: [],
      meetingPointNote: null,
      isLocked: false,
    }
  );
}

export function demoHostSummary(): HostSummaryDTO {
  return { waiting: 7, grouped: 8, unmatched: 1, groups: 2 };
}

/* ------------------------------------------------------------------ */
/* Demo transitions: what the mutation hooks call in demo mode. */
/* ------------------------------------------------------------------ */

export function demoSaveProfile(
  answers: FriendMatchAnswers,
): FriendMatchProfileDTO {
  demoState.savedAnswers = answers;
  demoState.savedAt = new Date().toISOString();
  return demoProfile();
}

/** Withdrawing consent deletes the answers and leaves every waiting match,
 *  like the backend's `deleteMine`. A formed group stays. */
export function demoDeleteProfile(): { ok: true } {
  demoState.savedAnswers = null;
  demoState.savedAt = null;
  for (const [slug, entry] of demoState.entriesBySlug) {
    if (entry.status === "waiting") demoState.entriesBySlug.delete(slug);
  }
  return { ok: true };
}

/** Opting in without saved answers fails the way the backend does, with the
 *  same typed code, so the card's error handling runs in demo too. */
export function demoOptIn(slug: string, body: OptInBody): GoTogetherCardDTO {
  if (!demoState.savedAnswers) {
    throw new ApiError(409, "Answer the questionnaire first", {
      code: "GO_TOGETHER_PROFILE_NEEDED",
    });
  }
  consumeDemoCardStateOverride();
  const partnerSlug = body.mode === "pair" ? (body.partnerSlug ?? null) : null;
  demoState.entriesBySlug.set(slug, {
    status: "waiting",
    partnerSlug,
    pairStatus: "pending",
    lens: body.lens,
  });
  return demoCard(slug);
}

export function demoWithdraw(slug: string): GoTogetherCardDTO {
  consumeDemoCardStateOverride();
  demoState.entriesBySlug.delete(slug);
  return demoCard(slug);
}

export function demoAcceptPair(
  slug: string,
  body: PairAnswersBody,
): GoTogetherCardDTO {
  consumeDemoCardStateOverride();
  const existing = demoState.entriesBySlug.get(slug);
  demoState.entriesBySlug.set(slug, {
    status: "waiting",
    partnerSlug: existing?.partnerSlug ?? null,
    pairStatus: "accepted",
    lens: body.lens,
  });
  return demoCard(slug);
}

export function demoDeclinePair(slug: string): GoTogetherCardDTO {
  consumeDemoCardStateOverride();
  demoState.entriesBySlug.delete(slug);
  return demoCard(slug);
}

/** Answering the host questions the card asked again. A blank answer fails
 *  with the backend's typed code; otherwise the member keeps waiting, with
 *  nothing left to answer. */
export function demoAnswerHostQuestions(
  slug: string,
  body: HostAnswersBody,
): GoTogetherCardDTO {
  const answers = Object.values(body.hostAnswers);
  if (answers.length === 0 || answers.some((optionId) => !optionId)) {
    throw new ApiError(400, "Answer every question", {
      code: "GO_TOGETHER_INVALID_ANSWERS",
    });
  }
  consumeDemoCardStateOverride();
  if (!demoState.entriesBySlug.has(slug)) {
    demoState.entriesBySlug.set(slug, {
      status: "waiting",
      partnerSlug: null,
      pairStatus: "pending",
      lens: null,
    });
  }
  return demoCard(slug);
}

/** The demo-only reveal: a waiting entry becomes grouped. */
export function demoRevealGroup(slug: string): GoTogetherCardDTO {
  consumeDemoCardStateOverride();
  const entry = demoState.entriesBySlug.get(slug);
  if (entry) demoState.entriesBySlug.set(slug, { ...entry, status: "grouped" });
  return demoCard(slug);
}

export function demoCheckIn(
  groupId: string,
  status: "here" | "left",
): GoTogetherGroupDTO {
  demoState.checkInByGroupId.set(groupId, status);
  return demoGroup(groupId);
}

/** Before the start, leaving takes the viewer out of the group. From the
 *  start it ends only the chat seat, like the backend's `leaveGroup`. */
export function demoLeaveGroup(groupId: string): void {
  const eventSlug = slugFromDemoGroupId(groupId);
  if (isDemoLeaveChatOnly(eventSlug)) {
    demoState.leftChatGroupIds.add(groupId);
    return;
  }
  consumeDemoCardStateOverride();
  demoState.entriesBySlug.delete(eventSlug);
  demoState.checkInByGroupId.delete(groupId);
}

/** How long after the start a block still moves the blocker, like the
 *  backend's `moveAfterBlock`. */
const DEMO_BLOCK_MOVE_WINDOW_MS = 12 * HOUR_MS;

function demoGroupMateSlugFor(groupId: string, memberRef: string): string {
  const mateSlug = slugFromDemoMemberRef(memberRef);
  if (mateSlug === currentUserSlug) {
    throw new ApiError(400, "That is your own row", {});
  }
  if (!demoGroupMateSlugs(slugFromDemoGroupId(groupId)).includes(mateSlug)) {
    throw new ApiError(404, "No such member in this group", {});
  }
  return mateSlug;
}

/**
 * The demo block. The blocked member stays and the viewer moves. Before the
 * late-group pass (6 hours before the start) they go back to waiting, since
 * the demo has no second group to move to. After it the backend leaves them
 * unmatched, which the card reads as closed, and from the start they also
 * leave the chat. More than 12 hours after the start nobody moves. The two
 * never share a demo group again.
 */
export function demoBlockGroupMember(groupId: string, memberRef: string): void {
  const eventSlug = slugFromDemoGroupId(groupId);
  const blockedSlug = demoGroupMateSlugFor(groupId, memberRef);
  const blockedSlugs =
    demoState.blockedMateSlugsByEventSlug.get(eventSlug) ?? new Set<string>();
  blockedSlugs.add(blockedSlug);
  demoState.blockedMateSlugsByEventSlug.set(eventSlug, blockedSlugs);

  const startMs = demoEventStartMs(eventSlug);
  const nowMs = Date.now();
  if (nowMs > startMs + DEMO_BLOCK_MOVE_WINDOW_MS) return;
  // The card changes from here on, so a `?goTogetherDemo=grouped` pin stops
  // answering: the card then reads the entry written below.
  consumeDemoCardStateOverride();
  const entry = demoState.entriesBySlug.get(eventSlug);
  const partnerSlug =
    entry?.partnerSlug === blockedSlug ? null : (entry?.partnerSlug ?? null);
  const isPastLatePass = nowMs >= demoOptInClosesMs(eventSlug);
  demoState.entriesBySlug.set(eventSlug, {
    status: isPastLatePass ? "closed" : "waiting",
    partnerSlug: isPastLatePass ? null : partnerSlug,
    pairStatus: entry?.pairStatus ?? "pending",
    lens: entry?.lens ?? null,
  });
  if (nowMs >= startMs) demoState.leftChatGroupIds.add(groupId);
  demoState.checkInByGroupId.delete(groupId);
  demoState.movedOutGroupIds.add(groupId);
}

/** The demo report: checked like the backend's route, then acknowledged
 *  locally. Nothing leaves the device. */
export function demoReportGroupMember(
  groupId: string,
  memberRef: string,
  body: GoTogetherMemberReportBody,
): GoTogetherMemberReportDTO {
  demoGroupMateSlugFor(groupId, memberRef);
  return {
    id: `demo-go-together-report-${Date.now()}`,
    subjectType: "member",
    reasonCode: body.reasonCode,
    severity: "medium",
    status: "open",
    createdAt: new Date().toISOString(),
    acknowledgement: "Report received. A moderator is on it.",
  };
}

export function demoAcceptMerge(groupId: string): GoTogetherGroupDTO {
  return demoGroup(groupId);
}

export function demoSaveFeedback(
  groupId: string,
  body: FeedbackBody,
): GoTogetherFeedbackDTO {
  const saved = demoState.feedbackByGroupId.get(groupId);
  demoState.feedbackByGroupId.set(groupId, {
    verdicts: { ...saved?.verdicts, ...body.verdicts },
    clicked: body.clicked ?? saved?.clicked ?? null,
    goAgain: body.goAgain ?? saved?.goAgain ?? false,
  });
  return demoFeedback(groupId);
}

export function demoSaveHostConfig(
  slug: string,
  body: HostConfigBody,
): HostConfigDTO {
  const current = demoHostConfig(slug);
  const saved: HostConfigDTO = {
    ...current,
    enabled: body.enabled,
    cutoffAt: body.cutoffAt ?? current.cutoffAt,
    hostQuestions: body.hostQuestions.map((question, questionIndex) => ({
      id: `q${questionIndex + 1}`,
      prompt: question.prompt,
      options: question.options.map((label, optionIndex) => ({
        id: `q${questionIndex + 1}o${optionIndex + 1}`,
        label,
      })),
    })),
    meetingPointNote: body.meetingPointNote,
  };
  demoState.hostConfigBySlug.set(slug, saved);
  return saved;
}
