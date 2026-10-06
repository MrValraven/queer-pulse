import type {
  PlatformLogEntryDTO,
  PlatformLogPageDTO,
  PlatformLogPartyDTO,
} from "./api/platformLog.api";
import type { PlatformLogFilters } from "./platformLogFilters";

// Demo-only fixtures for /admin/log. Imported through a demo-gated dynamic
// import() in usePlatformLog.ts so they stay out of the live bundle.

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const JULIA: PlatformLogPartyDTO = {
  userId: "5b0c3a52-1d7e-4f43-9a35-2f6d0b7e1a01",
  name: "Júlia Saraiva",
  kind: "staff",
};
const INES: PlatformLogPartyDTO = {
  userId: "8f2e6c1a-4b3d-4e5f-8a9b-0c1d2e3f4a02",
  name: "Inês Martins",
  kind: "staff",
};
const KAI: PlatformLogPartyDTO = {
  userId: "1c9d8e7f-6a5b-4c3d-9e2f-1a0b9c8d7e03",
  name: "Kai Sousa",
  kind: "staff",
};
const BEA = {
  userId: "2d4f6a8c-0e1b-4d3f-a5c7-e9b1d3f5a704",
  name: "Bea Lopes",
};
const RUI = {
  userId: "3e5a7c9e-1f2a-4b4c-b6d8-f0a2c4e6b805",
  name: "Rui Matos",
};
const LEONOR = {
  userId: "4f6b8d0f-2a3b-4c5d-87e9-a1b3d5f7c906",
  name: "Leonor Faria",
};
const SAM = {
  userId: "5a7c9e1a-3b4c-4d6e-98fa-b2c4e6a8da07",
  name: "Sam Okafor",
};
const MARTA = {
  userId: "6b8d0f2b-4c5d-4e7f-a90b-c3d5f7b9eb08",
  name: "Marta Quintela",
};

function asMember(person: {
  userId: string;
  name: string;
}): PlatformLogPartyDTO {
  return { ...person, kind: "member" };
}

const ANONYMOUS: PlatformLogPartyDTO = {
  userId: null,
  name: "",
  kind: "anonymous",
};
const ERASED: PlatformLogPartyDTO = { userId: null, name: "", kind: "erased" };
const SYSTEM: PlatformLogPartyDTO = { userId: null, name: "", kind: "system" };

function minutesAgo(now: number, minutes: number): string {
  return new Date(now - minutes * MINUTE_MS).toISOString();
}

function buildDemoPlatformLog(now: number): PlatformLogEntryDTO[] {
  const row = (
    id: string,
    minutes: number,
    fields: Omit<
      PlatformLogEntryDTO,
      "id" | "occurredAt" | "params" | "note" | "target" | "subject"
    > &
      Partial<
        Pick<PlatformLogEntryDTO, "params" | "note" | "target" | "subject">
      >,
  ): PlatformLogEntryDTO => ({
    id,
    occurredAt: minutesAgo(now, minutes),
    params: {},
    note: null,
    target: null,
    subject: null,
    ...fields,
  });
  return [
    row("mod:d1", 12, {
      category: "moderation",
      kind: "mod.ban",
      actor: JULIA,
      target: asMember(BEA),
      subject: { label: "", route: "/admin/moderation" },
      note: "Repeated slurs in DMs after a warning last week.",
    }),
    row("vouch:d2", 25, {
      category: "members",
      kind: "member.vouch_given",
      actor: asMember(SAM),
      target: asMember(MARTA),
    }),
    row("cjoin:d3", 40, {
      category: "members",
      kind: "member.community_joined",
      actor: asMember(LEONOR),
      subject: {
        label: "Porto Book Club",
        route: "/admin/communities/porto-book-club/mod",
      },
    }),
    row("set:d4", 65, {
      category: "governance",
      kind: "settings.changed",
      actor: INES,
      params: {
        settingKey: "registrationEnabled",
        oldValue: "true",
        newValue: "false",
      },
      subject: { label: "registrationEnabled", route: "/admin/settings" },
      note: "Pausing new sign-ups during the spam wave.",
    }),
    row("report:d5", 120, {
      category: "members",
      kind: "member.report_filed",
      actor: ANONYMOUS,
      params: { severity: "emergency" },
      subject: { label: "", route: "/admin/moderation?tab=emergencies" },
    }),
    row("ver:d6", 180, {
      category: "reviews",
      kind: "verification.approved",
      actor: KAI,
      target: asMember(LEONOR),
      subject: { label: "", route: "/admin/verifications" },
      note: "References check out.",
    }),
    row("ver:d7", 300, {
      category: "reviews",
      kind: "verification.submitted",
      actor: asMember(LEONOR),
      subject: { label: "", route: "/admin/verifications" },
    }),
    row("mod:d8", 360, {
      category: "staff",
      kind: "mod.conversation_context_viewed",
      actor: JULIA,
      target: asMember(SAM),
      note: "Needed the messages around the open harassment report.",
    }),
    row("join:d9", 480, {
      category: "members",
      kind: "member.joined",
      actor: asMember(MARTA),
    }),
    row("list:d10", 1320, {
      category: "reviews",
      kind: "listing.owner_edited",
      actor: asMember(RUI),
      subject: {
        label: "Café Arco-Íris",
        route: "/admin/listings?q=cafe-arco-iris",
      },
    }),
    row("safe:d11", 1560, {
      category: "reviews",
      kind: "safe_space.nomination_awarded",
      actor: INES,
      subject: { label: "Livraria Lilás", route: "/admin/safe-spaces" },
      note: "Three visits, all positive.",
    }),
    row("gov:d12", 1680, {
      category: "governance",
      kind: "governance.section_changed",
      actor: KAI,
      params: { section: "council" },
      subject: { label: "", route: "/admin/governance" },
    }),
    row("mod:d13", 1800, {
      category: "moderation",
      kind: "mod.suspension_lifted",
      actor: ERASED,
      target: asMember(RUI),
      subject: { label: "", route: "/admin/moderation" },
    }),
    row("mod:d14", 2040, {
      category: "moderation",
      kind: "mod.ban_hold_expired",
      actor: SYSTEM,
      target: asMember(SAM),
    }),
    row("thread:d15", 3000, {
      category: "members",
      kind: "member.thread_started",
      actor: asMember(SAM),
      subject: {
        label: "What queer spaces in Lisbon do you miss or want to see return?",
        route: "/thread/6",
      },
    }),
    row("road:d16", 3120, {
      category: "governance",
      kind: "roadmap.changed",
      actor: JULIA,
      params: { action: 'Moved "Group calls" to Next' },
      subject: { label: "", route: "/admin/roadmap" },
    }),
    row("jreq:d17", 3300, {
      category: "members",
      kind: "member.join_requested",
      actor: { userId: null, name: "Alex Pereira", kind: "member" },
      subject: { label: "", route: "/admin/members?tab=verification" },
    }),
    row("mod:d18", 4200, {
      category: "staff",
      kind: "mod.staff_role_granted",
      actor: INES,
      target: { ...KAI, kind: "member" },
    }),
  ];
}

function sinceFor(
  range: PlatformLogFilters["range"],
  now: number,
): number | null {
  switch (range) {
    case "today": {
      const today = new Date(now);
      return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime();
    }
    case "week":
      return now - 7 * DAY_MS;
    case "month":
      return now - 30 * DAY_MS;
    case "quarter":
      return now - 90 * DAY_MS;
    case "all":
      return null;
  }
}

/** One page of demo rows, filtered the way the server filters live rows. */
export function demoPlatformLogPage(
  filters: PlatformLogFilters,
  isAdmin: boolean,
  now: number,
): PlatformLogPageDTO {
  const since = sinceFor(filters.range, now);
  const data = buildDemoPlatformLog(now).filter((entry) => {
    const isMemberRow =
      entry.actor.kind === "member" || entry.actor.kind === "anonymous";
    if (!isAdmin && (entry.category === "members" || isMemberRow)) return false;
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(entry.category)
    )
      return false;
    if (
      filters.memberId &&
      entry.actor.userId !== filters.memberId &&
      entry.target?.userId !== filters.memberId
    )
      return false;
    return since === null || Date.parse(entry.occurredAt) >= since;
  });
  return { data, pageInfo: { nextCursor: null, hasMore: false } };
}
