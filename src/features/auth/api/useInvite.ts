import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { formatDate } from "../../../shared/lib/date";
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
  /** Pre-formatted expiry, e.g. "12 June 2026". */
  expiryLabel: string;
  validForDays: number;
  memberCount: number;
}

const DEMO_NOTE =
  "\"I've been part of this community for two years now. It's the one platform I'm genuinely glad exists. I think you'd belong here.\"";
const DEMO_VOUCH =
  "They’re exactly the kind of person this community was built for: thoughtful, creative, and genuinely invested in making queer spaces better.";

function formatExpiry(iso: string | null): string {
  if (!iso) return "";
  const parsedDate = new Date(iso);
  if (Number.isNaN(parsedDate.getTime())) return "";
  // Default `formatDate` options are day / long-month / year — the exact shape
  // this line hand-rolled — pinned to en-GB so the invite reads "12 June 2026".
  return formatDate(parsedDate, "en-GB");
}

function dtoToView(dto: InviteDTO): InviteView {
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
    expiryLabel: formatExpiry(dto.expiresAt),
    // Falls back to 0 only if the backend ever omits the expiry window; in
    // practice every minted invite sets one, so the badge always reads a real N.
    validForDays: dto.validForDays ?? 0,
    memberCount: dto.memberCount,
  };
}

/** Demo fallback: the mock inviter (Inês), so the journey works with no backend. */
function demoInvite(code: string): InviteView {
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
    expiryLabel: "12 June 2026",
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
  return useQuery<InviteView>({
    queryKey: ["invite", demoMode, code],
    enabled: Boolean(code),
    retry: false, // a 404 on a bad code shouldn't be retried
    queryFn: async () => {
      if (!code) throw new Error("Missing invite code");
      if (demoMode) return demoInvite(code);
      return dtoToView(await getInvite(code));
    },
  });
}
