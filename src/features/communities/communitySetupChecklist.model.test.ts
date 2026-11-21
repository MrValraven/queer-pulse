import { describe, expect, it } from "vitest";
import { SETUP_CHECKLIST_ITEM_IDS } from "./communitySetupChecklist.data";
import {
  buildSetupChecklist,
  type SetupChecklistInput,
  type SetupChecklistView,
} from "./communitySetupChecklist.model";

const baseInput: SetupChecklistInput = {
  slug: "club",
  status: { isDismissed: false, staffCount: 1, postCount: 0 },
  role: "owner",
  isTopLevel: true,
  isFrozen: false,
  isArchived: false,
  editable: {
    coverImageUrl: "",
    avatarImageUrl: "",
    welcomeMessage: "",
    tags: [],
    features: ["discussion"],
  },
  memberCount: 1,
  hasHubTabs: true,
};

const completeInput: SetupChecklistInput = {
  ...baseInput,
  status: { isDismissed: false, staffCount: 2, postCount: 3 },
  editable: {
    coverImageUrl: "https://example.test/cover.jpg",
    avatarImageUrl: "https://example.test/avatar.jpg",
    welcomeMessage: "Glad you found us",
    tags: ["running"],
    features: ["discussion"],
  },
  memberCount: 5,
};

function requireView(view: SetupChecklistView | null): SetupChecklistView {
  expect(view).not.toBeNull();
  return view as SetupChecklistView;
}

function itemFor(view: SetupChecklistView, itemId: string) {
  const item = view.items.find((entry) => entry.id === itemId);
  expect(item).toBeDefined();
  return item!;
}

describe("buildSetupChecklist", () => {
  it("lists the seven items in the design order with their actions", () => {
    const view = requireView(buildSetupChecklist(baseInput));
    expect(view.items.map((item) => item.id)).toEqual([
      ...SETUP_CHECKLIST_ITEM_IDS,
    ]);
    expect(itemFor(view, "cover").action).toEqual({
      kind: "edit",
      field: "cover",
    });
    expect(itemFor(view, "avatar").action).toEqual({
      kind: "edit",
      field: "avatar",
    });
    expect(itemFor(view, "welcome").action).toEqual({
      kind: "edit",
      field: "welcome",
    });
    expect(itemFor(view, "tags").action).toEqual({
      kind: "edit",
      field: "tags",
    });
    expect(itemFor(view, "coSteward").action).toEqual({
      kind: "link",
      to: "/community/club?tab=modtools&mod=members",
    });
    expect(itemFor(view, "invite").action).toEqual({
      kind: "link",
      to: "/community/club?tab=modtools&mod=invites",
    });
    expect(itemFor(view, "firstPost").action).toEqual({
      kind: "link",
      to: "/community/club?compose=1",
    });
    expect(view.doneCount).toBe(0);
    expect(view.totalCount).toBe(7);
  });

  it("hides the card for a viewer outside the staff", () => {
    expect(buildSetupChecklist({ ...baseInput, role: "member" })).toBeNull();
    expect(buildSetupChecklist({ ...baseInput, role: null })).toBeNull();
  });

  it("shows the card to a co-owner and a mod", () => {
    expect(
      buildSetupChecklist({ ...baseInput, role: "co_owner" }),
    ).not.toBeNull();
    expect(buildSetupChecklist({ ...baseInput, role: "mod" })).not.toBeNull();
  });

  it("hides the card on a space, a frozen community and an archived one", () => {
    expect(buildSetupChecklist({ ...baseInput, isTopLevel: false })).toBeNull();
    expect(buildSetupChecklist({ ...baseInput, isFrozen: true })).toBeNull();
    expect(buildSetupChecklist({ ...baseInput, isArchived: true })).toBeNull();
  });

  it("hides the card once it is dismissed", () => {
    expect(
      buildSetupChecklist({
        ...baseInput,
        status: { isDismissed: true, staffCount: 1, postCount: 0 },
      }),
    ).toBeNull();
  });

  it("hides the card when the detail sends no checklist", () => {
    expect(buildSetupChecklist({ ...baseInput, status: null })).toBeNull();
  });

  it("hides the card when the editable fields are missing", () => {
    expect(buildSetupChecklist({ ...baseInput, editable: null })).toBeNull();
  });

  it("hides the card when every item is done", () => {
    expect(buildSetupChecklist(completeInput)).toBeNull();
  });

  it("brings the card back when a done item opens again", () => {
    const view = requireView(
      buildSetupChecklist({
        ...completeInput,
        editable: { ...completeInput.editable!, coverImageUrl: "" },
      }),
    );
    expect(view.doneCount).toBe(6);
    expect(view.totalCount).toBe(7);
    expect(itemFor(view, "cover").isDone).toBe(false);
  });

  it("counts a co-owner or mod beside the owner as a co-steward", () => {
    const view = requireView(
      buildSetupChecklist({
        ...baseInput,
        status: { isDismissed: false, staffCount: 2, postCount: 0 },
      }),
    );
    expect(itemFor(view, "coSteward").isDone).toBe(true);
    expect(itemFor(view, "coSteward").isWaitingForMembers).toBe(false);
  });

  it("keeps the co-steward item open and waiting while the founder is the only member", () => {
    const view = requireView(buildSetupChecklist(baseInput));
    const coSteward = itemFor(view, "coSteward");
    expect(coSteward.isDone).toBe(false);
    expect(coSteward.isWaitingForMembers).toBe(true);
    expect(coSteward.action.kind).toBe("link");
    expect(
      view.items
        .filter((item) => item.id !== "coSteward")
        .every((item) => !item.isWaitingForMembers),
    ).toBe(true);

    const withMembers = requireView(
      buildSetupChecklist({ ...baseInput, memberCount: 3 }),
    );
    expect(itemFor(withMembers, "coSteward").isWaitingForMembers).toBe(false);
  });

  it("counts invites as done only past one member", () => {
    const withOneMember = requireView(
      buildSetupChecklist({ ...baseInput, memberCount: 1 }),
    );
    expect(itemFor(withOneMember, "invite").isDone).toBe(false);

    const withTwoMembers = requireView(
      buildSetupChecklist({ ...baseInput, memberCount: 2 }),
    );
    expect(itemFor(withTwoMembers, "invite").isDone).toBe(true);

    const withUnknownCount = requireView(
      buildSetupChecklist({ ...baseInput, memberCount: undefined }),
    );
    expect(itemFor(withUnknownCount, "invite").isDone).toBe(false);
  });

  it("drops the first post item when the discussion feature is off", () => {
    const view = requireView(
      buildSetupChecklist({
        ...baseInput,
        editable: { ...baseInput.editable!, features: [] },
      }),
    );
    expect(view.totalCount).toBe(6);
    expect(view.items.map((item) => item.id)).not.toContain("firstPost");
  });

  it("reads a blank welcome message as open", () => {
    const view = requireView(
      buildSetupChecklist({
        ...baseInput,
        editable: { ...baseInput.editable!, welcomeMessage: "   " },
      }),
    );
    expect(itemFor(view, "welcome").isDone).toBe(false);
  });

  it("lists only the edit items where the hub has no tabs", () => {
    const view = requireView(
      buildSetupChecklist({ ...baseInput, hasHubTabs: false }),
    );
    expect(view.items.map((item) => item.id)).toEqual([
      "cover",
      "avatar",
      "welcome",
      "tags",
    ]);
    expect(view.items.every((item) => item.action.kind === "edit")).toBe(true);
    expect(view.doneCount).toBe(0);
    expect(view.totalCount).toBe(4);
  });

  it("counts the progress over the edit items alone where the hub has no tabs", () => {
    const view = requireView(
      buildSetupChecklist({
        ...baseInput,
        hasHubTabs: false,
        status: { isDismissed: false, staffCount: 2, postCount: 3 },
        editable: {
          ...baseInput.editable!,
          coverImageUrl: "https://example.test/cover.jpg",
        },
        memberCount: 5,
      }),
    );
    expect(view.doneCount).toBe(1);
    expect(view.totalCount).toBe(4);
  });

  it("hides the card where the hub has no tabs once the edit items are done", () => {
    expect(
      buildSetupChecklist({
        ...completeInput,
        hasHubTabs: false,
        status: { isDismissed: false, staffCount: 1, postCount: 0 },
        memberCount: 1,
      }),
    ).toBeNull();
  });
});
