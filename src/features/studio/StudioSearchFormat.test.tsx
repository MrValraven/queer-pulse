import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioSearchPage } from "./StudioSearchPage";

describe("search by format (demo)", () => {
  it("narrows the results to one format from the URL", async () => {
    render(
      <TestProviders initialEntries={["/studio/search?q=a&format=performance"]}>
        <StudioSearchPage />
      </TestProviders>,
    );
    const select = await screen.findByRole("combobox", { name: "Format" });
    expect(select).toHaveValue("performance");
    expect(await screen.findByText("Motorbike")).toBeInTheDocument();
    expect(screen.queryByText("Último elétrico")).toBeNull();
  });

  it("clears the format with Any format", async () => {
    render(
      <TestProviders initialEntries={["/studio/search?q=a&format=podcast"]}>
        <StudioSearchPage />
      </TestProviders>,
    );
    const select = await screen.findByRole("combobox", { name: "Format" });
    fireEvent.change(select, { target: { value: "" } });
    expect(select).toHaveValue("");
  });

  it("heads the track section Episodes under Podcasts and drops genre and mood", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/search?q=a&format=podcast&genre=pop"]}
      >
        <StudioSearchPage />
      </TestProviders>,
    );
    await screen.findByRole("combobox", { name: "Format" });
    expect(await screen.findByText("Episodes")).toBeInTheDocument();
    expect(screen.queryByText("Tracks", { selector: "h2 *" })).toBeNull();
  });

  it("keeps the Genre and Mood selects outside Podcasts", async () => {
    render(
      <TestProviders initialEntries={["/studio/search?q=a&format=music"]}>
        <StudioSearchPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("combobox", { name: "Genre" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Mood" })).toBeInTheDocument();
  });
});
