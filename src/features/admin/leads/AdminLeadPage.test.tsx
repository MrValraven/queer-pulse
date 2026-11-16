import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { currentUser } from "../../members/data/demoCurrentUser";
import { leadReasonOf } from "./api/leads.types";
import { AdminLeadPage } from "./AdminLeadPage";
import { adminLeadPath } from "./leadPaths";
import {
  demoDeleteLead,
  demoGetLead,
  demoUpdateLead,
  resetDemoLeads,
} from "./leadsDemoStore";

// TestProviders forces demo mode, so the page reads and writes the demo
// leads store.

const CAVE_ID = "demo-lead-cave-23";
const VIEWER_NAME = `${currentUser.first} ${currentUser.last}`;
/** What the list route draws in these tests. */
const LIST_PAGE_TEXT = "List";

function renderLeadPage(leadId: string = CAVE_ID) {
  const user = userEvent.setup();
  render(
    <TestProviders initialEntries={[adminLeadPath(leadId)]}>
      <Routes>
        <Route
          path={`${routes.adminLeads}/:leadId`}
          element={<AdminLeadPage />}
        />
        <Route path={routes.adminLeads} element={<p>{LIST_PAGE_TEXT}</p>} />
      </Routes>
    </TestProviders>,
  );
  return user;
}

/** The Details card's section, which the page labels by its heading. */
function detailsRegion() {
  return screen.getByRole("region", { name: "Details" });
}

/** Opens edit mode and waits for the form to take focus on the name. */
async function openEditMode(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Edit details" }));
  await waitFor(() =>
    expect(within(detailsRegion()).getByLabelText(/^Name/)).toHaveFocus(),
  );
}

/** The reason code a demo read of the lead answers with, or null when the
 *  lead is still there. */
function readReasonOf(leadId: string) {
  try {
    demoGetLead(leadId);
    return null;
  } catch (cause) {
    return leadReasonOf(cause);
  }
}

describe("AdminLeadPage (demo)", () => {
  beforeEach(() => resetDemoLeads());

  it("shows details, persona, history and delete", async () => {
    renderLeadPage();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Cave 23" }),
    ).toBeInTheDocument();
    for (const heading of [
      "Details",
      "In charge",
      "Persona",
      "History",
      "Delete lead",
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Email Cave 23" })).toHaveAttribute(
      "href",
      "mailto:bookings@cave23.example",
    );
    expect(screen.getByRole("link", { name: "Call Cave 23" })).toHaveAttribute(
      "href",
      "tel:+351000000223",
    );
    // Email and Call sit in the page header, outside the Details card.
    expect(
      within(detailsRegion()).queryByRole("link", { name: "Email Cave 23" }),
    ).not.toBeInTheDocument();
  });

  it("reads the access-ended line in the history", async () => {
    renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    expect(
      await screen.findByText(
        "Teo Ramos was unassigned when their Leads access ended",
      ),
    ).toBeInTheDocument();
  });

  it("saves a stage change at once and logs it", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });

    await user.click(screen.getByRole("button", { name: /Stage/ }));
    await user.click(screen.getByRole("option", { name: "On board" }));

    expect(
      await screen.findByText(
        `${VIEWER_NAME} moved this from In talks to On board`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Moved to On board")).toBeInTheDocument();
    expect(demoGetLead(CAVE_ID).stage).toBe("on_board");
  });

  it("follows a colleague's change while the form holds no edits", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    await openEditMode(user);

    // A colleague moves the lead; our next write answers with the whole
    // lead, their change with it.
    act(() => {
      demoUpdateLead(CAVE_ID, { location: "Porto, Bonfim" });
    });
    await user.type(screen.getByLabelText("New note"), "Called");
    await user.click(screen.getByRole("button", { name: "Add note" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Location")).toHaveValue("Porto, Bonfim"),
    );
    // Nothing differs from the stored lead, so there is nothing to save.
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps our edit and a colleague's change apart when saving", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    await openEditMode(user);

    const phone = screen.getByLabelText("Phone");
    await user.clear(phone);
    await user.type(phone, "+351 000 000 999");
    act(() => {
      demoUpdateLead(CAVE_ID, { location: "Porto, Bonfim" });
    });
    await user.type(screen.getByLabelText("New note"), "Called");
    await user.click(screen.getByRole("button", { name: "Add note" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Location")).toHaveValue("Porto, Bonfim"),
    );
    expect(phone).toHaveValue("+351 000 000 999");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Changes saved")).toBeInTheDocument();
    expect(demoGetLead(CAVE_ID).phone).toBe("+351 000 000 999");
    expect(demoGetLead(CAVE_ID).location).toBe("Porto, Bonfim");
  });

  it("clears the follow-up with one click", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    expect(demoGetLead(CAVE_ID).followUpOn).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Clear follow-up" }));

    await waitFor(() => expect(demoGetLead(CAVE_ID).followUpOn).toBeNull());
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Clear follow-up" }),
      ).not.toBeInTheDocument(),
    );
    // The read view stays open, and the follow-up's place reads empty.
    expect(
      screen.queryByRole("button", { name: "Save changes" }),
    ).not.toBeInTheDocument();
    expect(within(detailsRegion()).getByText("Not added")).toBeInTheDocument();
  });

  it("deletes the lead after the confirm", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });

    await user.click(screen.getByRole("button", { name: "Delete lead" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/deleted for good/)).toBeInTheDocument();
    // Cancel is the safer action, so the dialog opens on it.
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Cancel" }),
      ).toHaveFocus(),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Delete lead" }),
    );

    expect(await screen.findByText(LIST_PAGE_TEXT)).toBeInTheDocument();
    expect(await screen.findByText("Cave 23 was deleted")).toBeInTheDocument();
    expect(readReasonOf(CAVE_ID)).toBe("LEAD_NOT_FOUND");
  });

  it("shows the not-found state when the lead was deleted elsewhere", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });

    act(() => {
      demoDeleteLead(CAVE_ID);
    });
    await user.type(screen.getByLabelText("New note"), "Called");
    await user.click(screen.getByRole("button", { name: "Add note" }));

    expect(
      await screen.findByText("This lead isn't here anymore"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to leads" })).toHaveAttribute(
      "href",
      routes.adminLeads,
    );
    expect(
      screen.queryByRole("heading", { level: 1, name: "Cave 23" }),
    ).not.toBeInTheDocument();
  });
});

describe("AdminLeadPage details card (demo)", () => {
  beforeEach(() => resetDemoLeads());

  it("opens in the read view with no inputs", async () => {
    renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    const details = detailsRegion();

    expect(within(details).queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      within(details).queryByRole("button", { name: "Save changes" }),
    ).not.toBeInTheDocument();
    expect(within(details).getByText("Lisbon, Marvila")).toBeInTheDocument();
    expect(
      within(details).getByRole("link", { name: "bookings@cave23.example" }),
    ).toHaveAttribute("href", "mailto:bookings@cave23.example");
    expect(
      within(details).getByRole("link", { name: /^Instagram/ }),
    ).toHaveAttribute("target", "_blank");
    // The stage is the list's first row, a select named by its label.
    expect(within(details).getAllByRole("term")[0]).toHaveTextContent("Stage");
    expect(
      within(details).getByRole("button", { name: "Stage" }),
    ).toBeInTheDocument();
    // The demo follow-up day has passed.
    expect(within(details).getByText(/^Overdue since /)).toBeInTheDocument();
  });

  it("shows the form on Edit details and focuses the name", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });

    await openEditMode(user);

    expect(within(detailsRegion()).getByLabelText("Location")).toHaveValue(
      "Lisbon, Marvila",
    );
    expect(
      within(detailsRegion()).getByRole("button", { name: "Save changes" }),
    ).toHaveAttribute("aria-disabled", "true");
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Edit details" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps the stage row and drops Clear follow-up in edit mode", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    await openEditMode(user);
    const details = detailsRegion();

    expect(
      within(details).getByRole("button", { name: "Stage" }),
    ).toBeInTheDocument();
    expect(
      within(details).getByText("Stage saves as soon as you pick it"),
    ).toBeInTheDocument();
    expect(
      within(details).queryByRole("button", { name: "Clear follow-up" }),
    ).not.toBeInTheDocument();
  });

  it("clears the follow-up date in the form without saving it", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    const storedFollowUp = demoGetLead(CAVE_ID).followUpOn;
    expect(storedFollowUp).not.toBeNull();
    await openEditMode(user);

    await user.click(
      within(detailsRegion()).getByRole("button", { name: "Clear" }),
    );
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).not.toHaveAttribute("aria-disabled");
    expect(demoGetLead(CAVE_ID).followUpOn).toBe(storedFollowUp);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(
        within(detailsRegion()).queryByRole("textbox"),
      ).not.toBeInTheDocument(),
    );
    expect(demoGetLead(CAVE_ID).followUpOn).toBe(storedFollowUp);
  });

  it("drops the edits on Cancel and returns to the read view", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    await openEditMode(user);

    const location = within(detailsRegion()).getByLabelText("Location");
    await user.clear(location);
    await user.type(location, "Porto, Bonfim");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        within(detailsRegion()).queryByRole("textbox"),
      ).not.toBeInTheDocument(),
    );
    expect(
      within(detailsRegion()).getByText("Lisbon, Marvila"),
    ).toBeInTheDocument();
    expect(demoGetLead(CAVE_ID).location).toBe("Lisbon, Marvila");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Edit details" }),
      ).toHaveFocus(),
    );
  });

  it("saves edited details and returns to the read view", async () => {
    const user = renderLeadPage();
    await screen.findByRole("heading", { level: 1, name: "Cave 23" });
    expect(
      screen.queryByRole("button", { name: "Save changes" }),
    ).not.toBeInTheDocument();
    await openEditMode(user);

    const location = within(detailsRegion()).getByLabelText("Location");
    await user.clear(location);
    await user.type(location, "Lisbon, Beato");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Changes saved")).toBeInTheDocument();
    expect(demoGetLead(CAVE_ID).location).toBe("Lisbon, Beato");
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Save changes" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      within(detailsRegion()).queryByRole("textbox"),
    ).not.toBeInTheDocument();
    expect(
      within(detailsRegion()).getByText("Lisbon, Beato"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Edit details" }),
      ).toHaveFocus(),
    );
  });
});
