import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { DemoTeamRow } from "../api/listingTeam.demo.data";
import {
  demoGetListingTeam,
  replaceListingTeamDemoRows,
  resetListingTeamDemo,
  setDemoTeamMemberHidden,
} from "../api/listingTeam.demo";
import { ListingTeamInvitePicker } from "./ListingTeamInvitePicker";

const NAVALHA_REF = "QPL-DEMO-0202";
const SEARCH_LABEL = "Find a persona by name or @handle";
const ROLE_LABEL = "Role on your page (optional)";
const MEMBER_SEARCH_LABEL = "Find a member among your connections";
const INVITE_MEMBER_BUTTON = "Invite member to team";

beforeEach(() => {
  window.localStorage.clear();
  resetListingTeamDemo();
});

function renderPicker(isListingOpen = true) {
  return render(
    <div data-testid="picker">
      <ListingTeamInvitePicker
        listingRef={NAVALHA_REF}
        isListingOpen={isListingOpen}
      />
    </div>,
    { wrapper: TestProviders },
  );
}

function inPicker() {
  return within(screen.getByTestId("picker"));
}

function search(text: string) {
  fireEvent.change(screen.getByLabelText(SEARCH_LABEL), {
    target: { value: text },
  });
}

async function openMembersTab() {
  fireEvent.click(screen.getByRole("tab", { name: "Members" }));
  return screen.findByLabelText(MEMBER_SEARCH_LABEL);
}

/** Picks a demo connection from the Members tab and waits for the pick. */
async function pickMember(name: RegExp) {
  await openMembersTab();
  const option = await screen.findByRole("option", { name });
  fireEvent.click(option);
  await waitFor(() =>
    expect(screen.getByRole("option", { name })).toHaveAttribute(
      "aria-selected",
      "true",
    ),
  );
}

function fortyPendingRows(): DemoTeamRow[] {
  return Array.from({ length: 40 }, (_, index) => ({
    id: `filler-link-${index}`,
    listingId: "demo-listing-navalha",
    subprofileId: `sp-filler-${index}`,
    userId: null,
    status: "pending",
    initiatedBy: "listing",
    roleLabel: null,
    position: null,
    createdAt: "2026-10-01T10:00:00.000Z",
    answeredAt: null,
  }));
}

describe("ListingTeamInvitePicker", () => {
  it("asks for two characters before searching", () => {
    renderPicker();
    search("a");
    expect(screen.getByText("Type at least 2 characters")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("finds a persona by handle and marks where it stands", async () => {
    renderPicker();
    search("@agu");
    expect(await screen.findByText("Agulha Lenta")).toBeInTheDocument();
    expect(screen.getByText(/@agulha-lenta/)).toBeInTheDocument();
    expect(screen.getByText(/Tattoo artist/)).toBeInTheDocument();
    expect(screen.getByText("Waiting for an answer")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Invite to team: Agulha Lenta/ }),
    ).not.toBeInTheDocument();
    expect(inPicker().getByRole("status")).toHaveTextContent("1 persona found");
  });

  it("invites with the role label typed above", async () => {
    renderPicker();
    const roleField = screen.getByLabelText(ROLE_LABEL);
    fireEvent.change(roleField, { target: { value: "Guest artist" } });
    search("rosa");
    fireEvent.click(
      await screen.findByRole("button", { name: "Invite to team: Rosa Brava" }),
    );
    expect(await screen.findByText("Invite sent")).toBeInTheDocument();
    expect(
      await screen.findByText("Waiting for an answer"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(ROLE_LABEL)).toHaveValue("");
  });

  it("shows a refused invite inline", async () => {
    replaceListingTeamDemoRows(fortyPendingRows());
    renderPicker();
    search("rosa");
    fireEvent.click(
      await screen.findByRole("button", { name: "Invite to team: Rosa Brava" }),
    );
    const alert = await inPicker().findByRole("alert");
    expect(alert).toHaveTextContent(
      "You have 40 invites and requests waiting. Answer or cancel some before sending more",
    );
  });

  it("blocks invites while the listing is not live", async () => {
    renderPicker(false);
    search("rosa");
    const button = await screen.findByRole("button", {
      name: "Invite to team: Rosa Brava",
    });
    expect(button).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(button);
    expect(screen.queryByText("Invite sent")).not.toBeInTheDocument();
    expect(inPicker().queryByRole("alert")).not.toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it("shows the invite heading above the role field", () => {
    renderPicker();
    expect(
      inPicker().getByRole("heading", { name: "Invite to your team" }),
    ).toBeInTheDocument();
  });

  it("shows a refusal under the failing row and clears it when the search changes", async () => {
    replaceListingTeamDemoRows(fortyPendingRows());
    renderPicker();
    search("rosa");
    fireEvent.click(
      await screen.findByRole("button", { name: "Invite to team: Rosa Brava" }),
    );
    const alert = await inPicker().findByRole("alert");
    expect(alert.closest("li")).toHaveTextContent("Rosa Brava");
    search("rosas");
    await waitFor(() =>
      expect(inPicker().queryByRole("alert")).not.toBeInTheDocument(),
    );
  });

  it("moves focus to the chip after a successful invite", async () => {
    renderPicker();
    search("rosa");
    fireEvent.click(
      await screen.findByRole("button", { name: "Invite to team: Rosa Brava" }),
    );
    const chip = await screen.findByText("Waiting for an answer");
    await waitFor(() => expect(chip.parentElement).toHaveFocus());
  });

  it("says when nothing matches", async () => {
    renderPicker();
    search("zzzz");
    expect(
      await screen.findByText("No published persona matches that"),
    ).toBeInTheDocument();
  });
});

describe("ListingTeamInvitePicker Members tab", () => {
  it("opens on Personas and switches to Members and back", async () => {
    renderPicker();
    expect(screen.getByRole("tab", { name: "Personas" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.queryByLabelText(MEMBER_SEARCH_LABEL),
    ).not.toBeInTheDocument();

    await openMembersTab();
    expect(screen.getByRole("tab", { name: "Members" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await waitFor(() =>
      expect(screen.queryByLabelText(SEARCH_LABEL)).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("tab", { name: "Personas" }));
    expect(await screen.findByLabelText(SEARCH_LABEL)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByLabelText(MEMBER_SEARCH_LABEL),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps the one role field above both tabs", async () => {
    renderPicker();
    fireEvent.change(screen.getByLabelText(ROLE_LABEL), {
      target: { value: "Colourist" },
    });
    await openMembersTab();
    expect(screen.getAllByLabelText(ROLE_LABEL)).toHaveLength(1);
    expect(screen.getByLabelText(ROLE_LABEL)).toHaveValue("Colourist");
  });

  it("lists connections and asks for a pick before the button works", async () => {
    renderPicker();
    await openMembersTab();
    expect(
      await screen.findByRole("option", { name: /Jonas Ferreira/ }),
    ).toBeInTheDocument();
    const button = screen.getByRole("button", { name: INVITE_MEMBER_BUTTON });
    expect(button).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(button);
    expect(screen.queryByText("Invite sent")).not.toBeInTheDocument();
  });

  it("invites the picked connection with the role typed above", async () => {
    renderPicker();
    fireEvent.change(screen.getByLabelText(ROLE_LABEL), {
      target: { value: "Colourist" },
    });
    await pickMember(/Jonas Ferreira/);
    fireEvent.click(
      screen.getByRole("button", {
        name: `${INVITE_MEMBER_BUTTON}: Jonas Ferreira`,
      }),
    );
    expect(await screen.findByText("Invite sent")).toBeInTheDocument();
    expect(screen.getByLabelText(ROLE_LABEL)).toHaveValue("");
    const invited = demoGetListingTeam(NAVALHA_REF).invitesSent.find(
      (row) => row.kind === "member",
    );
    expect(invited?.member?.slug).toBe("jonas");
    expect(invited?.roleLabel).toBe("Colourist");
    expect(invited?.status).toBe("pending");
    await waitFor(() =>
      expect(
        screen.queryByRole("option", { name: /Jonas Ferreira/ }),
      ).not.toBeInTheDocument(),
    );
  });

  it("can tick a pick again after a new search left it out", async () => {
    renderPicker();
    await pickMember(/Jonas Ferreira/);
    fireEvent.change(screen.getByLabelText(MEMBER_SEARCH_LABEL), {
      target: { value: "luisa" },
    });
    await screen.findByRole("option", { name: /Luísa/ });
    const heldRow = screen.getByRole("option", { name: /Jonas Ferreira/ });
    fireEvent.click(heldRow);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /Jonas Ferreira/ }),
      ).toHaveAttribute("aria-selected", "false"),
    );
    fireEvent.click(screen.getByRole("option", { name: /Jonas Ferreira/ }));
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /Jonas Ferreira/ }),
      ).toHaveAttribute("aria-selected", "true"),
    );
    expect(
      screen.getByRole("button", {
        name: `${INVITE_MEMBER_BUTTON}: Jonas Ferreira`,
      }),
    ).toBeInTheDocument();
  });

  it("names the cause when the business has too many invites waiting", async () => {
    replaceListingTeamDemoRows(fortyPendingRows());
    renderPicker();
    await pickMember(/Jonas Ferreira/);
    fireEvent.click(
      screen.getByRole("button", {
        name: `${INVITE_MEMBER_BUTTON}: Jonas Ferreira`,
      }),
    );
    expect(await inPicker().findByRole("alert")).toHaveTextContent(
      "You have 40 invites and requests waiting. Answer or cancel some before sending more",
    );
  });

  it("names the cause when the member's profile cannot join a team", async () => {
    setDemoTeamMemberHidden("jonas", true);
    renderPicker();
    await pickMember(/Jonas Ferreira/);
    fireEvent.click(
      screen.getByRole("button", {
        name: `${INVITE_MEMBER_BUTTON}: Jonas Ferreira`,
      }),
    );
    expect(await inPicker().findByRole("alert")).toHaveTextContent(
      "This member can't join a team right now. Their profile needs to be open and visible",
    );
    expect(screen.queryByText("Invite sent")).not.toBeInTheDocument();
  });

  it("blocks member invites while the listing is not live", async () => {
    renderPicker(false);
    await pickMember(/Jonas Ferreira/);
    const button = screen.getByRole("button", {
      name: `${INVITE_MEMBER_BUTTON}: Jonas Ferreira`,
    });
    expect(button).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(button);
    expect(screen.queryByText("Invite sent")).not.toBeInTheDocument();
    expect(inPicker().queryByRole("alert")).not.toBeInTheDocument();
  });
});
