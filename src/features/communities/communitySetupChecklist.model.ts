import { communityPath } from "../../app/routeMap";
import type { CommunitySetupChecklistDTO } from "./api/communities.api";
import type { EditableCommunityFields } from "./api/communities.adapters";
import { composerFocusSearch } from "./composerFocusRequest";
import type { EditCommunityFocusField } from "./editCommunityFocusField";
import { isStaffRole } from "./communityStaffRole";
import type { CommunityRole } from "./membership.types";
import {
  SETUP_CHECKLIST_INVITES_SEARCH,
  SETUP_CHECKLIST_ITEM_IDS,
  SETUP_CHECKLIST_MEMBERS_SEARCH,
  type SetupChecklistItemId,
} from "./communitySetupChecklist.data";

/** What a checklist item opens when the steward picks it. */
export type SetupChecklistAction =
  | { kind: "edit"; field: EditCommunityFocusField }
  | { kind: "link"; to: string };

export interface SetupChecklistItem {
  id: SetupChecklistItemId;
  isDone: boolean;
  action: SetupChecklistAction;
  /** The co-steward item is open and the founder is still the only member. */
  isWaitingForMembers: boolean;
}

export interface SetupChecklistView {
  items: SetupChecklistItem[];
  doneCount: number;
  totalCount: number;
}

export interface SetupChecklistInput {
  slug: string;
  status: CommunitySetupChecklistDTO | null;
  role: CommunityRole | null;
  isTopLevel: boolean;
  isFrozen: boolean;
  isArchived: boolean;
  editable: Pick<
    EditableCommunityFields,
    "coverImageUrl" | "avatarImageUrl" | "welcomeMessage" | "tags" | "features"
  > | null;
  memberCount: number | undefined;
  hasHubTabs: boolean;
}

const DISCUSSION_FEATURE = "discussion";

/** The items whose action opens a hub tab (Mod tools or the composer). */
const HUB_TAB_ITEM_IDS: ReadonlySet<SetupChecklistItemId> =
  new Set<SetupChecklistItemId>(["coSteward", "invite", "firstPost"]);

function hubLink(slug: string, search: string): SetupChecklistAction {
  return { kind: "link", to: `${communityPath(slug)}${search}` };
}

/**
 * The setup checklist a steward sees on a new community, or null when the
 * card stays hidden: outside the staff, on a space, on a frozen or archived
 * community, once dismissed, or once every item is done. A community page
 * with no hub tabs lists only the items the edit modal can finish, and the
 * progress counts those alone.
 */
export function buildSetupChecklist(
  input: SetupChecklistInput,
): SetupChecklistView | null {
  const { status, editable } = input;
  if (status === null || editable === null) return null;
  if (!isStaffRole(input.role)) return null;
  if (!input.isTopLevel || input.isFrozen || input.isArchived) return null;
  if (status.isDismissed) return null;

  const memberTotal = input.memberCount ?? 0;
  const isDoneById: Record<SetupChecklistItemId, boolean> = {
    cover: editable.coverImageUrl.trim() !== "",
    avatar: editable.avatarImageUrl.trim() !== "",
    welcome: editable.welcomeMessage.trim() !== "",
    tags: editable.tags.length >= 1,
    coSteward: status.staffCount > 1,
    invite: memberTotal > 1,
    firstPost: status.postCount >= 1,
  };
  const actionById: Record<SetupChecklistItemId, SetupChecklistAction> = {
    cover: { kind: "edit", field: "cover" },
    avatar: { kind: "edit", field: "avatar" },
    welcome: { kind: "edit", field: "welcome" },
    tags: { kind: "edit", field: "tags" },
    coSteward: hubLink(input.slug, SETUP_CHECKLIST_MEMBERS_SEARCH),
    invite: hubLink(input.slug, SETUP_CHECKLIST_INVITES_SEARCH),
    firstPost: hubLink(input.slug, composerFocusSearch()),
  };
  const hasDiscussion = editable.features.includes(DISCUSSION_FEATURE);
  const isListed = (itemId: SetupChecklistItemId) =>
    (input.hasHubTabs || !HUB_TAB_ITEM_IDS.has(itemId)) &&
    (itemId !== "firstPost" || hasDiscussion);

  const items: SetupChecklistItem[] = SETUP_CHECKLIST_ITEM_IDS.filter(
    isListed,
  ).map((itemId) => ({
    id: itemId,
    isDone: isDoneById[itemId],
    action: actionById[itemId],
    isWaitingForMembers:
      itemId === "coSteward" && !isDoneById.coSteward && memberTotal <= 1,
  }));

  const doneCount = items.filter((item) => item.isDone).length;
  if (doneCount === items.length) return null;
  return { items, doneCount, totalCount: items.length };
}
