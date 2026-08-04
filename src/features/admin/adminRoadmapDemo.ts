import type {
  AdminRoadmapIdea,
  AdminRoadmapItem,
  DemoRoadmapState,
} from "./adminRoadmap.data";
import type {
  RoadmapAdminHeroStatDTO,
  RoadmapBulkAction,
  RoadmapColumn,
  RoadmapDeclineReason,
  RoadmapIdeaUpdateBody,
  RoadmapItemUpdateBody,
  RoadmapItemWriteBody,
  RoadmapTeamMemberDTO,
  RoadmapTeamMemberUpdateBody,
  RoadmapTeamMemberWriteBody,
  RoadmapUpdateDepsBody,
} from "./api/roadmapAdmin.api";

/**
 * Pure demo-mode reducers for every admin roadmap write action — the demo
 * counterpart to `queerpulse-backend/src/roadmap/roadmap-admin.service.ts`,
 * reviewed correct there and mirrored here field-for-field (slip guard,
 * safety guard, shipped-locks-progress, bulk skip-gated-on-show, idea
 * promote/merge/decline semantics) so demo and live read identically.
 *
 * Each function takes the current `DemoRoadmapState` plus the action's
 * arguments and returns `{ state, result }` on success. A guard failure
 * (slip reason missing, safety gate, not-found target, …) `throw`s a plain
 * `Error` instead of returning — `useAdminRoadmapMutations` lets that
 * propagate out of the mutation's `mutationFn`, which is exactly what
 * surfaces it to the per-call `onError` react-query already gives callers
 * (see `AdminRoadmapBoard`'s `moveItem`/`confirmDelete` for the existing
 * convention this preserves). Nothing here touches `localStorage` directly —
 * the caller reads via `readDemoRoadmap()` and persists the returned `state`
 * via `writeDemoRoadmap()`, same division of labor the pre-B4 file used.
 */

/** Recorded as the actor on every audit row and slip this store writes.
 *  Demo fiction — there is no real signed-in identity without a live
 *  backend session, so every demo admin action reads as "You", matching how
 *  the rest of the demo store (e.g. `outbox.ts`) treats the demo user. */
const DEMO_ACTOR_LABEL = "You";

function demoId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function appendAudit(
  state: DemoRoadmapState,
  action: string,
): DemoRoadmapState {
  return {
    ...state,
    audit: [
      {
        id: demoId("audit"),
        actorLabel: DEMO_ACTOR_LABEL,
        action,
        createdAt: nowIso(),
      },
      ...state.audit,
    ],
  };
}

function requireItem(state: DemoRoadmapState, id: string): AdminRoadmapItem {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error("Roadmap item not found");
  return item;
}

function requireIdea(state: DemoRoadmapState, id: string): AdminRoadmapIdea {
  const idea = state.ideas.find((candidate) => candidate.id === id);
  if (!idea) throw new Error("Roadmap idea not found");
  return idea;
}

function requireTeamMember(
  state: DemoRoadmapState,
  id: string,
): RoadmapTeamMemberDTO {
  const member = state.team.find((candidate) => candidate.id === id);
  if (!member) throw new Error("Team member not found");
  return member;
}

function assertNotSafetyGated(next: {
  isPublic: boolean;
  safetyStatus: number;
}): void {
  if (next.isPublic && next.safetyStatus === 1) {
    throw new Error(
      "This item needs its safety review cleared before it can go public",
    );
  }
}

function maxSortOrder(items: AdminRoadmapItem[], column: RoadmapColumn): number {
  return items
    .filter((item) => item.column === column)
    .reduce((max, item) => Math.max(max, item.sortOrder), -1);
}

// ── Items ────────────────────────────────────────────────────────────────────

export function demoCreateItem(
  state: DemoRoadmapState,
  body: RoadmapItemWriteBody,
): { state: DemoRoadmapState; result: AdminRoadmapItem } {
  assertNotSafetyGated(body);
  const ownerName = body.ownerId
    ? (state.team.find((member) => member.userId === body.ownerId)?.name ?? null)
    : null;
  const item: AdminRoadmapItem = {
    ...body,
    id: demoId("item"),
    ownerName,
    liveVotes: body.votes,
    slips: [],
    deps: [],
    voteBreakdown: { top: [], other: 0 },
    comments: [],
    archived: false,
    updatedAt: nowIso(),
  };
  const nextState = appendAudit(
    { ...state, items: [...state.items, item] },
    `Created "${item.name}"`,
  );
  return { state: nextState, result: item };
}

export function demoUpdateItem(
  state: DemoRoadmapState,
  id: string,
  body: RoadmapItemUpdateBody,
): { state: DemoRoadmapState; result: AdminRoadmapItem } {
  const item = requireItem(state, id);
  let slips = item.slips;

  // Slip guard — mirrors `RoadmapAdminService.updateItem`: a `targetQuarter`
  // change on a card that hasn't shipped must carry a reason.
  if (
    body.targetQuarter !== undefined &&
    body.targetQuarter !== item.targetQuarter &&
    item.column !== "shipped"
  ) {
    if (!body.slipReason) {
      throw new Error(
        "A reason is required when the target quarter changes on a card that hasn't shipped",
      );
    }
    slips = [
      ...slips,
      {
        from: item.targetQuarter ?? "",
        to: body.targetQuarter ?? "",
        reason: body.slipReason,
        movedByName: DEMO_ACTOR_LABEL,
        movedAt: nowIso(),
      },
    ];
  }

  const { slipReason: _slipReason, ...writable } = body;
  const next: AdminRoadmapItem = {
    ...item,
    ...writable,
    slips,
    updatedAt: nowIso(),
  };
  // Shipped is always done, full stop — same invariant as the backend.
  if (next.column === "shipped") next.progress = 100;
  assertNotSafetyGated(next);

  const items = state.items.map((candidate) =>
    candidate.id === id ? next : candidate,
  );
  const nextState = appendAudit(
    { ...state, items },
    `Updated "${next.name}"`,
  );
  return { state: nextState, result: next };
}

export function demoDeleteItem(
  state: DemoRoadmapState,
  id: string,
): { state: DemoRoadmapState; result: undefined } {
  const item = requireItem(state, id);
  const nextState = appendAudit(
    { ...state, items: state.items.filter((candidate) => candidate.id !== id) },
    `Deleted "${item.name}"`,
  );
  return { state: nextState, result: undefined };
}

export function demoUpdateDeps(
  state: DemoRoadmapState,
  id: string,
  body: RoadmapUpdateDepsBody,
): { state: DemoRoadmapState; result: AdminRoadmapItem } {
  const item = requireItem(state, id);
  if (body.add === id) {
    throw new Error("An item cannot depend on itself");
  }
  if (body.add && !state.items.some((candidate) => candidate.id === body.add)) {
    throw new Error("Dependency target item not found");
  }

  let deps = item.deps;
  if (body.add && !deps.includes(body.add)) deps = [...deps, body.add];
  if (body.remove) deps = deps.filter((depId) => depId !== body.remove);

  const next: AdminRoadmapItem = { ...item, deps, updatedAt: nowIso() };
  const items = state.items.map((candidate) =>
    candidate.id === id ? next : candidate,
  );
  const nextState = appendAudit(
    { ...state, items },
    `Updated dependencies on "${item.name}"`,
  );
  return { state: nextState, result: next };
}

export function demoDuplicateItem(
  state: DemoRoadmapState,
  id: string,
): { state: DemoRoadmapState; result: AdminRoadmapItem } {
  const original = requireItem(state, id);
  const duplicate: AdminRoadmapItem = {
    ...original,
    id: demoId("item"),
    name: `${original.name} (copy)`,
    // A duplicate is a fresh draft, not a re-announcement of the original's
    // public promise — starts private/uncommitted/un-notified with no slip
    // history of its own, same invariant as the backend.
    committed: false,
    isPublic: false,
    notified: false,
    slips: [],
    votes: 0,
    liveVotes: 0,
    voteBreakdown: { top: [], other: 0 },
    comments: [],
    hot: false,
    archived: false,
    sortOrder: maxSortOrder(state.items, original.column) + 1,
    updatedAt: nowIso(),
  };
  const nextState = appendAudit(
    { ...state, items: [...state.items, duplicate] },
    `Duplicated "${original.name}" as "${duplicate.name}"`,
  );
  return { state: nextState, result: duplicate };
}

export function demoArchiveItem(
  state: DemoRoadmapState,
  id: string,
  archived: boolean,
): { state: DemoRoadmapState; result: AdminRoadmapItem } {
  const item = requireItem(state, id);
  const next: AdminRoadmapItem = { ...item, archived, updatedAt: nowIso() };
  const items = state.items.map((candidate) =>
    candidate.id === id ? next : candidate,
  );
  const nextState = appendAudit(
    { ...state, items },
    `${archived ? "Archived" : "Restored"} "${item.name}"`,
  );
  return { state: nextState, result: next };
}

export function demoNotifyVoters(
  state: DemoRoadmapState,
  id: string,
): { state: DemoRoadmapState; result: { notified: number } } {
  const item = requireItem(state, id);
  const next: AdminRoadmapItem = { ...item, notified: true, updatedAt: nowIso() };
  const items = state.items.map((candidate) =>
    candidate.id === id ? next : candidate,
  );
  // Fix-round 1: the backend's `notifyVoters` counts real `roadmap_votes`
  // rows (`liveVotes`), not the seeded `votes` count — a seeded item can
  // have a large `votes` but `liveVotes: 0`, so using `votes` here would
  // report "notified 88" in demo while live notifies 0.
  const nextState = appendAudit(
    { ...state, items },
    `Notified ${item.liveVotes} voter(s) on "${item.name}"`,
  );
  return { state: nextState, result: { notified: item.liveVotes } };
}

export function demoBulkItems(
  state: DemoRoadmapState,
  ids: string[],
  action: RoadmapBulkAction,
  column: RoadmapColumn | undefined,
): { state: DemoRoadmapState; result: { count: number } } {
  if (action === "move" && !column) {
    throw new Error('A destination column is required for "move"');
  }
  const idSet = new Set(ids);
  const targets = state.items.filter((item) => idSet.has(item.id));
  if (targets.length === 0) {
    return { state, result: { count: 0 } };
  }

  let affected = targets.length;
  let items: AdminRoadmapItem[];

  switch (action) {
    case "move": {
      const destination = column!;
      items = state.items.map((item) =>
        idSet.has(item.id)
          ? {
              ...item,
              column: destination,
              progress: destination === "shipped" ? 100 : item.progress,
              updatedAt: nowIso(),
            }
          : item,
      );
      break;
    }
    case "show": {
      // Safety guard, bulk form: skip items still gated by an uncleared
      // safety review rather than failing the whole batch.
      const allowedIds = new Set(
        targets
          .filter((target) => target.safetyStatus !== 1)
          .map((target) => target.id),
      );
      affected = allowedIds.size;
      items = state.items.map((item) =>
        allowedIds.has(item.id)
          ? { ...item, isPublic: true, updatedAt: nowIso() }
          : item,
      );
      break;
    }
    case "hide":
      items = state.items.map((item) =>
        idSet.has(item.id) ? { ...item, isPublic: false, updatedAt: nowIso() } : item,
      );
      break;
    case "archive":
      items = state.items.map((item) =>
        idSet.has(item.id) ? { ...item, archived: true, updatedAt: nowIso() } : item,
      );
      break;
    case "delete":
      items = state.items.filter((item) => !idSet.has(item.id));
      break;
  }

  const nextState = appendAudit(
    { ...state, items },
    `Bulk ${action} on ${affected} item(s)`,
  );
  return { state: nextState, result: { count: affected } };
}

// ── Ideas ────────────────────────────────────────────────────────────────────

export function demoCreateIdea(
  state: DemoRoadmapState,
  text: string,
): { state: DemoRoadmapState; result: AdminRoadmapIdea } {
  const maxOrder = state.ideas.reduce(
    (max, idea) => Math.max(max, idea.sortOrder),
    -1,
  );
  const idea: AdminRoadmapIdea = {
    id: demoId("idea"),
    text,
    status: "published",
    category: "",
    note: null,
    duplicateOfItemId: null,
    declineReason: null,
    declineNote: null,
    votes: 0,
    liveVotes: 0,
    // Admin-authored ideas skip triage and have no attributed submitter —
    // same as `RoadmapAdminService.createIdea`.
    fromMember: false,
    sortOrder: maxOrder + 1,
    createdAt: nowIso(),
  };
  const nextState = appendAudit(
    { ...state, ideas: [...state.ideas, idea] },
    `Created idea "${idea.text}"`,
  );
  return { state: nextState, result: idea };
}

export function demoUpdateIdea(
  state: DemoRoadmapState,
  id: string,
  body: RoadmapIdeaUpdateBody,
): { state: DemoRoadmapState; result: AdminRoadmapIdea } {
  const idea = requireIdea(state, id);
  const next: AdminRoadmapIdea = { ...idea, ...body };
  // Reopening (moving back to `published`) must not still read as
  // "not building" — clears any decline fields, same as the backend.
  if (body.status === "published") {
    next.declineReason = null;
    next.declineNote = null;
  }
  const ideas = state.ideas.map((candidate) =>
    candidate.id === id ? next : candidate,
  );
  const nextState = appendAudit(
    { ...state, ideas },
    `Updated idea "${next.text}"`,
  );
  return { state: nextState, result: next };
}

export function demoDeleteIdea(
  state: DemoRoadmapState,
  id: string,
): { state: DemoRoadmapState; result: undefined } {
  const idea = requireIdea(state, id);
  const nextState = appendAudit(
    { ...state, ideas: state.ideas.filter((candidate) => candidate.id !== id) },
    `Deleted idea "${idea.text}"`,
  );
  return { state: nextState, result: undefined };
}

export function demoPromoteIdea(
  state: DemoRoadmapState,
  id: string,
): { state: DemoRoadmapState; result: AdminRoadmapItem } {
  const idea = requireIdea(state, id);
  const item: AdminRoadmapItem = {
    id: demoId("item"),
    column: "planned",
    category: idea.category,
    name: idea.text,
    description: "",
    publicNote: null,
    date: null,
    stage: null,
    eta: null,
    targetQuarter: null,
    progress: null,
    priority: "P2",
    confidence: "maybe",
    committed: false,
    isPublic: true,
    requested: true,
    hot: false,
    notified: false,
    spikeFlag: false,
    safetyStatus: 0,
    blockedBy: null,
    blockedWhy: null,
    paidKind: "volunteer",
    weeklyHours: 0,
    cost: "none",
    ownerId: null,
    ownerName: null,
    slips: [],
    guide: null,
    deps: [],
    votes: idea.votes,
    liveVotes: 0,
    voteBreakdown: { top: [], other: 0 },
    comments: [],
    archived: false,
    sortOrder: maxSortOrder(state.items, "planned") + 1,
    updatedAt: nowIso(),
  };
  const nextState = appendAudit(
    {
      ...state,
      items: [...state.items, item],
      ideas: state.ideas.filter((candidate) => candidate.id !== id),
    },
    `Promoted idea "${idea.text}" to item "${item.name}"`,
  );
  return { state: nextState, result: item };
}

export function demoMergeIdea(
  state: DemoRoadmapState,
  id: string,
  intoItemId: string,
): { state: DemoRoadmapState; result: AdminRoadmapItem } {
  const idea = requireIdea(state, id);
  const target = requireItem(state, intoItemId);
  // Fix-round 1: the backend reassigns the idea's real `roadmap_votes` rows
  // onto the target, growing its live-vote count — mirror that here too, not
  // just the seeded `votes`, or demo merges would silently drop live votes
  // live wouldn't.
  const next: AdminRoadmapItem = {
    ...target,
    votes: target.votes + idea.votes,
    liveVotes: target.liveVotes + idea.liveVotes,
    requested: true,
    updatedAt: nowIso(),
  };
  const items = state.items.map((candidate) =>
    candidate.id === intoItemId ? next : candidate,
  );
  const nextState = appendAudit(
    {
      ...state,
      items,
      ideas: state.ideas.filter((candidate) => candidate.id !== id),
    },
    `Merged idea "${idea.text}" into "${next.name}"`,
  );
  return { state: nextState, result: next };
}

export function demoDeclineIdea(
  state: DemoRoadmapState,
  id: string,
  reason: RoadmapDeclineReason,
  note: string,
): { state: DemoRoadmapState; result: AdminRoadmapIdea } {
  const idea = requireIdea(state, id);
  const next: AdminRoadmapIdea = {
    ...idea,
    status: "dismissed",
    declineReason: reason,
    declineNote: note,
  };
  const ideas = state.ideas.map((candidate) =>
    candidate.id === id ? next : candidate,
  );
  const nextState = appendAudit(
    { ...state, ideas },
    `Declined idea "${next.text}" (${reason})`,
  );
  return { state: nextState, result: next };
}

// ── Team ─────────────────────────────────────────────────────────────────────

export function demoCreateTeamMember(
  state: DemoRoadmapState,
  body: RoadmapTeamMemberWriteBody,
  name: string,
): { state: DemoRoadmapState; result: RoadmapTeamMemberDTO } {
  if (state.team.some((member) => member.userId === body.userId)) {
    throw new Error("This member is already on the team");
  }
  const member: RoadmapTeamMemberDTO = {
    id: demoId("team"),
    userId: body.userId,
    name,
    role: body.role,
    weeklyCapHours: body.weeklyCapHours ?? 0,
    paid: body.paid ?? false,
    sortOrder: body.sortOrder ?? state.team.length,
  };
  const nextState = appendAudit(
    { ...state, team: [...state.team, member] },
    `Added "${name}" to the team as ${member.role}`,
  );
  return { state: nextState, result: member };
}

export function demoUpdateTeamMember(
  state: DemoRoadmapState,
  id: string,
  body: RoadmapTeamMemberUpdateBody,
  name: string | undefined,
): { state: DemoRoadmapState; result: RoadmapTeamMemberDTO } {
  const member = requireTeamMember(state, id);
  if (
    body.userId &&
    body.userId !== member.userId &&
    state.team.some((candidate) => candidate.userId === body.userId)
  ) {
    throw new Error("This member is already on the team");
  }
  const next: RoadmapTeamMemberDTO = {
    ...member,
    ...body,
    name: name ?? member.name,
  };
  const team = state.team.map((candidate) =>
    candidate.id === id ? next : candidate,
  );
  const nextState = appendAudit(
    { ...state, team },
    `Updated team member "${next.name}"`,
  );
  return { state: nextState, result: next };
}

export function demoDeleteTeamMember(
  state: DemoRoadmapState,
  id: string,
): { state: DemoRoadmapState; result: undefined } {
  const member = requireTeamMember(state, id);
  const nextState = appendAudit(
    { ...state, team: state.team.filter((candidate) => candidate.id !== id) },
    `Removed "${member.name}" from the team`,
  );
  return { state: nextState, result: undefined };
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function demoUpdateSettings(
  state: DemoRoadmapState,
  heroStats: RoadmapAdminHeroStatDTO[],
): { state: DemoRoadmapState; result: { heroStats: RoadmapAdminHeroStatDTO[] } } {
  const nextState = appendAudit(
    { ...state, heroStats },
    "Updated roadmap hero stats",
  );
  return { state: nextState, result: { heroStats } };
}
