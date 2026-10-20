import type {
  AccountKind,
  TrustGraph,
  VouchPerson,
} from "./trustGraph/trustGraphModel";

/** B4: the four root groups of the invite tree, in display order. */
export type InviteTreeGroup =
  "founders" | "outside" | "applications" | "unknown";

export interface InviteTreeNode {
  personId: string;
  /** People this member invited, earliest joined first. */
  children: InviteTreeNode[];
  /** Direct invitees loaded in this view. */
  invitedCount: number;
}

export interface InviteTreeRoot {
  group: InviteTreeGroup;
  nodes: InviteTreeNode[];
}

/** One row the keyboard can reach: a group heading or a member. */
export interface InviteTreeVisibleItem {
  id: string;
  parentId: string | null;
  level: number;
  isExpandable: boolean;
}

export const INVITE_TREE_GROUPS: readonly InviteTreeGroup[] = [
  "founders",
  "outside",
  "applications",
  "unknown",
];

const ROLE_ACCOUNT_KINDS: ReadonlySet<AccountKind> = new Set([
  "founder",
  "staff",
  "system",
]);

/** Tree item id of a group heading. Member slugs carry no colon, so these
 *  never clash with a person id. */
export function inviteTreeGroupItemId(group: InviteTreeGroup): string {
  return `group:${group}`;
}

function joinedAtValue(person: VouchPerson): number {
  const value = Date.parse(person.joinedAt);
  return Number.isNaN(value) ? 0 : value;
}

function compareByJoined(first: VouchPerson, second: VouchPerson): number {
  return (
    joinedAtValue(first) - joinedAtValue(second) ||
    first.name.localeCompare(second.name)
  );
}

/** The inviter loaded in this view, when the member joined by invite. */
function inviterIdOf(graph: TrustGraph, person: VouchPerson): string | null {
  const { kind, byId } = person.joinPath;
  if (kind !== "invite" || !byId || byId === person.id) return null;
  return graph.peopleById[byId] ? byId : null;
}

/** Which root group a member without a loaded inviter sits under. */
function rootGroupOf(person: VouchPerson): InviteTreeGroup {
  const { kind, byId } = person.joinPath;
  if (kind === "founder") return "founders";
  if (kind === "invite") return "outside";
  if (kind === "application") return "applications";
  if (ROLE_ACCOUNT_KINDS.has(person.accountKind) && !byId) return "founders";
  return "unknown";
}

/**
 * B4: who invited whom, over every loaded member (filters do not apply).
 * A member hangs under their inviter when the inviter is loaded; everyone
 * else is a root in one of four groups. Empty groups are omitted. Every
 * member appears exactly once. Invite loops (bad data) are broken by
 * repeatedly taking the earliest-joined member still unplaced as a root
 * under "outside" and placing their branch, so the walk always ends.
 */
export function buildInviteTree(graph: TrustGraph): InviteTreeRoot[] {
  const childIdsByParentId = new Map<string, string[]>();
  const rootIdsByGroup = new Map<InviteTreeGroup, string[]>();
  const sortedPeople = [...graph.people].sort(compareByJoined);

  for (const person of sortedPeople) {
    const inviterId = inviterIdOf(graph, person);
    if (inviterId) {
      const siblings = childIdsByParentId.get(inviterId) ?? [];
      siblings.push(person.id);
      childIdsByParentId.set(inviterId, siblings);
    } else {
      const group = rootGroupOf(person);
      const groupRootIds = rootIdsByGroup.get(group) ?? [];
      groupRootIds.push(person.id);
      rootIdsByGroup.set(group, groupRootIds);
    }
  }

  const placedIds = new Set<string>();
  const buildNode = (personId: string): InviteTreeNode => {
    placedIds.add(personId);
    const children = (childIdsByParentId.get(personId) ?? [])
      .filter((childId) => !placedIds.has(childId))
      .map(buildNode);
    return { personId, children, invitedCount: children.length };
  };

  const nodesByGroup = new Map<InviteTreeGroup, InviteTreeNode[]>();
  for (const group of INVITE_TREE_GROUPS) {
    nodesByGroup.set(group, (rootIdsByGroup.get(group) ?? []).map(buildNode));
  }

  // Anyone still unplaced hangs off an invite loop. Walk people earliest
  // joined first: the first one still unplaced becomes a root under
  // "outside" and their branch is placed with them; repeat until none remain.
  const outsideNodes = nodesByGroup.get("outside") ?? [];
  for (const person of sortedPeople) {
    if (!placedIds.has(person.id)) outsideNodes.push(buildNode(person.id));
  }
  nodesByGroup.set("outside", outsideNodes);

  return INVITE_TREE_GROUPS.map((group) => ({
    group,
    nodes: nodesByGroup.get(group) ?? [],
  })).filter((root) => root.nodes.length > 0);
}

function findAncestors(
  nodes: InviteTreeNode[],
  personId: string,
  ancestorIds: string[],
): string[] | null {
  for (const node of nodes) {
    if (node.personId === personId) return ancestorIds;
    const found = findAncestors(node.children, personId, [
      ...ancestorIds,
      node.personId,
    ]);
    if (found) return found;
  }
  return null;
}

/** Ancestor member ids of `personId`, root first, so the tree can open along
 *  the path. Empty when the member is a root or is missing. */
export function pathToPerson(
  roots: InviteTreeRoot[],
  personId: string,
): string[] {
  for (const root of roots) {
    const found = findAncestors(root.nodes, personId, []);
    if (found) return found;
  }
  return [];
}

/** The group a member sits under, or null when the member is missing. */
export function groupOfPerson(
  roots: InviteTreeRoot[],
  personId: string,
): InviteTreeGroup | null {
  for (const root of roots) {
    if (findAncestors(root.nodes, personId, [])) return root.group;
  }
  return null;
}

/** `expandedIds` plus every branch that hides `personId`: its group and its
 *  ancestors. With `shouldOpenPerson` the member's own invitees open too.
 *  Returns the same set when nothing changes. */
export function expandPathTo(
  roots: InviteTreeRoot[],
  expandedIds: ReadonlySet<string>,
  personId: string,
  shouldOpenPerson: boolean,
): ReadonlySet<string> {
  const group = groupOfPerson(roots, personId);
  if (!group) return expandedIds;
  const idsToOpen = [
    inviteTreeGroupItemId(group),
    ...pathToPerson(roots, personId),
  ];
  if (shouldOpenPerson) idsToOpen.push(personId);
  if (idsToOpen.every((id) => expandedIds.has(id))) return expandedIds;
  return new Set([...expandedIds, ...idsToOpen]);
}

function appendVisibleNodes(
  nodes: InviteTreeNode[],
  parentId: string,
  level: number,
  expandedIds: ReadonlySet<string>,
  items: InviteTreeVisibleItem[],
): void {
  for (const node of nodes) {
    const isExpandable = node.children.length > 0;
    items.push({ id: node.personId, parentId, level, isExpandable });
    if (isExpandable && expandedIds.has(node.personId)) {
      appendVisibleNodes(
        node.children,
        node.personId,
        level + 1,
        expandedIds,
        items,
      );
    }
  }
}

/** Every row currently on screen, top to bottom, for arrow-key moves.
 *  Group headings sit at level 1 and their members start at level 2. */
export function listVisibleTreeItems(
  roots: InviteTreeRoot[],
  expandedIds: ReadonlySet<string>,
): InviteTreeVisibleItem[] {
  const items: InviteTreeVisibleItem[] = [];
  for (const root of roots) {
    const groupItemId = inviteTreeGroupItemId(root.group);
    items.push({
      id: groupItemId,
      parentId: null,
      level: 1,
      isExpandable: true,
    });
    if (expandedIds.has(groupItemId)) {
      appendVisibleNodes(root.nodes, groupItemId, 2, expandedIds, items);
    }
  }
  return items;
}

/** The tree's view state, shared by the tree and its rows. */
export interface InviteTreeViewState {
  focusId: string;
  selectedId: string | null;
  /** The one item in the tab order (roving tabindex). */
  activeId: string;
  expandedIds: ReadonlySet<string>;
}

/** A tiny external store: each row subscribes to the few flags it shows,
 *  so moving the tab stop or folding a branch re-renders only the rows
 *  whose flags changed. */
export interface InviteTreeStore {
  getState: () => InviteTreeViewState;
  update: (
    updater: (current: InviteTreeViewState) => InviteTreeViewState,
  ) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createInviteTreeStore(
  initialState: InviteTreeViewState,
): InviteTreeStore {
  let state = initialState;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    update: (updater) => {
      const next = updater(state);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** `expandedIds` with `itemId` flipped between open and folded. */
export function toggleExpanded(
  expandedIds: ReadonlySet<string>,
  itemId: string,
): ReadonlySet<string> {
  const next = new Set(expandedIds);
  if (!next.delete(itemId)) next.add(itemId);
  return next;
}
