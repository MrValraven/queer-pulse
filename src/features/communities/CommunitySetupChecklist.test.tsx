import { createRef, type ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { communityPath } from "../../app/routeMap";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { composerFocusSearch } from "./composerFocusRequest";
import {
  SETUP_CHECKLIST_INVITES_SEARCH,
  SETUP_CHECKLIST_ITEM_IDS,
  SETUP_CHECKLIST_MEMBERS_SEARCH,
  type SetupChecklistItemId,
} from "./communitySetupChecklist.data";
import type {
  SetupChecklistAction,
  SetupChecklistView,
} from "./communitySetupChecklist.model";
import type { EditCommunityFocusField } from "./editCommunityFocusField";
import { CommunitySetupChecklist } from "./CommunitySetupChecklist";

const showToast = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

const dismissMutate = vi.fn();
vi.mock("./api/useDismissSetupChecklist", () => ({
  useDismissSetupChecklist: () => ({ mutate: dismissMutate, isPending: false }),
}));

const SLUG = "club";

interface DismissHandlers {
  onSuccess: () => void;
  onError: (error: unknown) => void;
}

/** The variables and handlers of the first dismissal call, failing the test
 *  by name when Dismiss checklist never called it. */
function firstDismissCall(): { variables: unknown; handlers: DismissHandlers } {
  const firstCall = dismissMutate.mock.calls[0];
  if (firstCall === undefined) {
    throw new Error("Dismiss checklist never called the dismissal");
  }
  return {
    variables: firstCall[0],
    handlers: firstCall[1] as DismissHandlers,
  };
}

const ACTION_BY_ID: Record<SetupChecklistItemId, SetupChecklistAction> = {
  cover: { kind: "edit", field: "cover" },
  avatar: { kind: "edit", field: "avatar" },
  welcome: { kind: "edit", field: "welcome" },
  tags: { kind: "edit", field: "tags" },
  coSteward: {
    kind: "link",
    to: `${communityPath(SLUG)}${SETUP_CHECKLIST_MEMBERS_SEARCH}`,
  },
  invite: {
    kind: "link",
    to: `${communityPath(SLUG)}${SETUP_CHECKLIST_INVITES_SEARCH}`,
  },
  firstPost: {
    kind: "link",
    to: `${communityPath(SLUG)}${composerFocusSearch()}`,
  },
};

/** A seven item view with the given items done. */
function buildView({
  doneIds = ["cover", "avatar"],
  isWaitingForMembers = false,
}: {
  doneIds?: SetupChecklistItemId[];
  isWaitingForMembers?: boolean;
} = {}): SetupChecklistView {
  const items = SETUP_CHECKLIST_ITEM_IDS.map((itemId) => ({
    id: itemId,
    isDone: doneIds.includes(itemId),
    action: ACTION_BY_ID[itemId],
    isWaitingForMembers: itemId === "coSteward" && isWaitingForMembers,
  }));
  return {
    items,
    doneCount: items.filter((item) => item.isDone).length,
    totalCount: items.length,
  };
}

/** Stands in for the start of the hub that follows the card on the page. */
const hubStartRef = createRef<HTMLDivElement>();

function checklistTree(
  view: SetupChecklistView | null,
  onOpenEditAt: (field: EditCommunityFocusField) => void = vi.fn(),
): ReactNode {
  return (
    <TestProviders>
      <MotionProvider>
        <div data-testid="checklist-host">
          <CommunitySetupChecklist
            slug={SLUG}
            communityName="The Club"
            view={view}
            onOpenEditAt={onOpenEditAt}
            focusAfterDismissRef={hubStartRef}
          />
        </div>
        <div ref={hubStartRef} tabIndex={-1} data-testid="hub-start" />
      </MotionProvider>
    </TestProviders>
  );
}

async function renderChecklist(
  view: SetupChecklistView | null,
  onOpenEditAt?: (field: EditCommunityFocusField) => void,
) {
  const result = render(checklistTree(view, onOpenEditAt));
  await awaitCatalog("communities");
  return result;
}

function checklistCard() {
  return screen.getByRole("region", { name: "Finish setting up The Club" });
}

const ITEM_TITLES = [
  "Add a cover image",
  "Add a community mark",
  "Write a welcome message",
  "Add tags",
  "Add a co-steward",
  "Invite your first members",
  "Write the first post",
];

describe("CommunitySetupChecklist", () => {
  beforeEach(() => {
    showToast.mockClear();
    dismissMutate.mockClear();
  });

  it("shows the progress and each item's title", async () => {
    await renderChecklist(buildView());
    const card = checklistCard();
    expect(within(card).getByText("2 of 7 done")).toBeTruthy();
    for (const title of ITEM_TITLES) {
      expect(within(card).getByText(title)).toBeTruthy();
    }
    expect(within(card).getAllByRole("listitem")).toHaveLength(7);
  });

  it("ticks done items and keeps them listed without an action", async () => {
    await renderChecklist(buildView());
    const coverRow = within(checklistCard())
      .getByText("Add a cover image")
      .closest("li");
    expect(coverRow).not.toBeNull();
    const row = within(coverRow as HTMLElement);
    expect(row.queryByRole("button")).toBeNull();
    expect(row.queryByRole("link")).toBeNull();
    expect(row.getByText("Done")).toBeTruthy();
    expect(row.queryByText("Still to do")).toBeNull();
  });

  it("opens the edit modal at the field for an edit item", async () => {
    const onOpenEditAt = vi.fn();
    await renderChecklist(
      buildView({ doneIds: ["avatar", "welcome"] }),
      onOpenEditAt,
    );
    fireEvent.click(
      within(checklistCard()).getByRole("button", {
        name: "Add a cover image",
      }),
    );
    expect(onOpenEditAt).toHaveBeenCalledTimes(1);
    expect(onOpenEditAt).toHaveBeenCalledWith("cover");
  });

  it("links the co-steward item to the members pane", async () => {
    await renderChecklist(buildView());
    const link = within(checklistCard()).getByRole("link", {
      name: "Add a co-steward",
    });
    expect(link.getAttribute("href")).toBe(
      "/community/club?tab=modtools&mod=members",
    );
  });

  it("says someone has to join first while the founder is alone", async () => {
    await renderChecklist(buildView({ isWaitingForMembers: true }));
    const card = checklistCard();
    expect(
      within(card).getByText(
        "Someone has to join before you can make them a co-steward.",
      ),
    ).toBeTruthy();
    expect(
      within(card).queryByText(
        "Share the running of the community with someone you trust.",
      ),
    ).toBeNull();
  });

  it("calls the dismissal for this community on Dismiss checklist", async () => {
    await renderChecklist(buildView());
    fireEvent.click(
      within(checklistCard()).getByRole("button", {
        name: "Dismiss checklist",
      }),
    );
    expect(dismissMutate).toHaveBeenCalledTimes(1);
    expect(firstDismissCall().variables).toEqual({ slug: "club" });
  });

  it("toasts the space refusal line when the dismissal is refused", async () => {
    await renderChecklist(buildView());
    fireEvent.click(
      within(checklistCard()).getByRole("button", {
        name: "Dismiss checklist",
      }),
    );
    const { handlers } = firstDismissCall();
    act(() => {
      handlers.onError(
        new ApiError(400, "x", {
          code: "setup_checklist_unavailable_for_spaces",
        }),
      );
    });
    expect(showToast).toHaveBeenCalledWith(
      "Spaces have no setup checklist, so there is nothing to dismiss here.",
      "error",
    );
  });

  it("still toasts the dismissal outcome after the card folds away", async () => {
    const { rerender } = await renderChecklist(buildView());
    fireEvent.click(
      within(checklistCard()).getByRole("button", {
        name: "Dismiss checklist",
      }),
    );
    const { handlers } = firstDismissCall();
    rerender(checklistTree(null));
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Finish setting up The Club" }),
      ).toBeNull(),
    );
    act(() => {
      handlers.onError(
        new ApiError(400, "x", {
          code: "setup_checklist_unavailable_for_spaces",
        }),
      );
    });
    expect(showToast).toHaveBeenCalledWith(
      "Spaces have no setup checklist, so there is nothing to dismiss here.",
      "error",
    );
    handlers.onSuccess();
    expect(showToast).toHaveBeenCalledWith(
      "Checklist dismissed. Everything on it stays in your community settings and Mod tools.",
      "success",
    );
  });

  it("moves focus to the hub start on Dismiss checklist", async () => {
    await renderChecklist(buildView());
    const dismissButton = within(checklistCard()).getByRole("button", {
      name: "Dismiss checklist",
    });
    dismissButton.focus();
    fireEvent.click(dismissButton);
    expect(document.activeElement).toBe(screen.getByTestId("hub-start"));
  });

  it("returns focus to Dismiss checklist when the dismissal fails", async () => {
    const { rerender } = await renderChecklist(buildView());
    const dismissButton = within(checklistCard()).getByRole("button", {
      name: "Dismiss checklist",
    });
    dismissButton.focus();
    fireEvent.click(dismissButton);
    const { handlers } = firstDismissCall();
    rerender(checklistTree(null));
    expect(document.activeElement).toBe(screen.getByTestId("hub-start"));

    act(() => {
      handlers.onError(
        new ApiError(400, "x", {
          code: "setup_checklist_unavailable_for_spaces",
        }),
      );
    });
    rerender(checklistTree(buildView()));

    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(checklistCard()).getByRole("button", {
          name: "Dismiss checklist",
        }),
      ),
    );
  });

  it("folds away when the view turns null", async () => {
    const { rerender } = await renderChecklist(buildView());
    expect(checklistCard()).toBeTruthy();
    rerender(checklistTree(null));
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Finish setting up The Club" }),
      ).toBeNull(),
    );
  });

  it("renders nothing for a null view", async () => {
    await renderChecklist(null);
    expect(screen.getByTestId("checklist-host").childElementCount).toBe(0);
  });
});
