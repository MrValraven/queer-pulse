import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createControlledProfileEdit } from "../../test/ControlledProfileEdit";
import { useProfilePageSheets } from "./useProfilePageSheets";

/** Stands in for `ProfileSettingsMenu`'s "Hide me for 24h" row: one control
 *  that hands the hook the committed `hiddenUntil` and nothing else. */
function SelfHideToggle({
  currentHiddenUntil,
}: {
  currentHiddenUntil: string | null;
}) {
  const sheets = useProfilePageSheets();
  return (
    <button
      type="button"
      onClick={() => sheets.toggleHidden(currentHiddenUntil)}
    >
      hide me for 24h
    </button>
  );
}

function renderSelfHide(currentHiddenUntil: string | null = null) {
  const { handle, ControlledProfileEdit } = createControlledProfileEdit();
  render(
    <ControlledProfileEdit initialDraft={{ hiddenUntil: null }}>
      <SelfHideToggle currentHiddenUntil={currentHiddenUntil} />
    </ControlledProfileEdit>,
  );
  return handle;
}

const clickButton = (name: string) =>
  userEvent.click(screen.getByRole("button", { name }));

describe("useProfilePageSheets", () => {
  it("persists nothing when save is rebuilt while the draft has not taken the patch", async () => {
    const handle = renderSelfHide();

    // The draft commit is held back, so the very next render is one where
    // `save` has a new identity for a reason unrelated to this toggle: what
    // every one of the ~30 lazy i18n namespace loads does to `t`, and so to
    // `save`. Fired synchronously, with no macrotask in between, so the
    // rebuild lands in the window the toggle actually opens in the app.
    await clickButton("hold draft patches");
    fireEvent.click(screen.getByRole("button", { name: "hide me for 24h" }));
    fireEvent.click(screen.getByRole("button", { name: "rebuild save" }));

    // Persisting here would have PATCHed a draft with no `hiddenUntil` in it,
    // leaving the member reading as hidden with nothing actually stored.
    expect(handle.saveCalls).toEqual([]);
    expect(handle.latestDraft.hiddenUntil).toBeNull();
  });

  it("persists the 24h hide once the draft carries it", async () => {
    const handle = renderSelfHide();

    await clickButton("hide me for 24h");

    await waitFor(() => expect(handle.saveCalls).toHaveLength(1));
    const hiddenUntil = handle.saveCalls[0]?.draft.hiddenUntil;
    expect(hiddenUntil).toBeTruthy();
    expect(new Date(String(hiddenUntil)).getTime()).toBeGreaterThan(Date.now());
  });

  it("unhides a member who is currently hidden", async () => {
    const inOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const handle = renderSelfHide(inOneHour);

    await clickButton("hide me for 24h");

    await waitFor(() => expect(handle.saveCalls).toHaveLength(1));
    expect(handle.saveCalls[0]?.draft.hiddenUntil).toBeNull();
  });

  it("puts the previous value back when the save fails", async () => {
    const handle = renderSelfHide();
    handle.setSaveResult(false);

    await clickButton("hide me for 24h");

    await waitFor(() => expect(handle.saveCalls).toHaveLength(1));
    // The hide really was staged and attempted, so the assertion below is a
    // revert rather than a patch that never landed.
    expect(handle.saveCalls[0]?.draft.hiddenUntil).toBeTruthy();
    // The failed hide must not sit in the SHARED draft: the next save from any
    // other surface would ship it, hiding a member who was never hidden.
    await waitFor(() => expect(handle.latestDraft.hiddenUntil).toBeNull());
  });
});
