import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoListCulturalIdeas,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { IdeasTab } from "./IdeasTab";

// TestProviders forces demo mode, so the tab reads and writes the demo
// cultural production store: six seeded ideas, newest first.

const PAGE = "/admin/cultural-production";
const BINGO_TITLE = "Drag bingo at a bar in Anjos";
const EUROVISION_TITLE = "Quiz night: the Eurovision special";

/** Prints the URL's query, so a test can read the filters it wrote. */
function SearchProbe() {
  const location = useLocation();
  return <output data-testid="search">{location.search}</output>;
}

async function renderTab(entry = PAGE) {
  const onOpenIdea = vi.fn();
  render(
    <TestProviders initialEntries={[entry]}>
      <IdeasTab onOpenIdea={onOpenIdea} />
      <SearchProbe />
    </TestProviders>,
  );
  await awaitCatalog("admin");
  return { onOpenIdea, user: userEvent.setup() };
}

function search(): string {
  return screen.getByTestId("search").textContent ?? "";
}

function openButtons(): HTMLElement[] {
  return screen.queryAllByRole("button", { name: /^Open the idea / });
}

async function cardOf(title: string): Promise<HTMLElement> {
  const button = await screen.findByRole("button", {
    name: `Open the idea ${title}`,
  });
  const card = button.closest("article");
  if (card === null) throw new Error(`The card for ${title} is missing`);
  return card;
}

async function chooseOption(
  user: UserEvent,
  scope: HTMLElement,
  selectName: RegExp,
  optionLabel: string,
) {
  await user.click(within(scope).getByRole("button", { name: selectName }));
  await user.click(await screen.findByRole("option", { name: optionLabel }));
}

async function openAddDialog(user: UserEvent): Promise<HTMLElement> {
  await user.click(await screen.findByRole("button", { name: "Add idea" }));
  return screen.findByRole("dialog", { name: "Add an idea" });
}

function submitButton(dialog: HTMLElement): HTMLElement {
  const submit = within(dialog)
    .getAllByRole("button", { name: "Add idea" })
    .at(-1);
  if (submit === undefined) throw new Error("The Add idea button is missing");
  return submit;
}

beforeEach(() => {
  resetDemoCulturalProduction();
});

describe("IdeasTab", () => {
  it("lists the six demo ideas with their counts", async () => {
    await renderTab();
    const bingoCard = await cardOf(BINGO_TITLE);
    expect(openButtons()).toHaveLength(6);
    expect(screen.getByText("6 ideas")).toBeInTheDocument();
    expect(within(bingoCard).getByText("3 people are in")).toBeInTheDocument();
    expect(within(bingoCard).getByText("2 comments")).toBeInTheDocument();
    expect(within(bingoCard).getByText("1 task")).toBeInTheDocument();
    const eurovisionCard = await cardOf(EUROVISION_TITLE);
    expect(
      within(eurovisionCard).getByText("4 people are in"),
    ).toBeInTheDocument();
    expect(within(eurovisionCard).getByText("1 comment")).toBeInTheDocument();
    expect(within(eurovisionCard).getByText("3 tasks")).toBeInTheDocument();
  });

  it("filters by status and event type through the URL", async () => {
    const { user } = await renderTab();
    await cardOf(BINGO_TITLE);
    await user.click(screen.getByRole("button", { name: "Planned" }));
    expect(search()).toContain("ideaStatus=planned");
    await waitFor(() => expect(openButtons()).toHaveLength(2));
    expect(screen.getByText("2 ideas")).toBeInTheDocument();
    await chooseOption(
      user,
      screen.getByRole("group", { name: "Filter ideas" }),
      /^Event type/,
      "Quiz night",
    );
    expect(search()).toContain("eventType=quiz_night");
    await waitFor(() => expect(openButtons()).toHaveLength(1));
    expect(
      screen.getByRole("button", { name: `Open the idea ${EUROVISION_TITLE}` }),
    ).toBeInTheDocument();
  });

  it("clears both filters", async () => {
    const { user } = await renderTab(
      `${PAGE}?ideaStatus=parked&eventType=party`,
    );
    expect(
      await screen.findByText("No ideas match these filters"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(search()).not.toContain("ideaStatus");
    expect(search()).not.toContain("eventType");
    await waitFor(() => expect(openButtons()).toHaveLength(6));
  });

  it("opens the drawer from a card", async () => {
    const { onOpenIdea, user } = await renderTab();
    await user.click(
      await screen.findByRole("button", {
        name: `Open the idea ${BINGO_TITLE}`,
      }),
    );
    expect(onOpenIdea).toHaveBeenCalledWith("demo-idea-drag-bingo");
  });

  it("adds an idea and opens it", async () => {
    const { onOpenIdea, user } = await renderTab();
    await cardOf(BINGO_TITLE);
    const dialog = await openAddDialog(user);
    await user.type(
      within(dialog).getByRole("textbox", { name: /^Title/ }),
      "Karaoke in Bairro Alto",
    );
    await chooseOption(user, dialog, /^Event type/, "Music night");
    await user.click(submitButton(dialog));
    await waitFor(() => expect(onOpenIdea).toHaveBeenCalledTimes(1));
    const added = demoListCulturalIdeas().items.find(
      (idea) => idea.title === "Karaoke in Bairro Alto",
    );
    expect(added?.eventType).toBe("music_night");
    expect(added?.status).toBe("new");
    expect(onOpenIdea).toHaveBeenCalledWith(added?.id);
    expect(await screen.findByText("Idea added")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(openButtons()).toHaveLength(7));
  });

  it("names a missing title under the title field", async () => {
    const { onOpenIdea, user } = await renderTab();
    await cardOf(BINGO_TITLE);
    const dialog = await openAddDialog(user);
    await chooseOption(user, dialog, /^Event type/, "Quiz night");
    await user.click(submitButton(dialog));
    const refusal = await within(dialog).findByRole("alert");
    expect(refusal).toHaveTextContent("Give it a title");
    const titleInput = within(dialog).getByRole("textbox", { name: /^Title/ });
    expect(titleInput.getAttribute("aria-describedby")).toContain(refusal.id);
    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(demoListCulturalIdeas().items).toHaveLength(6);
    expect(onOpenIdea).not.toHaveBeenCalled();
  });
});
