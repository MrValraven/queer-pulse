import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { expect, test } from "vitest";
import { MentionText } from "./MentionText";
import { renderWithLinks } from "../../features/messages/linkify";

function renderInRouter(node: ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
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
