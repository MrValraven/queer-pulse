import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoGetCulturalIdea,
  demoListCulturalIdeas,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { IdeaDrawer } from "./IdeaDrawer";

// TestProviders forces demo mode, so the drawer reads and writes the demo
// cultural production store. TestProviders has no MotionProvider, and the
// lists grow and fold through motion, so the harness adds one. The drag
// bingo idea is backed by the viewer, Nuno and Carla, and has two comments.

const BINGO_IDEA_ID = "demo-idea-drag-bingo";
const BINGO_TASK_TITLE = "Ask three bars in Anjos about a Tuesday night";

function renderDrawer(ideaId: string) {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const onOpenTask = vi.fn();
  render(
    <TestProviders>
      <MotionProvider>
        <IdeaDrawer ideaId={ideaId} onClose={onClose} onOpenTask={onOpenTask} />
      </MotionProvider>
    </TestProviders>,
  );
  return { user, onClose, onOpenTask };
}

async function findDrawer() {
  return screen.findByRole("dialog", { name: "Idea" });
}

describe("IdeaDrawer (demo)", () => {
  beforeEach(async () => {
    resetDemoCulturalProduction();
    await awaitCatalog("admin");
  });

  it("shows the drag bingo idea with three backers and two comments", async () => {
    renderDrawer(BINGO_IDEA_ID);
    expect(
      await screen.findByRole("heading", {
        name: "Drag bingo at a bar in Anjos",
      }),
    ).toBeInTheDocument();
    const backers = screen.getByRole("region", { name: "Who's in" });
    expect(within(backers).getByText("3 people are in")).toBeInTheDocument();
    expect(within(backers).getByText("You")).toBeInTheDocument();
    expect(within(backers).getByText("Nuno Alves")).toBeInTheDocument();
    expect(within(backers).getByText("Carla Pinto")).toBeInTheDocument();
    const comments = screen.getByRole("region", { name: "Comments" });
    expect(within(comments).getAllByRole("article")).toHaveLength(2);
    expect(
      within(comments).getByText(
        "I know two queens who host bingo and they would love a Tuesday slot",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(BINGO_TASK_TITLE)).toBeInTheDocument();
  });

  it("toggles I'm in and updates the count", async () => {
    const { user } = renderDrawer(BINGO_IDEA_ID);
    const toggle = await screen.findByRole("button", { name: "I'm in" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    await user.click(toggle);
    const backers = screen.getByRole("region", { name: "Who's in" });
    expect(
      await within(backers).findByText("2 people are in"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I'm in" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(demoGetCulturalIdea(BINGO_IDEA_ID).isBackedByMe).toBe(false);
  });

  it("posts a comment and clears the field", async () => {
    const { user } = renderDrawer(BINGO_IDEA_ID);
    const field = await screen.findByRole("textbox", { name: "Add a comment" });
    await user.type(field, "I can bring the bingo cards");
    await user.click(screen.getByRole("button", { name: "Post comment" }));
    const comments = screen.getByRole("region", { name: "Comments" });
    expect(
      await within(comments).findByText("I can bring the bingo cards"),
    ).toBeInTheDocument();
    await waitFor(() => expect(field).toHaveValue(""));
    expect(demoGetCulturalIdea(BINGO_IDEA_ID).comments).toHaveLength(3);
  });

  it("refuses a blank comment by disabling Post comment", async () => {
    const { user } = renderDrawer(BINGO_IDEA_ID);
    const field = await screen.findByRole("textbox", { name: "Add a comment" });
    const post = screen.getByRole("button", { name: "Post comment" });
    expect(post).toHaveAttribute("aria-disabled", "true");
    await user.type(field, "   ");
    expect(post).toHaveAttribute("aria-disabled", "true");
    await user.click(post);
    expect(demoGetCulturalIdea(BINGO_IDEA_ID).comments).toHaveLength(2);
  });

  it("changes the status from the drawer", async () => {
    const { user } = renderDrawer(BINGO_IDEA_ID);
    await findDrawer();
    await user.click(await screen.findByRole("button", { name: "Status" }));
    await user.click(screen.getByRole("option", { name: "Planned" }));
    await waitFor(() =>
      expect(demoGetCulturalIdea(BINGO_IDEA_ID).status).toBe("planned"),
    );
    expect(screen.getByRole("button", { name: "Status" })).toHaveTextContent(
      "Planned",
    );
  });

  it("adds a task linked to the idea", async () => {
    const { user } = renderDrawer(BINGO_IDEA_ID);
    const linkedTasks = await screen.findByRole("region", {
      name: "Tasks for this idea",
    });
    await user.click(
      within(linkedTasks).getByRole("button", { name: "Add task" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Add a task" });
    await user.type(
      within(dialog).getByRole("textbox", { name: /Title/ }),
      "Book a drag host for the bingo",
    );
    await user.click(within(dialog).getByRole("button", { name: "Add task" }));
    expect(
      await within(linkedTasks).findByText("Book a drag host for the bingo"),
    ).toBeInTheDocument();
    expect(
      demoGetCulturalIdea(BINGO_IDEA_ID).linkedTasks.map((task) => task.title),
    ).toContain("Book a drag host for the bingo");
  });

  it("deletes the idea after confirming and closes", async () => {
    const { user, onClose } = renderDrawer(BINGO_IDEA_ID);
    const drawer = await findDrawer();
    await user.click(
      await within(drawer).findByRole("button", { name: "Delete idea" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Delete this idea?",
    });
    await user.click(
      within(confirm).getByRole("button", { name: "Delete idea" }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Idea deleted")).toBeInTheDocument();
    expect(demoListCulturalIdeas().items.map((idea) => idea.id)).not.toContain(
      BINGO_IDEA_ID,
    );
  });

  it("shows not found for an unknown id", async () => {
    const { user, onClose } = renderDrawer("demo-idea-never-there");
    expect(
      await screen.findByText("This idea isn't here anymore"),
    ).toBeInTheDocument();
    const closeButtons = screen.getAllByRole("button", { name: "Close" });
    expect(closeButtons).toHaveLength(2);
    const bodyClose = closeButtons.at(-1);
    if (bodyClose === undefined) throw new Error("No close button in the body");
    await user.click(bodyClose);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
