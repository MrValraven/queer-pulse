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
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import { formatDate } from "../../../shared/lib/date";
import { initialsFromName } from "../../../shared/lib/initials";
import {
  getJoinRequests,
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
    flagLabels,
    priorDeclineLine,
    referenceLine,
    referenceMemberSlug: dto.referenceMemberSlug,
    status: dto.status,
  };
}

/**
 * Incoming platform join requests for the mod/admin review queue. Demo mode
 * returns the colocated mock queue; live mode calls GET /join-requests?status and
 * adapts each row. Works with no backend.
 */
export function useJoinRequests(status: JoinRequestDTO["status"] = "pending") {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  return useQuery<JoinRequestView[]>({
    queryKey: ["join-requests", demoMode, status, language],
    queryFn: async () => {
      let rows: JoinRequestDTO[];
      if (demoMode) {
        const { JOIN_REQUESTS } = await import("./joinRequests.data");
        rows = JOIN_REQUESTS.filter((r) => r.status === status);
      } else {
        rows = await getJoinRequests(status);
      }
      return rows.map((row) => dtoToView(row, t, language));
    },
  });
}
