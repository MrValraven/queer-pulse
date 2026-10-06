import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { FeedReason } from "./api/feed.api";

// ── "New member" card helpers ────────────────────────────────────────────────
// Pure functions shared by the member cards: the one context line
// that answers "why should I care about this person", and the compact joined
// time. No React here, so both stay testable with a fixed clock.

/** The single strongest reason this member is worth a look, in priority
 *  order. Each card shows exactly one. */
export type MemberContext =
  | { kind: "connected" }
  | { kind: "sharedCommunity"; community: string }
  | { kind: "mutualConnections"; count: number }
  | { kind: "sharedInterest"; interest: string }
  | { kind: "sharedTopic"; topic: string }
  | { kind: "newcomer" };

export interface MemberContextInput {
  reason?: FeedReason;
  reasonSubject?: string | null;
  mutualConnectionCount?: number;
  /** The member's interests the viewer also lists, in the member's order;
   *  the first one names the line. */
  sharedInterests?: string[];
  isConnected: boolean;
}

/**
 * Pick the context line. An existing connection outranks everything (it is
 * the closest tie there is), then a community the viewer is in, then people
 * they both know, then an interest they both list, then a followed topic.
 * With none of those the member is simply new, which is still worth saying.
 *
 * "Connected" reads `isConnected` alone, the same connection store that
 * picks the card's button, so the line and the button always agree. A feed
 * `reason` of "connection" falls through to the other lines.
 */
export function resolveMemberContext(input: MemberContextInput): MemberContext {
  const {
    reason,
    reasonSubject,
    mutualConnectionCount,
    sharedInterests,
    isConnected,
  } = input;
  if (isConnected) return { kind: "connected" };
  if (reason === "membership" && reasonSubject) {
    return { kind: "sharedCommunity", community: reasonSubject };
  }
  if (mutualConnectionCount !== undefined && mutualConnectionCount > 0) {
    return { kind: "mutualConnections", count: mutualConnectionCount };
  }
  const firstSharedInterest = sharedInterests?.[0];
  if (firstSharedInterest) {
    return { kind: "sharedInterest", interest: firstSharedInterest };
  }
  if (reason === "topic" && reasonSubject) {
    return { kind: "sharedTopic", topic: reasonSubject };
  }
  return { kind: "newcomer" };
}

/** The context line as copy, in the active language. */
export function memberContextLabel(
  context: MemberContext,
  t: TFunction,
): string {
  switch (context.kind) {
    case "connected":
      return t("feed:memberCard.context.connected");
    case "sharedCommunity":
      return t("feed:memberCard.context.sharedCommunity", {
        community: context.community,
      });
    case "mutualConnections":
      return t("feed:memberCard.context.mutualConnections", {
        count: context.count,
      });
    case "sharedInterest":
      return t("feed:memberCard.context.sharedInterest", {
        interest: context.interest,
      });
    case "sharedTopic":
      return t("feed:memberCard.context.sharedTopic", { topic: context.topic });
    case "newcomer":
      return t("feed:memberCard.context.newcomer");
  }
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/**
 * When the member joined, on one compact scale used by every card: "just
 * now" under an hour, whole hours under a day, whole days under a week, then
 * a short day and month from `Intl`. A timestamp slightly in the future (a
 * client clock running behind the server) reads as "just now". An
 * unparseable timestamp returns "" so the caller can drop the slot.
 */
export function compactJoinedTimeLabel(
  createdAtIso: string,
  t: TFunction,
  fmt: Formatters,
  now: number = Date.now(),
): string {
  const createdAt = new Date(createdAtIso).getTime();
  if (Number.isNaN(createdAt)) return "";
  const elapsedMs = now - createdAt;
  if (elapsedMs < HOUR_MS) return t("feed:memberCard.time.justNow");
  if (elapsedMs < DAY_MS) {
    return t("feed:memberCard.time.hours", {
      count: Math.floor(elapsedMs / HOUR_MS),
    });
  }
  if (elapsedMs < WEEK_MS) {
    return t("feed:memberCard.time.days", {
      count: Math.floor(elapsedMs / DAY_MS),
    });
  }
  return fmt.date(createdAt, { day: "numeric", month: "short" });
}
