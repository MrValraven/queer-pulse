import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminSettingsHistory } from "./AdminSettingsHistory";
import type { PlatformSettingChangeDTO } from "./api/platformSettings.api";

// The component calls usePlatformSettingChanges() itself, so the query
// boundary is mocked directly (same convention as AdminSettingsAccess.test.tsx)
// to get full control over the exact rows rendered, including edge-case
// actorId/oldValue/newValue combinations a real fixture wouldn't conveniently
// produce all at once.
let changes: PlatformSettingChangeDTO[] | undefined = [];
let isLoading = false;
let isError = false;
vi.mock("./api/usePlatformSettings", () => ({
  usePlatformSettingChanges: () => ({ data: changes, isLoading, isError }),
}));

beforeEach(() => {
  changes = [];
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
  actorId: "admin-1",
  settingKey: "registrationEnabled",
  oldValue: "true",
  newValue: "false",
  note: null,
  createdAt: "2026-07-18T08:02:00.000Z",
};

describe("AdminSettingsHistory", () => {
  it("shows the empty state when there are no rows", () => {
    changes = [];
    renderHistory();
    expect(screen.getByText("No changes yet.")).toBeInTheDocument();
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

  it("says the load failed rather than 'No changes yet.' on error", () => {
    changes = undefined;
    isError = true;
    renderHistory();
    expect(screen.queryByText("No changes yet.")).not.toBeInTheDocument();
    expect(
      screen.getByText("Couldn’t load recent changes."),
    ).toBeInTheDocument();
  });

  it("renders the deleted-admin label rather than a blank when actorId is null", () => {
    changes = [{ ...base, actorId: null }];
    renderHistory();
    expect(screen.getByText("by a deleted admin")).toBeInTheDocument();
  });

  it("renders boolean strings as on/off rather than the raw \"true\"/\"false\"", () => {
    changes = [{ ...base, oldValue: "true", newValue: "false" }];
    renderHistory();
    expect(
      screen.getByText("Registration: on → off"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\btrue\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bfalse\b/)).not.toBeInTheDocument();
  });

  it("renders a null newValue as \"cleared\" rather than the literal null", () => {
    changes = [
      {
        ...base,
        settingKey: "lockdownMessage",
        oldValue: "Back soon.",
        newValue: null,
      },
    ];
    renderHistory();
    expect(
      screen.getByText("Maintenance message: Back soon. → cleared"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\bnull\b/)).not.toBeInTheDocument();
  });
});
