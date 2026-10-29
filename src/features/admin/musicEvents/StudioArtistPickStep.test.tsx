import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { StudioArtistPickStep } from "./StudioArtistPickStep";

const mocks: {
  searchConnections: ReturnType<typeof vi.fn>;
  isError: boolean;
} = vi.hoisted(() => ({ searchConnections: vi.fn(), isError: false }));

vi.mock("../../connect/api/useConnectionsSearch", () => ({
  useConnectionsSearch: (...args: unknown[]) => {
    mocks.searchConnections(...args);
    return {};
  },
}));

vi.mock("./api/useStudioArtistSearch", () => ({
  useStudioArtistSearch: () => ({
    people: mocks.isError
      ? []
      : [
          { slug: "marta-reis", name: "Marta Reis", detail: "DJ Maré" },
          {
            slug: "leonor-vaz",
            name: "Leonor Vaz",
            detail: "Lola Vaz, Vaz Trio",
          },
        ],
    isSearchPending: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    isError: mocks.isError,
    error: mocks.isError ? new TypeError("Failed to fetch") : null,
    refetch: vi.fn(),
  }),
}));

afterEach(() => {
  mocks.searchConnections.mockReset();
  mocks.isError = false;
});

function renderStep(excludeSlugs: string[] = []) {
  render(
    <TestProviders>
      <StudioArtistPickStep
        slug="night-one"
        excludeSlugs={excludeSlugs}
        searchQuery=""
        onSearchChange={vi.fn()}
        onPick={vi.fn()}
        onClose={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("StudioArtistPickStep", () => {
  it("lists Studio artists with their persona names", async () => {
    renderStep();
    expect(await screen.findByText("Marta Reis")).toBeInTheDocument();
    expect(screen.getByText("As DJ Maré")).toBeInTheDocument();
    expect(screen.getByText("As Lola Vaz, Vaz Trio")).toBeInTheDocument();
  });

  it("hides people already on the lineup", async () => {
    renderStep(["marta-reis"]);
    expect(await screen.findByText("Leonor Vaz")).toBeInTheDocument();
    expect(screen.queryByText("Marta Reis")).not.toBeInTheDocument();
  });

  it("frames a failed search through describeError", async () => {
    mocks.isError = true;
    renderStep();
    expect(
      await screen.findByText(/^Couldn't load Studio artists/),
    ).toBeInTheDocument();
  });

  it("never searches connections", async () => {
    renderStep();
    await screen.findByText("Marta Reis");
    expect(mocks.searchConnections).not.toHaveBeenCalled();
  });
});
