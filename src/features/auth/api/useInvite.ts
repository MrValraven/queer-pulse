import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { getMember } from "../../members/data/members";
import { initialsFromParts } from "../../../shared/lib/initials";
import { getInvite, type InviteDTO } from "./invite.api";

/** Page-ready, presentation-normalized invite (status + the inviter's details). */
export interface InviteView {
  code: string;
  status: InviteDTO["status"];
  inviter: {
    slug: string;
    name: string;
    firstName: string;
    initials: string;
    photo?: string;
    since?: string;
  };
  note?: string;
  /** The inviter's vouch — why they're inviting you — surfaced at onboarding. */
  vouch?: string;
  /** False when the inviter is no longer active (deactivated / suspended /
   *  banned / erased) — the landing shows a tailored "inviter inactive" state. */
  inviterActive: boolean;
  /** Raw expiry instant, or null when the invite has no set expiry. */
  expiresAt?: Date | null;
  /**
   * Expiry rendered in the member's ACTIVE language, e.g. "12 June 2026" /
   * "12 de junho de 2026". Derived in `useInvite`'s `select` (not baked into the
   * cached query data) so switching language reformats it, the way every other
   * date in this feature already behaves.
   */
  expiryLabel: string;
  validForDays: number;
  memberCount: number;
}

/** What the query caches: everything except the language-dependent label. */
type InviteQueryData = Omit<InviteView, "expiryLabel">;

const DEMO_NOTE =
  "\"I've been here two years now. It's the one place online where I don't have to explain myself. I think you'd like it here.\"";
const DEMO_VOUCH =
  "You're thoughtful, creative, and exactly the kind of person I wanted in this space.";

/** The expiry as a `Date`, or null when absent/unparseable. Kept raw here so the
 *  label can be produced in whatever language is active at render. */
function parseExpiry(iso: string | null): Date | null {
  if (!iso) return null;
  const parsedDate = new Date(iso);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function dtoToView(dto: InviteDTO): InviteQueryData {
  const { inviter } = dto;
  return {
    code: dto.code,
    status: dto.status,
    inviter: {
      slug: inviter.slug,
      name: `${inviter.firstName} ${inviter.lastName}`,
      firstName: inviter.firstName,
      initials: initialsFromParts(inviter.firstName, inviter.lastName),
      photo: inviter.avatarUrl ?? undefined,
      since: inviter.memberSince,
    },
    note: dto.note,
    vouch: dto.vouch,
    inviterActive: dto.inviterActive,
    expiresAt: parseExpiry(dto.expiresAt),
    // Falls back to 0 only if the backend ever omits the expiry window; in
    // practice every minted invite sets one, so the badge always reads a real N.
    validForDays: dto.validForDays ?? 0,
    memberCount: dto.memberCount,
  };
}

/** Demo fallback: the mock inviter (Inês), so the journey works with no backend. */
function demoInvite(code: string): InviteQueryData {
  const ines = getMember("ines")!;
  return {
    code,
    status: "valid",
    inviter: {
      slug: ines.slug,
      name: `${ines.first} ${ines.last}`,
      firstName: ines.first,
      initials: ines.initials,
      photo: ines.photo,
      since: ines.since,
    },
    note: DEMO_NOTE,
    vouch: DEMO_VOUCH,
    inviterActive: true,
    expiresAt: new Date("2026-06-12T12:00:00.000Z"),
    validForDays: 7,
    memberCount: 247,
  };
}

/**
 * Resolve an invite link's `code` to the inviter + status. Demo mode returns the
 * mock inviter; live mode calls GET /invites/:code so the landing page shows the
 * real person who sent it (and routes expired/used codes to the expired page).
 */
export function useInvite(code: string | undefined) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  // The expiry label is derived here rather than inside `queryFn`: the cached
  // entry is keyed on the code, not the language, so a label baked in at fetch
  // time would stay in whatever language happened to be active then. `fmt` is
  // memoized per language, so this select only re-runs when the language (or
  // the data) actually changes.
  const withExpiryLabel = useCallback(
    (data: InviteQueryData): InviteView => ({
      ...data,
      expiryLabel: data.expiresAt ? fmt.date(data.expiresAt) : "",
    }),
    [fmt],
  );
  return useQuery<InviteQueryData, Error, InviteView>({
    queryKey: ["invite", demoMode, code],
    enabled: Boolean(code),
    retry: false, // a 404 on a bad code shouldn't be retried
    queryFn: async () => {
      if (!code) throw new Error("Missing invite code");
      if (demoMode) return demoInvite(code);
      return dtoToView(await getInvite(code));
    },
    select: withExpiryLabel,
  });
}
