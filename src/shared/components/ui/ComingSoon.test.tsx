import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { ComingSoon } from "./ComingSoon";

describe("ComingSoon", () => {
  it("renders the default label", () => {
    render(<ComingSoon />, { wrapper: I18nProvider });
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<ComingSoon label="Not yet" />, { wrapper: I18nProvider });
    expect(screen.getByText("Not yet")).toBeInTheDocument();
  });
});
