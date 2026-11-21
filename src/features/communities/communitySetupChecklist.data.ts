/** The setup checklist items, in the order the card lists them. */
export const SETUP_CHECKLIST_ITEM_IDS = [
  "cover",
  "avatar",
  "welcome",
  "tags",
  "coSteward",
  "invite",
  "firstPost",
] as const;

export type SetupChecklistItemId = (typeof SETUP_CHECKLIST_ITEM_IDS)[number];

function itemCopy(id: SetupChecklistItemId): {
  titleKey: string;
  bodyKey: string;
} {
  return {
    titleKey: `communities:detail.setupChecklist.item.${id}.title`,
    bodyKey: `communities:detail.setupChecklist.item.${id}.body`,
  };
}

/** The title and body keys of each checklist item. */
export const SETUP_CHECKLIST_ITEM_COPY: Record<
  SetupChecklistItemId,
  { titleKey: string; bodyKey: string }
> = {
  cover: itemCopy("cover"),
  avatar: itemCopy("avatar"),
  welcome: itemCopy("welcome"),
  tags: itemCopy("tags"),
  coSteward: itemCopy("coSteward"),
  invite: itemCopy("invite"),
  firstPost: itemCopy("firstPost"),
};

/** The co-steward body shown while the founder is still the only member. */
export const SETUP_CHECKLIST_CO_STEWARD_WAITING_KEY =
  "communities:detail.setupChecklist.item.coSteward.bodyWaiting";

/** The hub search that opens the moderation tools on the members panel. */
export const SETUP_CHECKLIST_MEMBERS_SEARCH = "?tab=modtools&mod=members";

/** The hub search that opens the moderation tools on the invites panel. */
export const SETUP_CHECKLIST_INVITES_SEARCH = "?tab=modtools&mod=invites";
