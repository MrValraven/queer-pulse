import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import {
  getJoinRequests,
  type JoinRequestDTO,
} from "../../auth/api/joinRequest.api";
import { JOIN_REQUESTS } from "./joinRequests.data";
import type { AvatarTone } from "../ui";

/** Presentation-normalized join request for the mod review queue. */
export interface JoinRequestView {
  id: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  /** The applicant's own words — why they want in. */
  message: string;
  /** "Named Inês Martins as a mutual" line, or the no-mutual fallback. */
  mutualLine: string;
  /** Pre-formatted "Applied 2 days ago". */
  appliedLine: string;
}

const TONES: AvatarTone[] = ["coral", "jade", "violet", "amber", "plum"];

function initialsOf(first: string, last: string): string {
  return `${(first[0] ?? "").toUpperCase()}${(last[0] ?? "").toUpperCase()}`;
}

/** Stable tone from a string id (deterministic across renders). */
function toneFor(id: string): AvatarTone {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length]!;
}

/**
 * i18n note: this composes chrome sentences from data (a mutual's name, a
 * relative day count) at render time, in both demo and live mode alike — so
 * the phrases themselves must be catalog keys, not baked English, exactly
 * like the gatherings `api/events.adapters.ts` precedent.
 */
function appliedLine(iso: string, t: TFunction): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return t("admin:members.verify.appliedRecently");
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return t("admin:members.verify.appliedToday");
  return t("admin:members.verify.appliedDaysAgo", { count: days });
}

function dtoToView(dto: JoinRequestDTO, t: TFunction): JoinRequestView {
  const a = dto.applicant;
  const first = a?.firstName ?? "New";
  const last = a?.lastName ?? "applicant";
  return {
    id: dto.id,
    name: `${first} ${last}`.trim(),
    initials: initialsOf(first, last) || "?",
    tone: toneFor(dto.id),
    message: dto.message,
    mutualLine: a?.mutual
      ? t("admin:members.verify.mutualLine", { name: a.mutual })
      : t("admin:members.verify.noMutual"),
    appliedLine: appliedLine(dto.createdAt, t),
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
      const rows = demoMode
        ? JOIN_REQUESTS.filter((r) => r.status === status)
        : await getJoinRequests(status);
      return rows.map((row) => dtoToView(row, t));
    },
  });
}
