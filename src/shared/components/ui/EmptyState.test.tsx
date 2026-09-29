import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title as an h3 by default", () => {
    render(<EmptyState title="No results yet" />);
    expect(
      screen.getByRole("heading", { level: 3, name: "No results yet" }),
    ).toBeInTheDocument();
  });

  it("renders the title as an h2 with the same text when headingLevel is 2", () => {
    render(<EmptyState title="No results yet" headingLevel={2} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "No results yet" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });
});
