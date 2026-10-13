import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import { GuestCommunitiesPicker } from "./GuestCommunitiesPicker";

// Demo mode is on in tests: the search reads the static communities
// registry, and the demo viewer belongs to `queer-runners` and `trans-hub`
// only, so the private "Coming-Out Support" is outside their reach.

function entry(
  slug: string,
  name: string,
  status: GuestCommunityDraftEntry["status"],
): GuestCommunityDraftEntry {
  return { slug, name, accessTier: "public", status };
}

function renderPicker({
  leadSlug = "queer-runners",
  guests = [] as GuestCommunityDraftEntry[],
  helper = undefined as ReactNode,
} = {}) {
  const onChange = vi.fn();
  render(
    <TestProviders>
      <GuestCommunitiesPicker
        inputId="guest-search"
        describedById="guest-hint"
        ariaLabel="Guest communities"
        leadSlug={leadSlug}
        guests={guests}
        unsentLabel="Sends when you save"
        onChange={onChange}
        helper={helper}
      />
    </TestProviders>,
  );
  return { onChange };
}

/** Holds the guest list in state, so a pick or a removal re-renders the
 *  picker the way its surfaces do. */
function StatefulPicker({
  initialGuests,
}: {
  initialGuests: GuestCommunityDraftEntry[];
}) {
  const [guests, setGuests] = useState(initialGuests);
  return (
    <GuestCommunitiesPicker
      inputId="guest-search"
      describedById="guest-hint"
      ariaLabel="Guest communities"
      leadSlug="queer-runners"
      guests={guests}
      unsentLabel="Sends when you save"
      onChange={setGuests}
    />
  );
}

/** Whether the results list is open, read from the search's
 *  `aria-controls`, which flips with it on the same render. */
function isListOpen(): boolean {
  return searchBox().getAttribute("aria-controls") === "guest-search-results";
}

/** Lets the picker's deferred focus moves and their re-renders land. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  });
}

const documentKeyDown = vi.fn();
afterEach(() => {
  document.removeEventListener("keydown", documentKeyDown);
  documentKeyDown.mockClear();
});

function searchBox() {
  return screen.getByRole("searchbox", { name: "Guest communities" });
}

async function offeredNames(): Promise<string[]> {
  const results = await screen.findByRole("list", {
    name: "Communities you can invite",
  });
  return within(results)
    .getAllByRole("button")
    .map((option) => option.textContent ?? "");
}

describe("GuestCommunitiesPicker", () => {
  it("locks the search until a lead community is set", () => {
    renderPicker({ leadSlug: "" });
    expect(searchBox()).toBeDisabled();
  });

  it("never offers the lead, a listed community or a private one the viewer is outside", async () => {
    renderPicker({
      guests: [entry("queer-social", "Queer Social Lisbon", "accepted")],
    });
    fireEvent.focus(searchBox());
    const names = await offeredNames();
    expect(names.length).toBeGreaterThan(0);
    expect(names.some((name) => name.includes("Queer Runners Lisboa"))).toBe(
      false,
    );
    expect(names.some((name) => name.includes("Queer Social Lisbon"))).toBe(
      false,
    );
    expect(names.some((name) => name.includes("Coming-Out Support"))).toBe(
      false,
    );
  });

  it("adds a picked community as a row that sends on save", async () => {
    const { onChange } = renderPicker();
    fireEvent.focus(searchBox());
    fireEvent.change(searchBox(), { target: { value: "Rainbow" } });
    fireEvent.click(
      await screen.findByRole("button", { name: /Rainbow Arts Collective/ }),
    );
    expect(onChange).toHaveBeenCalledWith([
      {
        slug: "rainbow-arts",
        name: "Rainbow Arts Collective",
        accessTier: "request",
        status: "unsent",
      },
    ]);
  });

  it("labels each row with its status", () => {
    renderPicker({
      guests: [
        entry("trans-hub", "Trans & Non-Binary Hub", "accepted"),
        entry("rainbow-arts", "Rainbow Arts Collective", "pending"),
        entry("queer-elders", "Queer Elders", "declined"),
        entry("queer-social", "Queer Social Lisbon", "unsent"),
      ],
    });
    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]!).getByText("Joined")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Invited")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("Declined")).toBeInTheDocument();
    expect(
      within(rows[3]!).getByText("Sends when you save"),
    ).toBeInTheDocument();
  });

  it("removes the row whose Remove community is pressed", () => {
    const guests = [
      entry("trans-hub", "Trans & Non-Binary Hub", "accepted"),
      entry("rainbow-arts", "Rainbow Arts Collective", "pending"),
    ];
    const { onChange } = renderPicker({ guests });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Remove community" })[1]!,
    );
    expect(onChange).toHaveBeenCalledWith([guests[0]]);
  });

  it("offers no remove action on a declined row", () => {
    renderPicker({
      guests: [
        entry("queer-elders", "Queer Elders", "declined"),
        entry("rainbow-arts", "Rainbow Arts Collective", "pending"),
      ],
    });
    const rows = screen.getAllByRole("listitem");
    expect(
      within(rows[0]!).queryByRole("button", { name: "Remove community" }),
    ).not.toBeInTheDocument();
    expect(
      within(rows[1]!).getByRole("button", { name: "Remove community" }),
    ).toBeInTheDocument();
  });

  it("holds the search at five pending or joined guests", () => {
    renderPicker({
      guests: ["a", "b", "c", "d", "e"].map((slug) =>
        entry(slug, `Community ${slug}`, "pending"),
      ),
    });
    expect(searchBox()).toBeDisabled();
    expect(
      screen.getByText(
        "This gathering has 5 guest communities, the most it can have. Remove one to invite another.",
      ),
    ).toBeInTheDocument();
  });

  it("counts no declined row toward the five", () => {
    renderPicker({
      guests: [
        ...["a", "b", "c", "d"].map((slug) =>
          entry(slug, `Community ${slug}`, "pending"),
        ),
        entry("e", "Community e", "declined"),
      ],
    });
    expect(searchBox()).toBeEnabled();
  });

  it("closes the open list on Escape and keeps the key from a surrounding dialog", () => {
    renderPicker();
    document.addEventListener("keydown", documentKeyDown);
    fireEvent.focus(searchBox());
    expect(isListOpen()).toBe(true);
    fireEvent.keyDown(searchBox(), { key: "Escape" });
    expect(isListOpen()).toBe(false);
    expect(documentKeyDown).not.toHaveBeenCalled();
  });

  it("returns to the search on Escape from an option and keeps the key from a surrounding dialog", async () => {
    renderPicker();
    fireEvent.focus(searchBox());
    await offeredNames();
    document.addEventListener("keydown", documentKeyDown);
    const results = screen.getByRole("list", {
      name: "Communities you can invite",
    });
    fireEvent.keyDown(within(results).getAllByRole("button")[0]!, {
      key: "Escape",
    });
    expect(searchBox()).toHaveFocus();
    expect(isListOpen()).toBe(false);
    expect(documentKeyDown).not.toHaveBeenCalled();
  });

  it("returns focus to the search after a removal and leaves the list closed over the rows", async () => {
    renderPicker({
      guests: [entry("rainbow-arts", "Rainbow Arts Collective", "pending")],
    });
    fireEvent.click(screen.getByRole("button", { name: "Remove community" }));
    await waitFor(() => expect(searchBox()).toHaveFocus());
    await settle();
    expect(isListOpen()).toBe(false);
  });

  it("reopens the list when the focused search is clicked after a pick", async () => {
    renderPicker();
    fireEvent.focus(searchBox());
    fireEvent.change(searchBox(), { target: { value: "Rainbow" } });
    fireEvent.click(
      await screen.findByRole("button", { name: /Rainbow Arts Collective/ }),
    );
    expect(searchBox()).toHaveFocus();
    expect(isListOpen()).toBe(false);
    fireEvent.click(searchBox());
    expect(isListOpen()).toBe(true);
  });

  it("moves focus to the cap note when a pick fills the fifth place", async () => {
    render(
      <TestProviders>
        <StatefulPicker
          initialGuests={["a", "b", "c", "d"].map((slug) =>
            entry(slug, `Community ${slug}`, "pending"),
          )}
        />
      </TestProviders>,
    );
    fireEvent.focus(searchBox());
    fireEvent.change(searchBox(), { target: { value: "Rainbow" } });
    fireEvent.click(
      await screen.findByRole("button", { name: /Rainbow Arts Collective/ }),
    );
    const capNote = await screen.findByText(
      "This gathering has 5 guest communities, the most it can have. Remove one to invite another.",
    );
    await waitFor(() => expect(capNote).toHaveFocus());
    expect(searchBox()).toBeDisabled();
  });

  it("shows the hint between the search and the rows and reads it with the search", () => {
    renderPicker({
      guests: [entry("rainbow-arts", "Rainbow Arts Collective", "pending")],
      helper: "Invite other communities to host it with you.",
    });
    const hint = screen.getByText(
      "Invite other communities to host it with you.",
    );
    expect(hint).toHaveAttribute("id", "guest-hint");
    expect(searchBox()).toHaveAccessibleDescription(
      "Invite other communities to host it with you.",
    );
    const firstRow = screen.getAllByRole("listitem")[0]!;
    expect(
      hint.compareDocumentPosition(firstRow) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      searchBox().compareDocumentPosition(hint) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders no hint element of its own when none is passed", () => {
    renderPicker();
    expect(document.getElementById("guest-hint")).toBeNull();
  });
});
