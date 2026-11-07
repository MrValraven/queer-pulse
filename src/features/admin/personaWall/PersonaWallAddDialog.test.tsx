import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_PERSONA_WALL_NINE_SHOWN } from "../../subprofiles/data/personaWallDemoSeed.data";
import { DEMO_SUBPROFILES } from "../../subprofiles/data/subprofiles.data";
import {
  demoAddPersonaWallPick,
  demoAdminPersonaWall,
  resetDemoPersonaWall,
} from "../../subprofiles/personaWallDemoStore";
import { PersonaWallAddDialog } from "./PersonaWallAddDialog";

const VANDA_ID = "sp-ines-fonseca-vanda-diesel";

async function renderDialog(isFull = false) {
  const onClose = vi.fn();
  render(
    <TestProviders>
      <PersonaWallAddDialog isFull={isFull} onClose={onClose} />
    </TestProviders>,
  );
  await awaitCatalog("admin");
  return { onClose, user: userEvent.setup() };
}

/** The dialog's own refusal line. The toast region outside the dialog also
 *  carries the alert role, so the query stays inside the dialog. */
async function findRefusalLine(): Promise<HTMLElement> {
  return within(await screen.findByRole("dialog")).findByRole("alert");
}

describe("PersonaWallAddDialog", () => {
  beforeEach(() => resetDemoPersonaWall());
  afterEach(() => resetDemoPersonaWall());

  it("treats a blank search as idle", async () => {
    const { user } = await renderDialog();
    await user.type(screen.getByLabelText("Search personas"), "   ");
    expect(
      await screen.findByText("Type a name to find a persona"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Matching personas" }),
    ).toBeNull();
  });

  it("adds a persona and closes", async () => {
    const { onClose, user } = await renderDialog();
    await user.type(screen.getByLabelText("Search personas"), "Vanda");
    await user.click(
      await screen.findByRole("button", {
        name: "Add Vanda Diesel to the wall",
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(
      await screen.findByText("Vanda Diesel is on the wall"),
    ).toBeInTheDocument();
    expect(demoAdminPersonaWall().picks.at(-1)?.persona.id).toBe(VANDA_ID);
  });

  it("keeps a picked persona from being added twice", async () => {
    const { onClose, user } = await renderDialog();
    await user.type(screen.getByLabelText("Search personas"), "Bloco");
    const pickedButton = await screen.findByRole("button", {
      name: "Add BLOCO ROSA to the wall",
    });
    expect(pickedButton).toHaveAttribute("aria-disabled", "true");
    expect(pickedButton).toHaveTextContent("On the wall");
    expect(pickedButton).toHaveAccessibleDescription("On the wall");
    const picksBefore = demoAdminPersonaWall().picks.length;
    await user.click(pickedButton);
    expect(onClose).not.toHaveBeenCalled();
    expect(demoAdminPersonaWall().picks).toHaveLength(picksBefore);
  });

  it("keeps results inert and explains why while the wall is full", async () => {
    const { onClose, user } = await renderDialog(true);
    const picksBefore = demoAdminPersonaWall().picks.length;
    const searchInput = screen.getByLabelText("Search personas");
    expect(
      screen.getByText("The wall has 9 picks. Remove one to add another"),
    ).toBeInTheDocument();
    expect(searchInput).toHaveAccessibleDescription(
      expect.stringContaining("Remove one to add another"),
    );
    await user.type(searchInput, "Vanda");
    const addButton = await screen.findByRole("button", {
      name: "Add Vanda Diesel to the wall",
    });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    await user.click(addButton);
    expect(onClose).not.toHaveBeenCalled();
    expect(demoAdminPersonaWall().picks).toHaveLength(picksBefore);
  });

  it("sends a single add for a double press in the same tick", async () => {
    const { onClose, user } = await renderDialog();
    const picksBefore = demoAdminPersonaWall().picks.length;
    await user.type(screen.getByLabelText("Search personas"), "Vanda");
    const addButton = await screen.findByRole("button", {
      name: "Add Vanda Diesel to the wall",
    });
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(demoAdminPersonaWall().picks).toHaveLength(picksBefore + 1);
    expect(screen.queryByRole("alert")?.textContent ?? "").toBe("");
  });

  it("names the cause when the wall filled up in another tab", async () => {
    resetDemoPersonaWall({
      pickPersonaIds: DEMO_PERSONA_WALL_NINE_SHOWN.slice(0, 8),
      fillOrder: "endorsed",
    });
    const { onClose, user } = await renderDialog();
    await user.type(screen.getByLabelText("Search personas"), "Vanda");
    const addButton = await screen.findByRole("button", {
      name: "Add Vanda Diesel to the wall",
    });
    demoAddPersonaWallPick("sp-maria-therapist");
    await user.click(addButton);
    expect(await findRefusalLine()).toHaveTextContent(
      "The wall already has 9 personas. Remove one to add another",
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("says no persona matched", async () => {
    const { user } = await renderDialog();
    await user.type(screen.getByLabelText("Search personas"), "zzzz");
    expect(
      await screen.findAllByText("No listed persona matches zzzz"),
    ).not.toHaveLength(0);
  });

  it("names the state when a persona left the directory after the search", async () => {
    const vandaPersona = DEMO_SUBPROFILES.find(
      (persona) => persona.id === VANDA_ID,
    );
    if (!vandaPersona) throw new Error("The demo registry lost Vanda Diesel");
    const originalStatus = vandaPersona.status;
    try {
      const { onClose, user } = await renderDialog();
      await user.type(screen.getByLabelText("Search personas"), "Vanda");
      const addButton = await screen.findByRole("button", {
        name: "Add Vanda Diesel to the wall",
      });
      vandaPersona.status = "draft";
      await user.click(addButton);
      expect(await findRefusalLine()).toHaveTextContent(
        "This persona is a draft, so it can't go on the wall",
      );
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      vandaPersona.status = originalStatus;
    }
  });
});
