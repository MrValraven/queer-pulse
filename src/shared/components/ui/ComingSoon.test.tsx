import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComingSoon } from "./ComingSoon";

describe("ComingSoon", () => {
  it("renders the default label", () => {
    render(<ComingSoon />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<ComingSoon label="Not yet" />);
    expect(screen.getByText("Not yet")).toBeInTheDocument();
  });
});
