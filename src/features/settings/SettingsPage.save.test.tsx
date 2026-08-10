import { render, screen, fireEvent } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SettingsPage } from "./SettingsPage";

// jsdom has no layout engine, so `Element.prototype.scrollIntoView` is absent
// (the shared setup stubs the sibling `scrollTo` for the same reason). The
// mobile-nav scrollspy effect calls it on the active tab during mount, which
// would otherwise throw and trip the route error boundary. Stub as a no-op,
// guarded so a real/per-test implementation wins.
beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

describe("SettingsPage save bar", () => {
  it("saves profile edits from the unified save bar (demo mode)", async () => {
    render(
      <TestProviders initialEntries={["/account/settings?pane=profile"]}>
        <SettingsPage />
      </TestProviders>,
    );
    // Edit the bio to make the page dirty. `findBy` (not `getBy`) awaits the
    // lazy `settings` i18n namespace chunk resolving — until it does the
    // placeholder renders as its raw key. Same convention as
    // AdminSettingsAccess.test.tsx.
    const bio = await screen.findByPlaceholderText("A few sentences about you…");
    fireEvent.change(bio, { target: { value: "New bio from settings" } });
    // Save bar appears.
    const save = await screen.findByRole("button", { name: /save changes/i });
    fireEvent.click(save);
    // Demo save is a local no-op that resolves: success toast shows, bar clears.
    expect(await screen.findByText("Settings saved")).toBeInTheDocument();
  });
});
