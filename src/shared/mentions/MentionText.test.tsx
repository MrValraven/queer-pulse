import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { expect, test } from "vitest";
import { MentionText } from "./MentionText";
import { renderWithLinks } from "../../features/messages/linkify";
import { MentionNamesContext, mentionNameKey } from "./MentionNames";

function renderInRouter(node: ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

function renderWithNames(node: ReactNode, entries: [string, string][]) {
  return render(
    <MemoryRouter>
      <MentionNamesContext.Provider value={new Map(entries)}>
        {node}
      </MentionNamesContext.Provider>
    </MemoryRouter>,
  );
}

test("linkifies a member mention to a router link", () => {
  renderInRouter(<MentionText text="hey @ana-lopes welcome" />);
  expect(screen.getByRole("link", { name: "@ana-lopes" })).toBeInTheDocument();
});

test("composes mentions with URL rendering without double-processing", () => {
  renderInRouter(
    <MentionText
      text="see b/queer-books at https://example.org/c/foo"
      renderText={renderWithLinks}
    />,
  );
  // the business mention linkifies as a router link...
  expect(screen.getByRole("link", { name: "b/queer-books" })).toBeInTheDocument();
  // ...the URL linkifies as an external new-tab anchor...
  const external = screen.getByRole("link", { name: "https://example.org/c/foo" });
  expect(external).toHaveAttribute("href", "https://example.org/c/foo");
  expect(external).toHaveAttribute("target", "_blank");
  // ...and the `c/foo` INSIDE the URL is NOT turned into a community mention.
  expect(screen.queryByRole("link", { name: "c/foo" })).toBeNull();
});

test("without renderText, text runs render unchanged (regression guard)", () => {
  const { container } = renderInRouter(
    <MentionText text="plain http://example.org text" />,
  );
  // renderText omitted → the URL is NOT linkified and there are no anchors...
  expect(container.querySelectorAll("a")).toHaveLength(0);
  // ...and the visible text is exactly the input.
  expect(container.textContent).toBe("plain http://example.org text");
});

test("a resolved member mention renders the name only, with the slug as title", () => {
  renderWithNames(<MentionText text="hey @ana-lopes welcome" />, [
    [mentionNameKey("member", "ana-lopes"), "Ana Lopes"],
  ]);
  const link = screen.getByRole("link", { name: "Ana Lopes" });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute("title", "@ana-lopes");
  expect(screen.queryByRole("link", { name: "@ana-lopes" })).toBeNull();
});

test("a resolved community mention drops the c/ sigil and shows the name", () => {
  renderWithNames(<MentionText text="join c/queerpulse-social today" />, [
    [mentionNameKey("community", "queerpulse-social"), "QueerPulse Social"],
  ]);
  const link = screen.getByRole("link", { name: "QueerPulse Social" });
  expect(link).toHaveAttribute("title", "c/queerpulse-social");
});

test("an unresolved mention falls back to sigil+slug with no title", () => {
  renderWithNames(<MentionText text="hey @nobody-here" />, []);
  const link = screen.getByRole("link", { name: "@nobody-here" });
  expect(link).toBeInTheDocument();
  expect(link).not.toHaveAttribute("title");
});

test("a topic keeps its #tag even if a same-slug name exists in the map", () => {
  renderWithNames(<MentionText text="see #housing" />, [
    [mentionNameKey("topic", "housing"), "Housing Chat"],
  ]);
  expect(screen.getByRole("link", { name: "#housing" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Housing Chat" })).toBeNull();
});
