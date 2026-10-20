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
  replaceListingTeamDemoRows,
  resetListingTeamDemo,
} from "../api/listingTeam.demo";
import { ListingTeamInvitePicker } from "./ListingTeamInvitePicker";

const NAVALHA_REF = "QPL-DEMO-0202";
const SEARCH_LABEL = "Find a persona by name or @handle";
const ROLE_LABEL = "Role on your page (optional)";

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

function fortyPendingRows(): DemoTeamRow[] {
  return Array.from({ length: 40 }, (_, index) => ({
    id: `filler-link-${index}`,
    listingId: "demo-listing-navalha",
    subprofileId: `sp-filler-${index}`,
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
      inPicker().getByRole("heading", { name: "Invite a persona" }),
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
