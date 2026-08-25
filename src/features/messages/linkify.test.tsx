import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithLinks } from "./linkify";

describe("renderWithLinks", () => {
  it("wraps an http URL in a safe anchor", () => {
    render(<div>{renderWithLinks("see https://queerpulse.com/x here")}</div>);
    const link = screen.getByRole("link", { name: "https://queerpulse.com/x" });
    expect(link).toHaveAttribute("href", "https://queerpulse.com/x");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("prefixes bare www links with https", () => {
    render(<div>{renderWithLinks("go to www.example.org now")}</div>);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.example.org",
    );
  });

  it("leaves plain text without links untouched", () => {
    render(
      <div data-testid="t">{renderWithLinks("just a plain sentence")}</div>,
    );
    expect(screen.getByTestId("t").querySelector("a")).toBeNull();
  });
});
