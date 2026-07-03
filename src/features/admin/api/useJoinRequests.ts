import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
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

function appliedLine(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Applied recently";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Applied today";
  if (days === 1) return "Applied 1 day ago";
  return `Applied ${days} days ago`;
}

function dtoToView(dto: JoinRequestDTO): JoinRequestView {
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
      ? `Named ${a.mutual} as a mutual`
      : "No mutual named yet",
    appliedLine: appliedLine(dto.createdAt),
  };
}

/**
 * Incoming platform join requests for the mod/admin review queue. Demo mode
 * returns the colocated mock queue; live mode calls GET /join-requests?status and
 * adapts each row. Works with no backend.
 */
export function useJoinRequests(status: JoinRequestDTO["status"] = "pending") {
  const { demoMode } = useDemoMode();
  return useQuery<JoinRequestView[]>({
    queryKey: ["join-requests", demoMode, status],
    queryFn: async () => {
      const rows = demoMode
        ? JOIN_REQUESTS.filter((r) => r.status === status)
        : await getJoinRequests(status);
      return rows.map(dtoToView);
    },
  });
}
