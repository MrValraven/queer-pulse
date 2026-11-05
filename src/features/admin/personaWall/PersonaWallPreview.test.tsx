import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoAdminPersonaWall,
  resetDemoPersonaWall,
} from "../../subprofiles/personaWallDemoStore";
import { PersonaWallPreview } from "./PersonaWallPreview";

// Only the lg query reports a narrow screen; every other query keeps the
// desktop answer, like jsdom's own matchMedia stub.
let isNarrowScreenMock = false;
vi.mock("../../../shared/hooks/useMediaQuery", () => ({
  useMediaQuery: (query: string) =>
    isNarrowScreenMock && query.startsWith("(max-width: 7"),
}));

const WALL_NAME = "Some of the people in the directory";

function renderPreview(count?: number) {
  const { preview } = demoAdminPersonaWall();
  render(
    <PersonaWallPreview
      preview={count === undefined ? preview : preview.slice(0, count)}
    />,
    { wrapper: TestProviders },
  );
}

describe("PersonaWallPreview", () => {
  beforeEach(() => {
    isNarrowScreenMock = false;
    resetDemoPersonaWall();
  });

  it("marks picked and filled tiles", async () => {
    renderPreview();
    const wall = await screen.findByRole("list", { name: WALL_NAME });
    expect(within(wall).getAllByRole("link")).toHaveLength(9);
    expect(within(wall).getAllByText("Picked")).toHaveLength(3);
    expect(within(wall).getAllByText("Filled")).toHaveLength(6);
  });

  it("tags each badge with its wall source", async () => {
    renderPreview();
    const wall = await screen.findByRole("list", { name: WALL_NAME });
    within(wall)
      .getAllByText("Picked")
      .forEach((badge) =>
        expect(badge).toHaveAttribute("data-wall-source", "picked"),
      );
    within(wall)
      .getAllByText("Filled")
      .forEach((badge) =>
        expect(badge).toHaveAttribute("data-wall-source", "filled"),
      );
  });

  it("shows the six-tile phone wall on Phone", async () => {
    renderPreview();
    expect(
      await screen.findByRole("list", { name: WALL_NAME }),
    ).toHaveAttribute("data-device", "desktop");
    fireEvent.click(screen.getByRole("button", { name: "Phone" }));
    await waitFor(() =>
      expect(screen.getByRole("list", { name: WALL_NAME })).toHaveAttribute(
        "data-device",
        "phone",
      ),
    );
    expect(
      within(screen.getByRole("list", { name: WALL_NAME })).getAllByRole(
        "link",
      ),
    ).toHaveLength(6);
    expect(screen.getByRole("button", { name: "Phone" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Desktop" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("says the wall is hidden with fewer than three personas", async () => {
    renderPreview(2);
    expect(
      await screen.findByText(
        "The wall needs at least 3 personas, so it's hidden for now",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("list", { name: WALL_NAME }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows the phone wall alone and hides the switch on a narrow screen", async () => {
    isNarrowScreenMock = true;
    renderPreview();
    const wall = await screen.findByRole("list", { name: WALL_NAME });
    expect(wall).toHaveAttribute("data-device", "phone");
    expect(within(wall).getAllByRole("link")).toHaveLength(6);
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Desktop" }),
      ).not.toBeInTheDocument(),
    );
  });
});
