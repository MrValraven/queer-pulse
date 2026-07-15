import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SettingsPage } from "./SettingsPage";

describe("SettingsPage save bar", () => {
  it("saves profile edits from the unified save bar (demo mode)", async () => {
    render(
      <TestProviders initialEntries={["/account/settings?pane=profile"]}>
        <SettingsPage />
      </TestProviders>,
    );
    // Edit the bio to make the page dirty.
    const bio = screen.getByPlaceholderText("A few sentences about you…");
    fireEvent.change(bio, { target: { value: "New bio from settings" } });
    // Save bar appears.
    const save = await screen.findByRole("button", { name: /save changes/i });
    fireEvent.click(save);
    // Demo save is a local no-op that resolves: success toast shows, bar clears.
    expect(await screen.findByText("Settings saved")).toBeInTheDocument();
  });
});
