import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraph/trustGraphModel";
import type {
  JoinPath,
  TrustGraph,
  VouchPerson,
} from "./trustGraph/trustGraphModel";
import {
  buildInviteTree,
  createInviteTreeStore,
  expandPathTo,
  groupOfPerson,
  inviteTreeGroupItemId,
  listVisibleTreeItems,
  pathToPerson,
  toggleExpanded,
} from "./buildInviteTree";
import type { InviteTreeNode } from "./buildInviteTree";

function makePerson(
  id: string,
  joinedDay: number,
  extra: Partial<VouchPerson> = {},
): VouchPerson {
  const day = joinedDay < 10 ? `0${joinedDay}` : `${joinedDay}`;
  return {
    id,
    userId: `user-${id}`,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    pronoun: "",
    initials: id.slice(0, 2).toUpperCase(),
    tone: "jade",
    joined: "2026-01",
    joinedAt: `2026-01-${day}T12:00:00.000Z`,
    standing: "trusted",
    sceneId: null,
    role: null,
    accountKind: "member",
    ringId: null,
    isolatedBy: [],
    joinPath: { kind: "unknown", byId: null, byName: null, at: null },
    trackRecord: { vouchesGiven: 0, laterFlaggedCount: 0 },
    activeInboundCount: 0,
    activeOutboundCount: 0,
    sceneIds: [],
    ...extra,
  };
}

function invitedBy(inviterId: string): { joinPath: JoinPath } {
  return {
    joinPath: { kind: "invite", byId: inviterId, byName: inviterId, at: null },
  };
}

const FOUNDER_PATH: { joinPath: JoinPath } = {
  joinPath: { kind: "founder", byId: null, byName: null, at: null },
};

function buildGraph(people: VouchPerson[]): TrustGraph {
  return createTrustGraph({
    people,
    peopleById: Object.fromEntries(people.map((person) => [person.id, person])),
    edges: [],
    scenes: [],
    sceneAnchor: {},
    tMin: ymValue("2026-01"),
    tMax: ymValue("2026-12"),
    truncated: false,
    rings: [],
    cases: [],
    openCaseCount: 0,
    platformStartedAt: "2026-01-01T00:00:00.000Z",
    newAccountWindowDays: 5,
  });
}

function childIds(node: InviteTreeNode | undefined): string[] {
  return (node?.children ?? []).map((child) => child.personId);
}

function countNodes(nodes: InviteTreeNode[]): number {
  return nodes.reduce(
    (total, node) => total + 1 + countNodes(node.children),
    0,
  );
}

describe("buildInviteTree", () => {
  it("puts each member under their inviter, earliest joined first", () => {
    const graph = buildGraph([
      makePerson("ines", 1, FOUNDER_PATH),
      makePerson("late", 20, invitedBy("ines")),
      makePerson("early", 5, invitedBy("ines")),
      makePerson("grandchild", 25, invitedBy("early")),
    ]);
    const roots = buildInviteTree(graph);
    expect(roots.map((root) => root.group)).toEqual(["founders"]);
    const ines = roots[0]!.nodes[0]!;
    expect(ines.personId).toBe("ines");
    expect(childIds(ines)).toEqual(["early", "late"]);
    expect(ines.invitedCount).toBe(2);
    expect(childIds(ines.children[0])).toEqual(["grandchild"]);
  });

  it("orders groups and omits empty ones", () => {
    const graph = buildGraph([
      makePerson("unknownMember", 3),
      makePerson("applicant", 2, {
        joinPath: { kind: "application", byId: "x", byName: "X", at: null },
      }),
      makePerson("guest", 4, invitedBy("missing")),
      makePerson("staffer", 1, { accountKind: "staff" }),
    ]);
    const roots = buildInviteTree(graph);
    expect(roots.map((root) => root.group)).toEqual([
      "founders",
      "outside",
      "applications",
      "unknown",
    ]);
    expect(groupOfPerson(roots, "staffer")).toBe("founders");
    expect(groupOfPerson(roots, "guest")).toBe("outside");
    expect(groupOfPerson(roots, "applicant")).toBe("applications");
    expect(groupOfPerson(roots, "unknownMember")).toBe("unknown");
    expect(
      buildInviteTree(buildGraph([makePerson("solo", 1)])).map(
        (root) => root.group,
      ),
    ).toEqual(["unknown"]);
  });

  it("places every member exactly once when invites form a loop", () => {
    const graph = buildGraph([
      makePerson("first", 2, invitedBy("second")),
      makePerson("second", 3, invitedBy("third")),
      makePerson("third", 4, invitedBy("first")),
      makePerson("self", 5, invitedBy("self")),
    ]);
    const roots = buildInviteTree(graph);
    const total = roots.reduce((sum, root) => sum + countNodes(root.nodes), 0);
    expect(total).toBe(4);
    const outside = roots.find((root) => root.group === "outside");
    expect(outside?.nodes.map((node) => node.personId)).toEqual([
      "self",
      "first",
    ]);
    expect(pathToPerson(roots, "second")).toEqual(["first", "third"]);
  });
});

describe("pathToPerson", () => {
  const graph = buildGraph([
    makePerson("ines", 1, FOUNDER_PATH),
    makePerson("devon", 2, invitedBy("ines")),
    makePerson("rui", 3, invitedBy("devon")),
  ]);
  const roots = buildInviteTree(graph);

  it("lists ancestors root first", () => {
    expect(pathToPerson(roots, "rui")).toEqual(["ines", "devon"]);
  });

  it("is empty for a root or a missing member", () => {
    expect(pathToPerson(roots, "ines")).toEqual([]);
    expect(pathToPerson(roots, "nobody")).toEqual([]);
  });
});

describe("expandPathTo", () => {
  const graph = buildGraph([
    makePerson("ines", 1, FOUNDER_PATH),
    makePerson("devon", 2, invitedBy("ines")),
    makePerson("rui", 3, invitedBy("devon")),
  ]);
  const roots = buildInviteTree(graph);

  it("opens the group, the ancestors and optionally the member", () => {
    const opened = expandPathTo(roots, new Set(), "devon", true);
    expect([...opened].sort()).toEqual(
      [inviteTreeGroupItemId("founders"), "ines", "devon"].sort(),
    );
    const withoutSelf = expandPathTo(roots, new Set(), "devon", false);
    expect(withoutSelf.has("devon")).toBe(false);
  });

  it("returns the same set when the path is already open", () => {
    const expanded = new Set([inviteTreeGroupItemId("founders"), "ines"]);
    expect(expandPathTo(roots, expanded, "devon", false)).toBe(expanded);
    expect(expandPathTo(roots, expanded, "nobody", true)).toBe(expanded);
  });
});

describe("listVisibleTreeItems", () => {
  const graph = buildGraph([
    makePerson("ines", 1, FOUNDER_PATH),
    makePerson("devon", 2, invitedBy("ines")),
    makePerson("rui", 3, invitedBy("devon")),
  ]);
  const roots = buildInviteTree(graph);
  const foundersId = inviteTreeGroupItemId("founders");

  it("shows only expanded branches", () => {
    const collapsed = listVisibleTreeItems(roots, new Set([foundersId]));
    expect(collapsed.map((item) => item.id)).toEqual([foundersId, "ines"]);
    const opened = listVisibleTreeItems(
      roots,
      new Set([foundersId, "ines", "devon"]),
    );
    expect(opened.map((item) => [item.id, item.level])).toEqual([
      [foundersId, 1],
      ["ines", 2],
      ["devon", 3],
      ["rui", 4],
    ]);
    expect(opened[3]?.parentId).toBe("devon");
    expect(opened[3]?.isExpandable).toBe(false);
  });
});

describe("createInviteTreeStore", () => {
  it("notifies only when the state object changes", () => {
    const store = createInviteTreeStore({
      focusId: "ines",
      selectedId: null,
      activeId: "ines",
      expandedIds: new Set<string>(),
    });
    let notifyCount = 0;
    const unsubscribe = store.subscribe(() => {
      notifyCount += 1;
    });
    store.update((current) => current);
    expect(notifyCount).toBe(0);
    store.update((current) => ({
      ...current,
      expandedIds: toggleExpanded(current.expandedIds, "ines"),
    }));
    expect(notifyCount).toBe(1);
    expect(store.getState().expandedIds.has("ines")).toBe(true);
    unsubscribe();
    store.update((current) => ({ ...current, activeId: "devon" }));
    expect(notifyCount).toBe(1);
  });
});
