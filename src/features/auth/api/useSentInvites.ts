import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSentInvites, type SentInviteDTO } from "./invite.api";
import { SENT_INVITES } from "../sentInvites.data";

/**
 * Presentation-normalized "invite I've sent" — status chip + dates.
 *
 * i18n note: this adapter emits a catalog *key* for the status chip and keeps
 * the send/expiry timestamps as `Date`s rather than pre-formatted strings —
 * `SentInvitesList` resolves both through `t()` / `useFormat()` at render, so
 * a language switch translates the chip and reformats the dates identically
 * in demo and live mode (see `events.adapters.ts` for the pattern this mirrors).
 */
export interface SentInviteView {
  code: string;
  status: SentInviteDTO["status"];
  /** Catalog key for the chip label, e.g. "auth:invite.sentList.status.used". */
  statusKey: string;
  /** Chip tone, matching the design-system chip palette. */
  statusTone: "jade" | "amber" | "ghost" | "coral";
  /** When the invite was sent. */
  sentAt: Date;
  /** When the invite stops working. */
  expiresAt: Date;
  note?: string;
  /** Name of the person who accepted, if this invite was used. */
  acceptedByName?: string;
}

const STATUS_META: Record<
  SentInviteDTO["status"],
  { key: string; tone: SentInviteView["statusTone"] }
> = {
  valid: { key: "auth:invite.sentList.status.valid", tone: "amber" },
  used: { key: "auth:invite.sentList.status.used", tone: "jade" },
  expired: { key: "auth:invite.sentList.status.expired", tone: "ghost" },
  revoked: { key: "auth:invite.sentList.status.revoked", tone: "coral" },
};

function dtoToView(dto: SentInviteDTO): SentInviteView {
  const meta = STATUS_META[dto.status];
  const accepted = dto.acceptedBy;
  return {
    code: dto.code,
    status: dto.status,
    statusKey: meta.key,
    statusTone: meta.tone,
    sentAt: new Date(dto.createdAt),
    expiresAt: new Date(dto.expiresAt),
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
