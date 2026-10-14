import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioHelpPage } from "./StudioHelpPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

function renderHelp() {
  render(
    <TestProviders initialEntries={["/studio/help"]}>
      <StudioHelpPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  showcase.isOn = false;
});

describe("Studio help (live)", () => {
  it("answers what Studio does today and keeps money out", async () => {
    renderHelp();
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
    renderHelp();
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
    renderHelp();
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

  it("says so when nothing matches, and Clear search brings everything back", async () => {
    renderHelp();
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
    renderHelp();
    const search = await screen.findByRole("searchbox", {
      name: "Search Studio help",
    });
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: "zzzz" } });
    fireEvent.click(
      await screen.findByRole("button", { name: "Clear search" }),
    );
    expect(
      screen.queryByRole("heading", { name: 'Nothing matches ""' }),
    ).not.toBeInTheDocument();
  });

  it("moves focus to the section heading when a category card is used", async () => {
    renderHelp();
    Element.prototype.scrollIntoView = vi.fn();
    const cards = await screen.findAllByRole("button", { name: /.+/ });
    const card = cards.find((button) => button.className.includes("cat"));
    if (!card) throw new Error("category card not found");
    fireEvent.click(card);
    expect(document.activeElement?.tagName).toBe("H2");
  });

  it("opens an answer in place and links it on", async () => {
    renderHelp();
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
    renderHelp();
    expect(
      await screen.findByRole("button", {
        name: "Where does my money actually go?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/all systems operational/i)).toBeInTheDocument();
  });
});
