import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toWallTileView } from "./api/directoryCard.adapters";
import { DEMO_SUBPROFILES, toCardDto } from "./data/subprofiles.data";
import { SubprofileCreditsWallGrid } from "./SubprofileCreditsWallGrid";
import { WALL_LAYOUT_PHONE_SIX } from "./subprofileCreditsWall.data";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.
// TestProviders brings the MemoryRouter the tile links need and the
// I18nProvider the tile captions read.

const WALL_LABEL = "Some of the people in the directory";

const tilesOf = (count: number) =>
  DEMO_SUBPROFILES.slice(0, count).map((persona) =>
    toWallTileView(toCardDto(persona)),
  );

describe("SubprofileCreditsWallGrid", () => {
  it("draws one linked tile per span with its badge", () => {
    render(
      <TestProviders>
        <SubprofileCreditsWallGrid
          layout={WALL_LAYOUT_PHONE_SIX}
          tiles={tilesOf(6)}
          label={WALL_LABEL}
          badgeFor={() => "Picked"}
        />
      </TestProviders>,
    );
    const wall = screen.getByRole("list", { name: WALL_LABEL });
    expect(within(wall).getAllByRole("link")).toHaveLength(6);
    expect(within(wall).getAllByText("Picked")).toHaveLength(6);
  });

  it("skips tiles beyond the layout", () => {
    render(
      <TestProviders>
        <SubprofileCreditsWallGrid
          layout={WALL_LAYOUT_PHONE_SIX}
          tiles={tilesOf(7)}
          label={WALL_LABEL}
        />
      </TestProviders>,
    );
    const wall = screen.getByRole("list", { name: WALL_LABEL });
    expect(within(wall).getAllByRole("link")).toHaveLength(6);
    expect(within(wall).getAllByRole("listitem")).toHaveLength(6);
  });

  it("marks a forced device on the grid", () => {
    const { unmount } = render(
      <TestProviders>
        <SubprofileCreditsWallGrid
          layout={WALL_LAYOUT_PHONE_SIX}
          tiles={tilesOf(6)}
          label={WALL_LABEL}
          device="phone"
        />
      </TestProviders>,
    );
    expect(screen.getByRole("list", { name: WALL_LABEL })).toHaveAttribute(
      "data-device",
      "phone",
    );
    unmount();

    render(
      <TestProviders>
        <SubprofileCreditsWallGrid
          layout={WALL_LAYOUT_PHONE_SIX}
          tiles={tilesOf(6)}
          label={WALL_LABEL}
        />
      </TestProviders>,
    );
    expect(screen.getByRole("list", { name: WALL_LABEL })).not.toHaveAttribute(
      "data-device",
    );
  });

  it("names the list", () => {
    render(
      <TestProviders>
        <SubprofileCreditsWallGrid
          layout={WALL_LAYOUT_PHONE_SIX}
          tiles={tilesOf(6)}
          label={WALL_LABEL}
        />
      </TestProviders>,
    );
    expect(screen.getByRole("list", { name: WALL_LABEL })).toBeInTheDocument();
  });
});
