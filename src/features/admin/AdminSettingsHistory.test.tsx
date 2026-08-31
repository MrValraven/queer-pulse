import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { Paginated } from "../../shared/api/refs";
import { AdminSettingsHistory } from "./AdminSettingsHistory";
import type { PlatformSettingChangeDTO } from "./api/platformSettings.api";

// The component calls usePlatformSettingChanges() itself, so the query
// boundary is mocked directly (same convention as AdminSettingsAccess.test.tsx)
// to get full control over the exact rows rendered, including edge-case
// actor/oldValue/newValue combinations a real fixture wouldn't conveniently
// produce all at once.
//
// The hook answers with the `Paginated` envelope (ENG-50), so these tests set
// rows through `setRows`, which wraps them in one whose `total` matches the row
// count. The truncation test below sets a larger `total` deliberately, which is
// the only case where the two differ.
let changes: Paginated<PlatformSettingChangeDTO> | undefined = envelope([]);
let isLoading = false;
let isError = false;
vi.mock("./api/usePlatformSettings", () => ({
  usePlatformSettingChanges: () => ({ data: changes, isLoading, isError }),
}));

function envelope(
  items: PlatformSettingChangeDTO[],
  total = items.length,
): Paginated<PlatformSettingChangeDTO> {
  return { items, total, page: 1, pageSize: 50 };
}

/** Sets the rows the mocked hook returns, with a truthful `total`. */
function setRows(items: PlatformSettingChangeDTO[]) {
  changes = envelope(items);
}

beforeEach(() => {
  changes = envelope([]);
  isLoading = false;
  isError = false;
});

function renderHistory() {
  return render(
    <TestProviders>
      <AdminSettingsHistory />
    </TestProviders>,
  );
}

const base: PlatformSettingChangeDTO = {
  id: "chg-1",
  actor: {
    slug: "ana-ferreira",
    firstName: "Ana",
    lastName: "Ferreira",
    avatarUrl: null,
  },
  settingKey: "registrationEnabled",
  oldValue: "true",
  newValue: "false",
  note: null,
  createdAt: "2026-07-18T08:02:00.000Z",
};

describe("AdminSettingsHistory", () => {
  // The `admin:` namespace loads as its own async chunk, so a translated
  // string is only on screen one render after mount — await it via findBy
  // rather than querying synchronously (which catches the raw key).
  it("shows the empty state when there are no rows", async () => {
    setRows([]);
    renderHistory();
    expect(await screen.findByText("No changes yet.")).toBeInTheDocument();
  });

  // `data` is undefined while loading and after a failure just as it is for a
  // genuinely empty trail. Telling an admin mid-incident that this platform has
  // never been changed is the single most misleading thing an audit tab can say.
  it("does not claim 'No changes yet.' while the audit is still loading", () => {
    changes = undefined;
    isLoading = true;
    renderHistory();
    expect(screen.queryByText("No changes yet.")).not.toBeInTheDocument();
  });

  it("says the load failed rather than 'No changes yet.' on error", async () => {
    changes = undefined;
    isError = true;
    renderHistory();
    expect(
      await screen.findByText("Couldn’t load recent changes."),
    ).toBeInTheDocument();
    expect(screen.queryByText("No changes yet.")).not.toBeInTheDocument();
  });

  it("renders the deleted-admin label rather than a blank when the actor is null", async () => {
    setRows([{ ...base, actor: null }]);
    renderHistory();
    expect(await screen.findByText("by a deleted admin")).toBeInTheDocument();
  });

  it("names the acting admin rather than printing an id", async () => {
    setRows([base]);
    renderHistory();
    expect(await screen.findByText("by Ana Ferreira")).toBeInTheDocument();
  });

  // ENG-50. Without the notice, a window onto a longer trail and a complete
  // one look identical, and an admin auditing "who turned lockdown on" would
  // read a truncated first page as proof that nobody did.
  it("says the trail is longer than the page when total exceeds the rows shown", async () => {
    changes = envelope([base], 214);
    renderHistory();
    expect(
      await screen.findByText(
        "Showing 1 of 214 changes, newest first. Older entries are not on this page.",
      ),
    ).toBeInTheDocument();
  });

  it("shows no truncation notice when the page is the whole trail", async () => {
    setRows([base]);
    renderHistory();
    expect(await screen.findByText("by Ana Ferreira")).toBeInTheDocument();
    expect(screen.queryByText(/214/)).not.toBeInTheDocument();
  });

  it('renders boolean strings as on/off rather than the raw "true"/"false"', async () => {
    setRows([{ ...base, oldValue: "true", newValue: "false" }]);
    renderHistory();
    // The row reads through `admin:settings.history.changed`
    // ("{setting}: from {from} to {to}"), so this asserts the two values are
    // rendered as on/off rather than the raw booleans that arrive on the wire.
    expect(
      await screen.findByText("Registration: from on to off"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\btrue\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bfalse\b/)).not.toBeInTheDocument();
  });

  it('renders a null newValue as "cleared" rather than the literal null', async () => {
    setRows([
      {
        ...base,
        settingKey: "lockdownMessage",
        oldValue: "Back soon.",
        newValue: null,
      },
    ]);
    renderHistory();
    expect(
      await screen.findByText(
        "Maintenance message: from Back soon. to cleared",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\bnull\b/)).not.toBeInTheDocument();
  });
});
