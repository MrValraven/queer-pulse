/**
 * PLATFORM-LEVEL join requests: strangers with no account asking to join
 * QueerPulse itself (the mod/admin review queue). Do not confuse this hook
 * with `src/features/communities/api/useJoinRequests.ts`, which lists
 * COMMUNITY-LEVEL join requests, existing members asking to join one gated
 * community. Same name, same vocabulary (approve/decline), unrelated data:
 * this one reads `GET /join-requests`, the other `GET
 * /communities/:slug/join-requests`.
 */
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import { formatDate } from "../../../shared/lib/date";
import { initialsFromName } from "../../../shared/lib/initials";
import {
  getJoinRequests,
  type GetJoinRequestsOptions,
  type JoinRequestDTO,
} from "../../auth/api/joinRequest.api";
import { sourceLabelKey } from "../../auth/api/joinRequestSource";
import type { AvatarTone } from "../ui";

/** Presentation-normalized join request for the mod review queue. */
export interface JoinRequestView {
  id: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  /** How to reach the applicant — there's no account behind them yet. */
  email: string;
  /** Optional on the form; null when they left it blank. */
  city: string | null;
  /** The applicant's own words — why they want in. */
  message: string;
  /** The email of a member already here who can vouch for them, as a
   *  structured field the reviewer can match directly — null when they named
   *  nobody. */
  mutualMemberEmail: string | null;
  /** "18+ confirmed on 1 Jul 2026 · Terms v2.4" — the attestation record. */
  ageLine: string;
  /**
   * Friendly name of the CTA the applicant came through — e.g. "Homepage hero",
   * or "Opened the invite page directly" when no source was recorded. Always set.
   */
  sourceLabel: string;
  /** Pre-formatted "Applied 2 days ago". */
  appliedLine: string;
  /** Whole days since the request was submitted. */
  daysWaiting: number;
  /** Set once approved; the reviewer builds the invite link from it. */
  inviteCode: string | null;
  /** Lifecycle of that invite, so a history row can say whether the link it is
   *  offering still works. Null when no invite was minted. */
  inviteStatus: JoinRequestDTO["inviteStatus"];
  /** ISO timestamp the invite lapses, or null when it has no expiry. */
  inviteExpiresAt: string | null;
  /** ISO timestamp the request was submitted — the raw value, for a history
   *  row that wants an absolute date rather than `appliedLine`'s relative one. */
  createdAt: string;
  /** ISO timestamp of the decision, or null while the request is still open. */
  reviewedAt: string | null;
  /**
   * The id of the reviewer who DECIDED this request, or null while it is still
   * open. Kept beside `reviewedByName` because it is the stable half: the
   * quality-sample view groups and filters a reviewer's decisions on this, and
   * compares it with the signed-in reviewer to say "You".
   */
  reviewedBy: string | null;
  /**
   * That reviewer's display name, resolved by the backend. Absent while the
   * request is open, and absent once that reviewer has erased their account
   * (the id goes with them, so nothing can put the name back). Render the
   * fallback rather than an empty space.
   */
  reviewedByName?: string;
  /** The closed-set reason key a reviewer picked when declining. Null on every
   *  other status. Rendered through `declineReasonLabelKey`. */
  declineReason: string | null;
  /** Confidence-tiered triage flags, already localized labels — computed here
   *  so the card never has to know the raw flag keys. */
  flagLabels: string[];
  /** null when this is the applicant's first request on record. */
  priorDeclineLine: string | null;
  /** null when no reference was given, or it never resolved to a real member. */
  referenceLine: string | null;
  /** The resolved reference member's profile slug, for a link. Null when
   *  `referenceLine` is null, or when it resolved but has no slug. */
  referenceMemberSlug: string | null;
  /** The raw review status. The pending/waitlisted queues never needed this
   *  (they already know which queue they're rendering), but the quality-
   *  sampling page mixes approved and declined rows, so it has to display
   *  which is which. */
  status: JoinRequestDTO["status"];
  /** OPS-04. The reviewer holding this request, or null when nobody is. */
  assignedStaffId: string | null;
  /** Their display name; absent on an unclaimed request. */
  assignedStaffName?: string;
  /** ISO timestamp the request should have been answered by, or null when it
   *  carries no clock. Read through `queueClock.ts`, never compared inline. */
  dueAt: string | null;
}

const TONES: AvatarTone[] = ["coral", "jade", "violet", "amber", "plum"];

/** Stable tone from a string id (deterministic across renders). */
function toneFor(id: string): AvatarTone {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length]!;
}

/**
 * i18n note: this composes chrome sentences from data (a relative day count, the
 * attestation line) at render time, in both demo and live mode alike — so the
 * phrases themselves must be catalog keys, not baked English, exactly like the
 * gatherings `api/events.adapters.ts` precedent.
 */
function appliedLine(iso: string, t: TFunction): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return t("admin:members.verify.appliedRecently");
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return t("admin:members.verify.appliedToday");
  return t("admin:members.verify.appliedDaysAgo", { count: days });
}

/** The 18+ self-attestation as a line a reviewer can act on. */
function ageLine(dto: JoinRequestDTO, t: TFunction, locale: string): string {
  const attestedAt = new Date(dto.ageAttestedAt);
  if (Number.isNaN(attestedAt.getTime())) {
    return t("admin:members.verify.ageAttestedUnknown", {
      version: dto.termsVersion,
    });
  }
  return t("admin:members.verify.ageAttested", {
    date: formatDate(attestedAt, locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    version: dto.termsVersion,
  });
}

const FLAG_LABEL_KEYS: Record<string, string> = {
  disposable_email: "admin:members.verify.flags.disposableEmail",
  duplicate_message: "admin:members.verify.flags.duplicateMessage",
  source_burst: "admin:members.verify.flags.sourceBurst",
};

export function dtoToView(
  dto: JoinRequestDTO,
  t: TFunction,
  locale: string,
): JoinRequestView {
  const name = dto.name.trim() || t("admin:members.verify.unnamedApplicant");
  const createdAtMs = new Date(dto.createdAt).getTime();
  const daysWaiting = Number.isNaN(createdAtMs)
    ? 0
    : Math.max(0, Math.floor((Date.now() - createdAtMs) / 86_400_000));
  const flagLabels = dto.flags.map((flag) => t(FLAG_LABEL_KEYS[flag] ?? flag));
  const priorDeclineLine =
    dto.priorDeclineCount > 0
      ? t("admin:members.verify.priorDeclineCount", {
          count: dto.priorDeclineCount,
        })
      : null;
  const referenceLine = dto.referenceMemberName
    ? t("admin:members.verify.referenceResolved", {
        name: dto.referenceMemberName,
      })
    : dto.mutualMemberEmail
      ? t("admin:members.verify.referenceUnresolved", {
          email: dto.mutualMemberEmail,
        })
      : null;
  return {
    id: dto.id,
    name,
    initials: initialsFromName(name, "?"),
    tone: toneFor(dto.id),
    email: dto.email,
    city: dto.city,
    message: dto.message,
    mutualMemberEmail: dto.mutualMemberEmail,
    ageLine: ageLine(dto, t, locale),
    sourceLabel: t(sourceLabelKey(dto.source)),
    appliedLine: appliedLine(dto.createdAt, t),
    daysWaiting,
    inviteCode: dto.inviteCode,
    inviteStatus: dto.inviteStatus,
    inviteExpiresAt: dto.inviteExpiresAt,
    createdAt: dto.createdAt,
    reviewedAt: dto.reviewedAt,
    reviewedBy: dto.reviewedBy,
    ...(dto.reviewedByName ? { reviewedByName: dto.reviewedByName } : {}),
    declineReason: dto.declineReason,
    flagLabels,
    priorDeclineLine,
    referenceLine,
    referenceMemberSlug: dto.referenceMemberSlug,
    status: dto.status,
    assignedStaffId: dto.assignedStaffId ?? null,
    ...(dto.assignedStaffName
      ? { assignedStaffName: dto.assignedStaffName }
      : {}),
    dueAt: dto.dueAt ?? null,
  };
}

/**
 * Incoming platform join requests for the mod/admin review queue. Demo mode
 * returns the colocated mock queue; live mode calls GET /join-requests?status and
 * adapts each row. Works with no backend.
 *
 * `options` reaches the same `limit`/`sort` the backend list already accepts —
 * the waiting queue wants the oldest request first (fair triage), while the
 * decided history wants the newest decision first. Both are part of the query
 * key, so two callers asking for different orders never share a cache entry.
 * Demo mode honours them over the mock array so the two modes agree.
 */
export function useJoinRequests(
  status: JoinRequestDTO["status"] = "pending",
  options: GetJoinRequestsOptions = {},
) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { limit, sort, assignedTo } = options;
  return useQuery<JoinRequestView[]>({
    queryKey: [
      "join-requests",
      demoMode,
      status,
      limit,
      sort,
      assignedTo,
      language,
    ],
    queryFn: async () => {
      let rows: JoinRequestDTO[];
      if (demoMode) {
        const { JOIN_REQUESTS } = await import("./joinRequests.data");
        rows = JOIN_REQUESTS.filter((r) => r.status === status);
        // OPS-04's filter, applied over the fixture so demo mode agrees with
        // live. `me` is the signed-in demo user, matching what
        // `useQueueAssignment` writes when a demo claim is simulated.
        if (assignedTo === "unassigned") {
          rows = rows.filter((row) => row.assignedStaffId === null);
        } else if (assignedTo === "me") {
          const demoStaffId = user?.id ?? "demo-staff";
          rows = rows.filter((row) => row.assignedStaffId === demoStaffId);
        }
        if (sort) {
          const direction = sort === "newest" ? -1 : 1;
          rows = [...rows].sort(
            (first, second) =>
              direction *
              (new Date(first.createdAt).getTime() -
                new Date(second.createdAt).getTime()),
          );
        }
        if (limit != null) rows = rows.slice(0, limit);
      } else {
        rows = await getJoinRequests(status, options);
      }
      return rows.map((row) => dtoToView(row, t, language));
    },
  });
}
