import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { StudioHelpPage } from "./StudioHelpPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

async function renderHelp() {
  render(
    <TestProviders initialEntries={["/studio/help"]}>
      <StudioHelpPage />
    </TestProviders>,
  );
  await awaitCatalog("studio");
}

beforeEach(() => {
  showcase.isOn = false;
});

describe("Studio help (live)", () => {
  it("answers what Studio does today and keeps money out", async () => {
    await renderHelp();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /how can we help/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "How do I dispute a takedown?" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Where does my money actually go?",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/all systems operational/i),
    ).not.toBeInTheDocument();
  });

  it("points the contact cards at the contact form, the inbox and QueerPulse help", async () => {
    await renderHelp();
    expect(
      await screen.findByRole("link", { name: /contact our team/i }),
    ).toHaveAttribute("href", "/about/contact");
    expect(
      screen.getByRole("link", { name: /email our team/i }),
    ).toHaveAttribute("href", "mailto:hello@queerpulse.com");
    expect(
      screen.getByRole("link", { name: /open queerpulse help/i }),
    ).toHaveAttribute("href", "/about/help");
  });

  it("filters the answers as you type and counts what is left", async () => {
    await renderHelp();
    const search = await screen.findByRole("searchbox", {
      name: "Search Studio help",
    });
    fireEvent.change(search, { target: { value: "dispute" } });
    expect(await screen.findByText(/answers? match/)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", {
          name: "What is Studio, and who can use it?",
        }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "How do I dispute a takedown?" }),
    ).toBeInTheDocument();
  });

  it("opens every matching answer while a search is on", async () => {
    await renderHelp();
    const search = await screen.findByRole("searchbox", {
      name: "Search Studio help",
    });
    fireEvent.change(search, { target: { value: "dispute" } });
    const question = await screen.findByRole("button", {
      name: "How do I dispute a takedown?",
    });
    expect(question).toHaveAttribute("aria-expanded", "true");
  });

  it("says so when nothing matches, and Clear search brings everything back", async () => {
    await renderHelp();
    const search = await screen.findByRole("searchbox", {
      name: "Search Studio help",
    });
    fireEvent.change(search, { target: { value: "zzzz" } });
    expect(
      await screen.findByRole("heading", { name: 'Nothing matches "zzzz"' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(
      await screen.findByRole("button", {
        name: "What is Studio, and who can use it?",
      }),
    ).toBeInTheDocument();
  });

  it("hides Clear search until there is a query, and keeps the empty title while it folds", async () => {
    await renderHelp();
    const search = await screen.findByRole("searchbox", {
      name: "Search Studio help",
    });
    // The button stays mounted so it can fold in and out; an inert
    // wrapper keeps it out of reach while there is no query. Testing Library
    // still lists inert content, so the test reads the wrapper.
    const clearButton = screen.getByRole("button", { name: "Clear search" });
    expect(clearButton.closest("[inert]")).not.toBeNull();
    fireEvent.change(search, { target: { value: "zzzz" } });
    await waitFor(() => expect(clearButton.closest("[inert]")).toBeNull());
    fireEvent.click(clearButton);
    expect(
      screen.queryByRole("heading", { name: 'Nothing matches ""' }),
    ).not.toBeInTheDocument();
  });

  it("moves focus to the section heading when a category card is used", async () => {
    await renderHelp();
    Element.prototype.scrollIntoView = vi.fn();
    const cards = await screen.findAllByRole("button", { name: /.+/ });
    const card = cards.find((button) => button.className.includes("cat"));
    if (!card) throw new Error("category card not found");
    fireEvent.click(card);
    expect(document.activeElement?.tagName).toBe("H2");
  });

  it("opens an answer in place and links it on", async () => {
    await renderHelp();
    const question = await screen.findByRole("button", {
      name: "What do my stats show?",
    });
    expect(question).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("link", { name: "Your numbers" }),
    ).toHaveAttribute("href", "/studio/dashboard");
  });
});

describe("Studio help (demo)", () => {
  it("adds the money answers and the status line", async () => {
    showcase.isOn = true;
    await renderHelp();
    expect(
      await screen.findByRole("button", {
        name: "Where does my money actually go?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/all systems operational/i)).toBeInTheDocument();
  });
});
