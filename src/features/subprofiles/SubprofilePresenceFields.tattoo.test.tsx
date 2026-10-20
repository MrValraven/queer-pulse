import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppRoutes } from "../../app/routes";
import { TestProviders } from "../../test/TestProviders";
import { FIELD_ANCHOR_ID } from "./publishChecklist.data";

/**
 * The Presence pane for a tattoo artist: the books status sets the
 * availability, so the select gives way to a line naming that status, with a
 * button to the Booking chapter. Every other kind keeps the select. Demo mode,
 * through the real route tree: the demo viewer owns the Agulha Lenta tattoo
 * persona and the developer draft.
 */

const TATTOO_EDITOR = "/account/subprofiles/sp-tiago-agulha-lenta/edit";
const DEVELOPER_EDITOR = "/account/subprofiles/sp-tiago-draft/edit";
const LOAD_TIMEOUT = { timeout: 5000 };

/** Reports the router's current search string, read beside `<AppRoutes>`. */
function SearchProbe() {
  const location = useLocation();
  return <div data-testid="search-probe">{location.search}</div>;
}

function renderEditorAt(entry: string) {
  return render(
    <TestProviders initialEntries={[entry]}>
      <AppRoutes />
      <SearchProbe />
    </TestProviders>,
  );
}

async function findAvailabilityField(): Promise<HTMLElement> {
  await waitFor(
    () =>
      expect(
        document.getElementById(FIELD_ANCHOR_ID.availability),
      ).not.toBeNull(),
    LOAD_TIMEOUT,
  );
  return document.getElementById(FIELD_ANCHOR_ID.availability) as HTMLElement;
}

function currentSearchParams(): URLSearchParams {
  return new URLSearchParams(
    screen.getByTestId("search-probe").textContent ?? "",
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("SubprofilePresenceFields for a tattoo artist (demo mode)", () => {
  it("replaces the availability select with the books status line", async () => {
    renderEditorAt(`${TATTOO_EDITOR}?pane=presence`);

    const availabilityField = await findAvailabilityField();
    expect(
      await within(availabilityField).findByText(
        /Set by your books status/,
        undefined,
        LOAD_TIMEOUT,
      ),
    ).toBeInTheDocument();
    expect(
      availabilityField.querySelector('[aria-haspopup="listbox"]'),
    ).toBeNull();
    expect(
      within(availabilityField).queryByRole("combobox", {
        name: "Availability",
      }),
    ).toBeNull();
    expect(
      within(availabilityField).queryByRole("button", {
        name: "Availability",
      }),
    ).toBeNull();
  });

  it("opens the Booking chapter from the line", async () => {
    const user = userEvent.setup();
    renderEditorAt(`${TATTOO_EDITOR}?pane=presence`);

    const availabilityField = await findAvailabilityField();
    const changeButton = await within(availabilityField).findByRole(
      "button",
      { name: "Change books status" },
      LOAD_TIMEOUT,
    );
    await user.click(changeButton);

    await waitFor(() => {
      const searchParams = currentSearchParams();
      expect(searchParams.get("pane")).toBe("skinBlocks");
      expect(searchParams.get("chapter")).toBe("booking");
    });
  });

  it("keeps the select for every other kind", async () => {
    renderEditorAt(`${DEVELOPER_EDITOR}?pane=presence`);

    const availabilityField = await findAvailabilityField();
    const availabilitySelect = await within(availabilityField).findByRole(
      "button",
      { name: "Availability" },
      LOAD_TIMEOUT,
    );
    expect(availabilitySelect).toHaveAttribute("aria-haspopup", "listbox");
    expect(
      within(availabilityField).queryByText(/Set by your books status/),
    ).toBeNull();
    expect(
      within(availabilityField).queryByRole("button", {
        name: "Change books status",
      }),
    ).toBeNull();
  });
});
