import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  replaceListingTeamDemoRows,
  resetListingTeamDemo,
} from "../../marketing/listBusiness/api/listingTeam.demo";
import {
  DEMO_TEAM_HIDDEN_LISTING,
  type DemoTeamRow,
} from "../../marketing/listBusiness/api/listingTeam.demo.data";
import type { SubprofileView } from "../api/subprofiles.adapters";
import { SubprofileWorksAtEditor } from "./SubprofileWorksAtEditor";

const PERSONA_ID = "sp-tiago-agulha-lenta";

function makeSubprofileView(
  overrides: Partial<SubprofileView> = {},
): SubprofileView {
  return {
    id: PERSONA_ID,
    kind: "tattoo_artist",
    slug: "agulha-lenta",
    handle: "agulha-lenta",
    displayName: "Agulha Lenta",
    avatarUrl: null,
    tagline: "",
    bio: "",
    coverUrl: null,
    accent: "coral",
    availability: null,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "linked",
    visibility: "open",
    status: "published",
    position: 0,
    sections: [],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    followerCount: 0,
    skinData: null,
    memberCount: 1,
    editVersion: 0,
    ...overrides,
  };
}

function renderEditor(overrides: Partial<SubprofileView> = {}) {
  return render(
    <TestProviders>
      <SubprofileWorksAtEditor subprofile={makeSubprofileView(overrides)} />
    </TestProviders>,
  );
}

async function findList(name: string) {
  return screen.findByRole("list", { name });
}

beforeEach(resetListingTeamDemo);

describe("SubprofileWorksAtEditor", () => {
  it("lists the invite, the request and the team", async () => {
    renderEditor();

    const invites = await findList("Invites");
    expect(within(invites).getByText("Navalha")).toBeInTheDocument();
    expect(within(invites).getByText("As Guest artist")).toBeInTheDocument();

    const requests = await findList("Requests sent");
    expect(within(requests).getByText("Studio Cabelo")).toBeInTheDocument();

    const team = await findList("Where you work");
    expect(within(team).getByText("As Apprentice")).toBeInTheDocument();
    expect(
      within(team).getByRole("link", { name: "Tinta Viva" }),
    ).toHaveAttribute("href", "/local/directory/tinta-viva");
  });

  it("accepts an invite and moves it to Where you work", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", {
        name: "Accept the invite from Navalha",
      }),
    );

    expect(await screen.findByText("Invite accepted")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("list", { name: "Invites" })).toBeNull(),
    );
    const team = await findList("Where you work");
    const names = within(team)
      .getAllByRole("listitem")
      .map((item) => item.textContent ?? "");
    expect(names[names.length - 1]).toContain("Navalha");
  });

  it("declines an invite", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", {
        name: "Decline the invite from Navalha",
      }),
    );

    expect(await screen.findByText("Invite declined")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("list", { name: "Invites" })).toBeNull(),
    );
    const team = await findList("Where you work");
    expect(within(team).queryByText("Navalha")).toBeNull();
  });

  it("cancels a sent request", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", {
        name: "Cancel request: Studio Cabelo",
      }),
    );

    expect(await screen.findByText("Request cancelled")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Studio Cabelo")).toBeNull());
  });

  it("asks before leaving a team", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", {
        name: "Leave team: Tinta Viva",
      }),
    );
    expect(
      await screen.findByText("Leave the team at Tinta Viva?"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Leave team" }));

    expect(await screen.findByText("You left the team")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "Tinta Viva" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps focus in the pane after accepting the last invite", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", {
        name: "Accept the invite from Navalha",
      }),
    );

    expect(await screen.findByText("Invite accepted")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Where you work" }),
      ).toHaveFocus(),
    );
  });

  it("holds every answer while one is in flight", async () => {
    renderEditor();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Accept the invite from Navalha",
      }),
    );

    for (const name of [
      "Decline the invite from Navalha",
      "Cancel request: Studio Cabelo",
      "Leave team: Tinta Viva",
    ]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
    expect(await screen.findByText("Invite accepted")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Leave team: Tinta Viva" }),
      ).not.toHaveAttribute("aria-disabled", "true"),
    );
  });

  it("offers a retry when the links fail to load", async () => {
    renderEditor({ id: "sp-not-in-the-demo" });

    expect(
      await screen.findByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "No business yet. Search for one above, or accept an invite",
      ),
    ).toBeNull();
    expect(screen.queryByRole("list", { name: "Where you work" })).toBeNull();
  });

  it("explains why a draft persona cannot join", async () => {
    renderEditor({ status: "draft" });

    expect(
      await screen.findByText(
        "Publish this persona with a handle, visible to members or everyone, to join a team",
      ),
    ).toHaveAttribute("role", "status");
    expect(
      await screen.findByRole("button", {
        name: "Accept the invite from Navalha",
      }),
    ).toHaveAttribute("aria-disabled", "true");
    for (const name of [
      "Decline the invite from Navalha",
      "Cancel request: Studio Cabelo",
      "Leave team: Tinta Viva",
    ]) {
      expect(screen.getByRole("button", { name })).not.toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
  });

  it("marks a hidden business", async () => {
    const hiddenRow: DemoTeamRow = {
      id: "demo-team-link-hidden-agulha-lenta",
      listingId: DEMO_TEAM_HIDDEN_LISTING.id,
      subprofileId: PERSONA_ID,
      status: "accepted",
      initiatedBy: "persona",
      roleLabel: null,
      position: 0,
      createdAt: "2026-10-01T10:00:00.000Z",
      answeredAt: "2026-10-02T10:00:00.000Z",
    };
    replaceListingTeamDemoRows([hiddenRow]);
    renderEditor();

    const team = await findList("Where you work");
    expect(
      within(team).getByText("Hidden from the directory right now"),
    ).toBeInTheDocument();
    expect(within(team).getByText(DEMO_TEAM_HIDDEN_LISTING.name)).toBeVisible();
    expect(
      within(team).queryByRole("link", { name: DEMO_TEAM_HIDDEN_LISTING.name }),
    ).toBeNull();
  });
});
