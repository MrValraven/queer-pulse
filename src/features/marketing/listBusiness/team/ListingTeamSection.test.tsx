import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { DEMO_TEAM_ROWS, type DemoTeamRow } from "../api/listingTeam.demo.data";
import {
  replaceListingTeamDemoRows,
  resetListingTeamDemo,
  setDemoTeamMemberHidden,
  setDemoTeamPersonaHidden,
} from "../api/listingTeam.demo";
import type { ManagedListingDTO } from "../api/listings.api";
import { ListingTeamSection } from "./ListingTeamSection";

const TINTA_VIVA_REF = "QPL-DEMO-0201";
const NAVALHA_REF = "QPL-DEMO-0202";
const STUDIO_CABELO_REF = "QPL-DEMO-0203";
const ROLE_FIELD_LABEL = "Role on your page (optional)";
const HIDDEN_NAME = "A persona that isn't visible right now";
const HIDDEN_MEMBER_NAME = "A member who isn't visible right now";

const ROSA = "sp-rita-rosa-brava";
const LINHA = "sp-kai-linha-fina";
const AGULHA = "sp-tiago-agulha-lenta";
const FUMO = "sp-anika-fumo-azul";
const CATARINA_USER_ID = "demo-user-catarina-vaz";
const JONAS_USER_ID = "demo-user-jonas";

beforeEach(() => {
  window.localStorage.clear();
  resetListingTeamDemo();
});

function makeManagedListing(
  ref: string,
  overrides: Partial<ManagedListingDTO> = {},
): ManagedListingDTO {
  return {
    ref,
    slug: "demo-listing",
    name: "Demo listing",
    status: "live",
    managementRole: "owner",
    ...overrides,
  } as unknown as ManagedListingDTO;
}

function renderSection(ref: string, overrides?: Partial<ManagedListingDTO>) {
  return render(
    <ListingTeamSection listing={makeManagedListing(ref, overrides)} />,
    { wrapper: TestProviders },
  );
}

function tintaVivaRow(
  subprofileId: string,
  overrides: Partial<DemoTeamRow>,
): DemoTeamRow {
  return {
    id: `test-link-${subprofileId}`,
    listingId: "demo-listing-tinta-viva",
    subprofileId,
    userId: null,
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: null,
    position: null,
    createdAt: "2026-10-01T10:00:00.000Z",
    answeredAt: null,
    ...overrides,
  };
}

function tintaVivaMemberRow(
  userId: string,
  overrides: Partial<DemoTeamRow>,
): DemoTeamRow {
  return {
    id: `test-link-${userId}`,
    listingId: "demo-listing-tinta-viva",
    subprofileId: null,
    userId,
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: null,
    position: null,
    createdAt: "2026-10-01T10:00:00.000Z",
    answeredAt: null,
    ...overrides,
  };
}

function seededTintaVivaAccepted(excludedSubprofileId: string): DemoTeamRow[] {
  return DEMO_TEAM_ROWS.filter(
    (row) =>
      row.listingId === "demo-listing-tinta-viva" &&
      row.subprofileId !== excludedSubprofileId,
  );
}

function rowOf(text: string): HTMLElement {
  const row = screen.getByText(text).closest("li");
  if (!row) throw new Error(`No row holds ${text}`);
  return row;
}

function acceptedList(): HTMLElement {
  return screen.getByRole("list", { name: /^On your page/ });
}

const KNOWN_NAMES = [
  "Rosa Brava",
  "Linha Fina",
  "Catarina Vaz",
  "Agulha Lenta",
  "Fumo Azul",
];

function acceptedNames(): string[] {
  return within(acceptedList())
    .getAllByRole("listitem")
    .map(
      (item) =>
        KNOWN_NAMES.find((name) => item.textContent?.includes(name)) ?? "",
    );
}

describe("ListingTeamSection answers", () => {
  it("lists the five people with their roles and the count, a member among them", async () => {
    renderSection(TINTA_VIVA_REF);
    expect(await screen.findByText("On your page")).toBeInTheDocument();
    expect(screen.getByText("5 of 40")).toBeInTheDocument();
    await waitFor(() =>
      expect(acceptedNames()).toEqual([
        "Rosa Brava",
        "Linha Fina",
        "Catarina Vaz",
        "Agulha Lenta",
        "Fumo Azul",
      ]),
    );
  });

  it("approves a request with a role", async () => {
    replaceListingTeamDemoRows([
      ...seededTintaVivaAccepted(FUMO),
      tintaVivaRow(FUMO, { status: "pending", initiatedBy: "persona" }),
    ]);
    renderSection(TINTA_VIVA_REF);
    expect(await screen.findByText("Asking to join")).toBeInTheDocument();
    const request = rowOf("Fumo Azul");
    fireEvent.change(within(request).getByLabelText(ROLE_FIELD_LABEL), {
      target: { value: "Guest artist" },
    });
    fireEvent.click(within(request).getByRole("button", { name: /^Approve/ }));
    expect(await screen.findByText("Added to your team")).toBeInTheDocument();
    await waitFor(() => {
      const items = within(acceptedList()).getAllByRole("listitem");
      expect(items).toHaveLength(5);
      expect(items[4]).toHaveTextContent("Fumo Azul");
      expect(items[4]).toHaveTextContent("Guest artist");
    });
    await waitFor(() =>
      expect(screen.queryByText("Asking to join")).not.toBeInTheDocument(),
    );
  });

  it("cancels a sent invite", async () => {
    renderSection(NAVALHA_REF);
    expect(await screen.findByText("Invites sent")).toBeInTheDocument();
    fireEvent.click(
      within(rowOf("Agulha Lenta")).getByRole("button", {
        name: "Cancel invite: Agulha Lenta",
      }),
    );
    expect(await screen.findByText("Invite cancelled")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Agulha Lenta")).not.toBeInTheDocument(),
    );
  });

  it("asks before removing a member", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Fumo Azul");
    const removeButtonName = "Remove from team: Fumo Azul";
    fireEvent.click(screen.getByRole("button", { name: removeButtonName }));
    expect(
      await screen.findByText("Remove Fumo Azul from your team?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Remove Fumo Azul from your team?"),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Fumo Azul")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: removeButtonName }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove from team" }),
    );
    expect(
      await screen.findByText("Removed from your team"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Fumo Azul")).not.toBeInTheDocument(),
    );
  });
});

describe("ListingTeamSection editing and order", () => {
  it("moves a member down and keeps the new order", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Rosa Brava");
    expect(
      screen.getByRole("button", { name: "Move Rosa Brava up" }),
    ).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(
      screen.getByRole("button", { name: "Move Rosa Brava down" }),
    );
    await waitFor(() =>
      expect(acceptedNames().slice(0, 2)).toEqual(["Linha Fina", "Rosa Brava"]),
    );
    expect(
      screen.getByRole("button", { name: "Move Linha Fina up" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("button", { name: "Move Fumo Azul down" }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("saves an edited role", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Linha Fina");
    fireEvent.click(
      within(rowOf("Linha Fina")).getByRole("button", {
        name: "Edit role: Linha Fina",
      }),
    );
    const field = await within(rowOf("Linha Fina")).findByLabelText(
      ROLE_FIELD_LABEL,
    );
    fireEvent.change(field, { target: { value: "" } });
    fireEvent.change(field, { target: { value: "Lead artist" } });
    fireEvent.click(
      within(rowOf("Linha Fina")).getByRole("button", { name: "Save role" }),
    );
    expect(await screen.findByText("Role saved")).toBeInTheDocument();
    await waitFor(() =>
      expect(rowOf("Linha Fina")).toHaveTextContent("Lead artist"),
    );
    await waitFor(() =>
      expect(
        within(rowOf("Linha Fina")).queryByLabelText(ROLE_FIELD_LABEL),
      ).not.toBeInTheDocument(),
    );
  });

  it("saves the role on Enter in the role field", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Linha Fina");
    fireEvent.click(
      within(rowOf("Linha Fina")).getByRole("button", {
        name: "Edit role: Linha Fina",
      }),
    );
    const field = await within(rowOf("Linha Fina")).findByLabelText(
      ROLE_FIELD_LABEL,
    );
    fireEvent.change(field, { target: { value: "Lead artist" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(await screen.findByText("Role saved")).toBeInTheDocument();
    await waitFor(() =>
      expect(rowOf("Linha Fina")).toHaveTextContent("Lead artist"),
    );
  });

  it("returns focus to Edit role after Cancel", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Linha Fina");
    const editName = "Edit role: Linha Fina";
    fireEvent.click(
      within(rowOf("Linha Fina")).getByRole("button", { name: editName }),
    );
    const field = await within(rowOf("Linha Fina")).findByLabelText(
      ROLE_FIELD_LABEL,
    );
    await waitFor(() => expect(field).toHaveFocus());
    fireEvent.click(
      within(rowOf("Linha Fina")).getByRole("button", { name: "Cancel" }),
    );
    await waitFor(() =>
      expect(
        within(rowOf("Linha Fina")).getByRole("button", { name: editName }),
      ).toHaveFocus(),
    );
  });

  it("closes the role editor on Escape and returns focus to Edit role", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Linha Fina");
    const editName = "Edit role: Linha Fina";
    fireEvent.click(
      within(rowOf("Linha Fina")).getByRole("button", { name: editName }),
    );
    const field = await within(rowOf("Linha Fina")).findByLabelText(
      ROLE_FIELD_LABEL,
    );
    fireEvent.keyDown(field, { key: "Escape" });
    await waitFor(() =>
      expect(
        within(rowOf("Linha Fina")).getByRole("button", { name: editName }),
      ).toHaveFocus(),
    );
    await waitFor(() =>
      expect(
        within(rowOf("Linha Fina")).queryByLabelText(ROLE_FIELD_LABEL),
      ).not.toBeInTheDocument(),
    );
  });
});

describe("ListingTeamSection focus and hidden rows", () => {
  it("keeps focus on the moved arrow and announces the new place", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Rosa Brava");
    const moveDown = screen.getByRole("button", {
      name: "Move Rosa Brava down",
    });
    moveDown.focus();
    fireEvent.click(moveDown);
    expect(
      await screen.findByText("Rosa Brava is now 2 of 5"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Move Rosa Brava down" }),
      ).toHaveFocus(),
    );
  });

  it("keeps focus in the section after approving the last request", async () => {
    replaceListingTeamDemoRows([
      ...seededTintaVivaAccepted(FUMO),
      tintaVivaRow(FUMO, { status: "pending", initiatedBy: "persona" }),
    ]);
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Asking to join");
    const approve = within(rowOf("Fumo Azul")).getByRole("button", {
      name: "Approve Fumo Azul",
    });
    approve.focus();
    fireEvent.click(approve);
    await waitFor(() =>
      expect(screen.queryByText("Asking to join")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /^On your page/ }),
      ).toHaveFocus(),
    );
  });

  it("offers Remove, Decline and Cancel invite on rows whose persona is hidden", async () => {
    replaceListingTeamDemoRows([
      tintaVivaRow(ROSA, { position: 0 }),
      tintaVivaRow(LINHA, { status: "pending", initiatedBy: "persona" }),
      tintaVivaRow(FUMO, { status: "pending" }),
    ]);
    for (const personaId of [ROSA, LINHA, FUMO]) {
      setDemoTeamPersonaHidden(personaId, true);
    }
    renderSection(TINTA_VIVA_REF);
    await waitFor(() =>
      expect(screen.getAllByText(HIDDEN_NAME)).toHaveLength(3),
    );
    expect(
      screen.getAllByText("It shows on your page again once it's visible"),
    ).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: `Remove from team: ${HIDDEN_NAME}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Decline ${HIDDEN_NAME}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Cancel invite: ${HIDDEN_NAME}` }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Approve/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the not live notice and keeps answers available", async () => {
    replaceListingTeamDemoRows([
      tintaVivaRow(ROSA, { position: 0 }),
      tintaVivaRow(LINHA, { status: "pending", initiatedBy: "persona" }),
      tintaVivaRow(AGULHA, { status: "pending" }),
    ]);
    renderSection(TINTA_VIVA_REF, { status: "review" });
    expect(
      await screen.findByText(
        "Your listing needs to be live and shown in the directory before you can invite or approve anyone",
      ),
    ).toBeInTheDocument();
    await screen.findByText("Asking to join");
    expect(screen.getByRole("button", { name: /^Approve/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    for (const name of [/^Decline/, /^Cancel invite/, /^Remove/]) {
      expect(screen.getByRole("button", { name })).not.toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
  });

  it("shows a refused answer inline", async () => {
    const fullTeam: DemoTeamRow[] = Array.from({ length: 40 }, (_, index) =>
      tintaVivaRow(`sp-filler-${index}`, { position: index }),
    );
    replaceListingTeamDemoRows([
      ...fullTeam,
      tintaVivaRow(FUMO, { status: "pending", initiatedBy: "persona" }),
    ]);
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Asking to join");
    const request = rowOf("Fumo Azul");
    fireEvent.click(within(request).getByRole("button", { name: /^Approve/ }));
    expect(await within(request).findByRole("alert")).toHaveTextContent(
      "This team is full. A business can show up to 40 personas",
    );
  });
});

describe("ListingTeamSection member rows", () => {
  it("shows a member in the same layout as a persona, with Member and the handle", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Catarina Vaz");
    const row = rowOf("Catarina Vaz");
    expect(row).toHaveTextContent("Front of house");
    expect(row).toHaveTextContent("Member · @catarina-vaz");
    for (const name of [
      "Move Catarina Vaz up",
      "Move Catarina Vaz down",
      "Edit role: Catarina Vaz",
      "Remove from team: Catarina Vaz",
    ]) {
      expect(within(row).getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("moves a member up and announces the new place", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Catarina Vaz");
    fireEvent.click(
      screen.getByRole("button", { name: "Move Catarina Vaz up" }),
    );
    expect(
      await screen.findByText("Catarina Vaz is now 2 of 5"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(acceptedNames().slice(0, 3)).toEqual([
        "Rosa Brava",
        "Catarina Vaz",
        "Linha Fina",
      ]),
    );
  });

  it("saves an edited role on a member", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Catarina Vaz");
    fireEvent.click(
      within(rowOf("Catarina Vaz")).getByRole("button", {
        name: "Edit role: Catarina Vaz",
      }),
    );
    const field = await within(rowOf("Catarina Vaz")).findByLabelText(
      ROLE_FIELD_LABEL,
    );
    fireEvent.change(field, { target: { value: "Studio host" } });
    fireEvent.click(
      within(rowOf("Catarina Vaz")).getByRole("button", { name: "Save role" }),
    );
    expect(await screen.findByText("Role saved")).toBeInTheDocument();
    await waitFor(() =>
      expect(rowOf("Catarina Vaz")).toHaveTextContent("Studio host"),
    );
  });

  it("asks before removing a member and keeps focus in the section", async () => {
    renderSection(TINTA_VIVA_REF);
    await screen.findByText("Catarina Vaz");
    const removeButton = screen.getByRole("button", {
      name: "Remove from team: Catarina Vaz",
    });
    removeButton.focus();
    fireEvent.click(removeButton);
    expect(
      await screen.findByText("Remove Catarina Vaz from your team?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This member stops showing on your page straight away. You can invite them again later",
      ),
    ).toBeInTheDocument();
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove from team" }),
    );
    expect(
      await screen.findByText("Removed from your team"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Catarina Vaz")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /^On your page/ }),
      ).toHaveFocus(),
    );
  });

  it("lists a pending member invite with Cancel invite and nothing to approve", async () => {
    renderSection(STUDIO_CABELO_REF);
    expect(await screen.findByText("Invites sent")).toBeInTheDocument();
    const invite = rowOf("Alex Moreno");
    expect(invite).toHaveTextContent("Colourist");
    expect(invite).toHaveTextContent("Member · @tiago");
    expect(
      within(invite).queryByRole("button", { name: /^Approve/ }),
    ).not.toBeInTheDocument();
    expect(
      within(invite).queryByRole("button", { name: /^Decline/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(invite).getByRole("button", {
        name: "Cancel invite: Alex Moreno",
      }),
    );
    expect(await screen.findByText("Invite cancelled")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Alex Moreno")).not.toBeInTheDocument(),
    );
  });

  it("offers Remove and Cancel invite on rows whose member is hidden", async () => {
    replaceListingTeamDemoRows([
      tintaVivaMemberRow(CATARINA_USER_ID, { position: 0 }),
      tintaVivaMemberRow(JONAS_USER_ID, { status: "pending" }),
    ]);
    setDemoTeamMemberHidden("catarina-vaz", true);
    setDemoTeamMemberHidden("jonas", true);
    renderSection(TINTA_VIVA_REF);
    await waitFor(() =>
      expect(screen.getAllByText(HIDDEN_MEMBER_NAME)).toHaveLength(2),
    );
    expect(
      screen.getAllByText("They show on your page again once they're visible"),
    ).toHaveLength(2);
    expect(
      screen.getByRole("button", {
        name: `Remove from team: ${HIDDEN_MEMBER_NAME}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `Cancel invite: ${HIDDEN_MEMBER_NAME}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^(Approve|Decline)/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: `Remove from team: ${HIDDEN_MEMBER_NAME}`,
      }),
    );
    expect(
      await screen.findByText("Remove this member from your team?"),
    ).toBeInTheDocument();
  });

  it("offers the Members tab beside Personas in the invite picker", async () => {
    renderSection(TINTA_VIVA_REF);
    expect(
      await screen.findByRole("tab", { name: "Members" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Personas" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
