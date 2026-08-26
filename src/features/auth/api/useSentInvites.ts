import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getSentInvites,
  resendInvite,
  revokeInvite,
  type SentInviteDTO,
} from "./invite.api";

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
  /** Stable invite uuid the revoke + resend mutations target. */
  id: string;
  code: string;
  status: SentInviteDTO["status"];
  /** Catalog key for the chip label, e.g. "auth:invite.sentList.status.used". */
  statusKey: string;
  /** Chip tone, matching the design-system chip palette. */
  statusTone: "jade" | "amber" | "ghost" | "coral";
  /** When the invite was sent. */
  sentAt: Date;
  /** When the invite stops working, or null when it has no set expiry. */
  expiresAt: Date | null;
  /** The address the invite is pinned to, when the member addressed it to one
   *  person. Undefined means a bearer link anyone holding it can redeem. */
  recipientEmail?: string;
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
    id: dto.id,
    code: dto.code,
    status: dto.status,
    statusKey: meta.key,
    statusTone: meta.tone,
    sentAt: new Date(dto.createdAt),
    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    recipientEmail: dto.email ?? undefined,
    note: dto.note ?? undefined,
    // Non-null only on a `used` row (backend contract), so this "joined by
    // {name}" line appears exactly when someone actually redeemed the code.
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
      // Demo mock is loaded on demand so it stays out of the live bundle.
      const rows = demoMode
        ? (await import("../sentInvites.data")).SENT_INVITES
        : await getSentInvites();
      return rows.map(dtoToView);
    },
  });
}

/**
 * Revoke one of the member's own pending invites. Demo mode optimistically
 * flips the row to `revoked` in the query cache and never touches the network
 * (the fixture isn't persisted, so an invalidate would just restore it). Live
 * mode calls `DELETE /invites/:code`, applies the same optimistic flip, and
 * invalidates the sent-invites list so the server's truth wins on refetch.
 * Failures surface through the global mutation-error toast.
 *
 * The mutation takes both `code` (what the backend route resolves by) and `id`
 * (the uuid we patch the cache row against) — the two are distinct values, so
 * revoking by id would 404 against the `:code` route.
 *
 * `onMutate` snapshots the list before flipping the row and `onError` puts that
 * snapshot back, so a 403/404/offline failure never leaves an invite reading
 * "Revoked" while its link is still live and redeemable. The refetch in
 * `onSettled` is a second line of defence that has to be able to fail: offline
 * it never lands, so the rollback stands on its own. Errors reach the caller's
 * `onError` for a tailored message; `meta.silentError` keeps the global
 * mutation-error toast from doubling up with it.
 */
export function useRevokeInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = ["sent-invites", demoMode];

  return useMutation<
    void,
    unknown,
    { id: string; code: string },
    { previous: SentInviteView[] | undefined }
  >({
    mutationKey: ["sent-invites", "revoke"],
    meta: { silentError: true },
    mutationFn: async ({ code }) => {
      if (demoMode) return;
      await revokeInvite(code);
    },
    onMutate: ({ id }) => {
      const previous = queryClient.getQueryData<SentInviteView[]>(queryKey);
      const revoked = STATUS_META.revoked;
      queryClient.setQueryData<SentInviteView[]>(queryKey, (current) =>
        current?.map((invite) =>
          invite.id === id
            ? {
                ...invite,
                status: "revoked",
                statusKey: revoked.key,
                statusTone: revoked.tone,
              }
            : invite,
        ),
      );
      return { previous };
    },
    // Roll the optimistic flip back to exactly what was on screen before it.
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      // Demo holds its list off the fixture, not the cache — invalidating would
      // refetch the original mock and undo the optimistic flip.
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Re-mint one of the member's own **expired** invites: the backend keeps the same
 * code, pushes the expiry out +7d, and flips the status back to pending — then
 * returns the updated row. We patch that single row into the sent-invites cache
 * in place rather than refetching the whole list. Demo mode simulates the same
 * re-mint locally off the cached row (no network, nothing persisted to sync).
 *
 * Errors surface to the caller's `onError` for a tailored, honest message
 * (403 not-yours · 404 unknown · 409 already accepted/revoked/still-valid);
 * `silentError` keeps the global mutation-error toast from doubling up.
 */
export function useResendInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = ["sent-invites", demoMode];
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  return useMutation<SentInviteView, unknown, { id: string; code: string }>({
    mutationKey: ["sent-invites", "resend"],
    meta: { silentError: true },
    mutationFn: async ({ id, code }) => {
      if (demoMode) {
        const current = queryClient
          .getQueryData<SentInviteView[]>(queryKey)
          ?.find((invite) => invite.id === id);
        const valid = STATUS_META.valid;
        return {
          id,
          code,
          status: "valid",
          statusKey: valid.key,
          statusTone: valid.tone,
          sentAt: current?.sentAt ?? new Date(),
          expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
          recipientEmail: current?.recipientEmail,
          note: current?.note,
          acceptedByName: undefined,
        };
      }
      return dtoToView(await resendInvite(code));
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<SentInviteView[]>(queryKey, (current) =>
        current?.map((invite) => (invite.id === updated.id ? updated : invite)),
      );
    },
  });
}
