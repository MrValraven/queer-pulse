import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioAdminScenes } from "./StudioAdminScenes";

function renderTab() {
  render(
    <TestProviders initialEntries={["/admin/studio"]}>
      <StudioAdminScenes />
    </TestProviders>,
  );
}

const rowOf = (group: HTMLElement, name: string) => {
  const row = within(group)
    .getAllByRole("listitem")
    .find((item) => item.textContent?.includes(name));
  if (!row) throw new Error(`no row for ${name}`);
  return row;
};

describe("Studio discovery console: scenes (demo)", () => {
  it("lists active scenes by position, then archived ones, with their counts", async () => {
    renderTab();
    const active = await screen.findByRole("region", { name: "Active" });
    const names = within(active)
      .getAllByRole("listitem")
      .map((item) => item.textContent ?? "");
    expect(names[0]).toMatch(/Mouraria fado/);
    expect(names[1]).toMatch(/Warehouse nights/);
    expect(
      within(rowOf(active, "Mouraria fado")).getByText(/3 releases/),
    ).toBeInTheDocument();
    expect(
      within(rowOf(active, "Mouraria fado")).getByText(/2 pinned events/),
    ).toBeInTheDocument();
    const archived = screen.getByRole("region", { name: "Archived" });
    expect(within(archived).getByText("Sintra choirs")).toBeInTheDocument();
  });

  it("creates a scene and checks its fields first", async () => {
    renderTab();
    fireEvent.click(await screen.findByRole("button", { name: "New scene" }));
    const dialog = await screen.findByRole("dialog", { name: "New scene" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create scene" }),
    );
    expect(
      await within(dialog).findByText("Give the scene a name"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Add the city")).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Name" }), {
      target: { value: "Café Nights" },
    });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "City" }), {
      target: { value: "Porto" },
    });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Address" }), {
      target: { value: "Bad Slug" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create scene" }),
    );
    expect(
      await within(dialog).findByText(
        "Use 2 to 60 lowercase letters, digits and single hyphens",
      ),
    ).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Address" }), {
      target: { value: "" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create scene" }),
    );
    const active = screen.getByRole("region", { name: "Active" });
    expect(await within(active).findByText("Café Nights")).toBeInTheDocument();
  });

  it("moves a scene up and archives another", async () => {
    renderTab();
    const active = await screen.findByRole("region", { name: "Active" });
    fireEvent.click(
      within(active).getByRole("button", {
        name: "Move up: Warehouse nights",
      }),
    );
    await waitFor(() =>
      expect(within(active).getAllByRole("listitem")[0]).toHaveTextContent(
        "Warehouse nights",
      ),
    );
    fireEvent.click(
      within(rowOf(active, "Mouraria fado")).getByRole("button", {
        name: "Archive scene Mouraria fado",
      }),
    );
    const archived = screen.getByRole("region", { name: "Archived" });
    expect(
      await within(archived).findByText("Mouraria fado"),
    ).toBeInTheDocument();
  });

  it("restores an archived scene to the end of the active list", async () => {
    renderTab();
    const archived = await screen.findByRole("region", { name: "Archived" });
    fireEvent.click(
      within(archived).getByRole("button", {
        name: "Restore scene Sintra choirs",
      }),
    );
    const active = screen.getByRole("region", { name: "Active" });
    await waitFor(() => {
      const rows = within(active).getAllByRole("listitem");
      expect(rows[rows.length - 1]).toHaveTextContent("Sintra choirs");
    });
  });

  it("edits a scene and keeps its address when the field is emptied", async () => {
    renderTab();
    const active = await screen.findByRole("region", { name: "Active" });
    fireEvent.click(
      within(active).getByRole("button", {
        name: "Edit scene Warehouse nights",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Edit Warehouse nights",
    });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Name" }), {
      target: { value: "Warehouse sessions" },
    });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Address" }), {
      target: { value: "" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save scene" }));
    expect(
      await within(active).findByText("Warehouse sessions"),
    ).toBeInTheDocument();
    expect(
      within(rowOf(active, "Warehouse sessions")).getByText(
        /\/porto-warehouse/,
      ),
    ).toBeInTheDocument();
  });

  it("says so when the address belongs to another scene", async () => {
    renderTab();
    fireEvent.click(await screen.findByRole("button", { name: "New scene" }));
    const dialog = await screen.findByRole("dialog", { name: "New scene" });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Name" }), {
      target: { value: "Fado again" },
    });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "City" }), {
      target: { value: "Lisboa" },
    });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Address" }), {
      target: { value: "mouraria-fado" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create scene" }),
    );
    expect(
      await within(dialog).findByText("Another scene uses that address"),
    ).toBeInTheDocument();
  });

  it("unpins an event and removes a release in the scene sheet", async () => {
    renderTab();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Events and releases: Mouraria fado",
      }),
    );
    const sheet = await screen.findByRole("dialog", {
      name: "Mouraria fado: events and releases",
    });
    fireEvent.click(
      await within(sheet).findByRole("button", {
        name: "Unpin event Queer Supper Club №12",
      }),
    );
    await waitFor(() =>
      expect(within(sheet).queryByText("Queer Supper Club №12")).toBeNull(),
    );
    fireEvent.click(
      await within(sheet).findByRole("button", {
        name: "Remove from scene: Cidade dos santos",
      }),
    );
    await waitFor(() =>
      expect(within(sheet).queryByText("Cidade dos santos")).toBeNull(),
    );
  });

  it("pins an upcoming event found by title", async () => {
    renderTab();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Events and releases: Warehouse nights",
      }),
    );
    const sheet = await screen.findByRole("dialog", {
      name: "Warehouse nights: events and releases",
    });
    expect(
      await within(sheet).findByText("No pinned events"),
    ).toBeInTheDocument();
    fireEvent.change(
      within(sheet).getByRole("searchbox", { name: "Search upcoming events" }),
      { target: { value: "portfolio" } },
    );
    fireEvent.click(
      await within(sheet).findByRole("button", {
        name: "Pin event Portfolio Night: Designers & Photographers",
      }),
    );
    expect(
      await within(sheet).findByRole("button", {
        name: "Unpin event Portfolio Night: Designers & Photographers",
      }),
    ).toBeInTheDocument();
  });
});
