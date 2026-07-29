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
  /** "18+ confirmed on 1 Jul 2026 · Terms v2.4" — the attestation record. */
  ageLine: string;
  /** Pre-formatted "Applied 2 days ago". */
  appliedLine: string;
  /** Set once approved; the reviewer builds the invite link from it. */
  inviteCode: string | null;
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

export function dtoToView(
  dto: JoinRequestDTO,
  t: TFunction,
  locale: string,
): JoinRequestView {
  const name = dto.name.trim() || t("admin:members.verify.unnamedApplicant");
  return {
    id: dto.id,
    name,
    initials: initialsFromName(name, "?"),
    tone: toneFor(dto.id),
    email: dto.email,
    city: dto.city,
    message: dto.message,
    ageLine: ageLine(dto, t, locale),
    appliedLine: appliedLine(dto.createdAt, t),
    inviteCode: dto.inviteCode,
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
