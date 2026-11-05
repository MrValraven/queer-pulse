import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPersonaWall } from "../subprofiles/personaWallDemoStore";
import { AdminPersonaWallPage } from "./AdminPersonaWallPage";

const readFailures: { remaining: number } = vi.hoisted(() => ({
  remaining: 0,
}));

// The real store, with its admin read able to reject a set number of times.
vi.mock("../subprofiles/personaWallDemoStore", async (importOriginal) => {
  const actualStore =
    await importOriginal<
      typeof import("../subprofiles/personaWallDemoStore")
    >();
  return {
    ...actualStore,
    demoAdminPersonaWall: () => {
      if (readFailures.remaining > 0) {
        readFailures.remaining -= 1;
        throw new Error("The wall read failed in the test");
      }
      return actualStore.demoAdminPersonaWall();
    },
  };
});

const WALL_NAME = "Some of the people in the directory";

function pickRowNames(): string[] {
  return screen
    .getAllByRole("listitem")
    .map(
      (row) => row.querySelector("[data-pick-name]")?.textContent ?? undefined,
    )
    .filter((name): name is string => name !== undefined);
}

describe("AdminPersonaWallPage (demo)", () => {
  beforeEach(() => {
    readFailures.remaining = 0;
    resetDemoPersonaWall();
  });

  it("shows the picks, the fill order and the preview", async () => {
    render(<AdminPersonaWallPage />, { wrapper: TestProviders });
    expect(
      await screen.findByRole("heading", { name: "Picked personas" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Fill the rest" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Preview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Choose who appears on the People Directory hero. Any tiles you don't fill are filled automatically.",
      ),
    ).toBeInTheDocument();
  });

  it("adds a persona and marks it Picked in the preview", async () => {
    const user = userEvent.setup();
    render(<AdminPersonaWallPage />, { wrapper: TestProviders });
    await user.click(
      await screen.findByRole("button", { name: "Add persona" }),
    );
    await user.type(screen.getByLabelText("Search personas"), "Vanda");
    await user.click(
      await screen.findByRole("button", {
        name: "Add Vanda Diesel to the wall",
      }),
    );
    await waitFor(() => expect(pickRowNames().at(-1)).toBe("Vanda Diesel"));
    const wall = await screen.findByRole("list", { name: WALL_NAME });
    const vandaLink = within(wall).getByRole("link", { name: /Vanda Diesel/ });
    expect(within(vandaLink).getByText("Picked")).toBeInTheDocument();
  });

  it("removes a pick and the preview follows", async () => {
    const user = userEvent.setup();
    render(<AdminPersonaWallPage />, { wrapper: TestProviders });
    const wall = await screen.findByRole("list", { name: WALL_NAME });
    const blocoLink = within(wall).getByRole("link", { name: /BLOCO ROSA/ });
    expect(within(blocoLink).getByText("Picked")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Remove BLOCO ROSA from the wall" }),
    );
    await waitFor(() => expect(pickRowNames()).not.toContain("BLOCO ROSA"));
    await waitFor(() => {
      const blocoLinks = within(
        screen.getByRole("list", { name: WALL_NAME }),
      ).queryAllByRole("link", { name: /BLOCO ROSA/ });
      for (const link of blocoLinks) {
        expect(within(link).getByText("Filled")).toBeInTheDocument();
      }
    });
  });

  it("names the failure and loads the wall after Load the wall again", async () => {
    readFailures.remaining = 1;
    const user = userEvent.setup();
    render(<AdminPersonaWallPage />, { wrapper: TestProviders });
    expect(
      await screen.findByText("We couldn't load the directory wall"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Load the wall again" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Picked personas" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't load the directory wall"),
    ).toBeNull();
  });

  it("returns focus to Add persona when the dialog closes", async () => {
    const user = userEvent.setup();
    render(<AdminPersonaWallPage />, { wrapper: TestProviders });
    const addButton = await screen.findByRole("button", {
      name: "Add persona",
    });
    await user.click(addButton);
    const searchField = await screen.findByLabelText("Search personas");
    await waitFor(() => expect(searchField).toHaveFocus());
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByLabelText("Search personas")).toBeNull(),
    );
    expect(screen.getByRole("button", { name: "Add persona" })).toHaveFocus();
  });
});
