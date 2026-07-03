import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSentInvites, type SentInviteDTO } from "./invite.api";
import { SENT_INVITES } from "../sentInvites.data";

/** Presentation-normalized "invite I've sent" — status chip + human-readable dates. */
export interface SentInviteView {
  code: string;
  status: SentInviteDTO["status"];
  /** Chip label, e.g. "Accepted", "Pending", "Expired", "Revoked". */
  statusLabel: string;
  /** Chip tone, matching the design-system chip palette. */
  statusTone: "jade" | "amber" | "ghost" | "coral";
  /** Pre-formatted send date, e.g. "18 June 2026". */
  sentLabel: string;
  /** Pre-formatted expiry, e.g. "25 June 2026". */
  expiryLabel: string;
  note?: string;
  /** Name of the person who accepted, if this invite was used. */
  acceptedByName?: string;
}

const STATUS_META: Record<
  SentInviteDTO["status"],
  { label: string; tone: SentInviteView["statusTone"] }
> = {
  valid: { label: "Pending", tone: "amber" },
  used: { label: "Accepted", tone: "jade" },
  expired: { label: "Expired", tone: "ghost" },
  revoked: { label: "Revoked", tone: "coral" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function dtoToView(dto: SentInviteDTO): SentInviteView {
  const meta = STATUS_META[dto.status];
  const accepted = dto.acceptedBy;
  return {
    code: dto.code,
    status: dto.status,
    statusLabel: meta.label,
    statusTone: meta.tone,
    sentLabel: formatDate(dto.createdAt),
    expiryLabel: formatDate(dto.expiresAt),
    note: dto.note,
    acceptedByName: accepted
      ? `${accepted.firstName} ${accepted.lastName}`.trim()
      : undefined,
  };
}

/**
 * The invites the current member has sent, with their live status/expiry. Demo
 * mode returns the colocated mock list; live mode calls GET /invites and adapts
 * each row for display. Works with no backend.
 */
export function useSentInvites() {
  const { demoMode } = useDemoMode();
  return useQuery<SentInviteView[]>({
    queryKey: ["sent-invites", demoMode],
    queryFn: async () => {
      const rows = demoMode ? SENT_INVITES : await getSentInvites();
      return rows.map(dtoToView);
    },
  });
}
